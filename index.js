var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
// requires node packages: express and socket.io
const i2c = require('i2c-bus');

const PIC_ADDR = 0x21;
const DCC_REG = 0x00;


// configure additional node packages / components..


// ************************************
// *   set up the app
app.get('/', function(req, res){
  res.sendFile('main.html', { root: __dirname });
//  console.log('[' + new Date().toLocaleString('en-us') + '] [app get] - '+'HTML sent to client');
});


//Whenever someone connects this gets executed
io.on('connection', function(socket){
  console.log('[' + new Date().toLocaleString('en-us') + '] [on connection] - '+'A user connected');

// Different socket command received from web 
socket.on('button', function(toggle) {
	if (toggle=="on") {
		console.log("A button was pushed");	
	}else {
		console.log("A button was released");	
	}
}); 

socket.on('throttle128',function(target,value) {
	// target is the REG entry for the locomotive.
	// value is a 7 bit value for speed. 1st bit is direction, remaning 7 are the 128 speed steps.
	console.log(" Throttle request received with target:"+target.toString()+" and value:"+value.toString())
	var message = [0x3F,parseInt(value)];
	sendI2c(target,message);
});

socket.on('throttle',function(target,value) {
	// target is the REG entry for the locomotive.
	console.log(" Throttle request received with target:"+target.toString()+" and value:"+value.toString())
	var message = [parseInt(value)];
//	console.log(" Throttle request submitted to target:"+target.toString()+" and message:"+message.toString());
	sendI2c(target,message);
});

socket.on('eStop',function() {
	var target = 0x00;
	console.log(" eStop Received")
	var message =[0x3F,0x01];
	sendI2c(target,message);
});

socket.on('lights',function(target,value) {
	// target is the REG entry for the locomotive.
	// value is true (lights on) or false (lights off)
	console.log(" Light request received with target:"+target.toString()+" and value:"+value.toString())
	if(value){
		var msg = [0x9F]; //on
		console.log(" Lights on for target:"+target.toString())
	} else {
		var msg = [0x80]; //off
		console.log(" Lights off for target:"+target.toString())
	}
	sendI2c(target,msg);
});
socket.on('command',function(target,value) {
	// target is the REG entry for the locomotive.
	// value is true (lights on) or false (lights off)
	console.log(" Command request received with target:"+target.toString()+" and value:"+value.toString())

	sendI2c(target,value);
});

socket.on('setAddr',function(target, addr) {

	console.log("setAddr request received for address::"+target.toString()+" to address: "+addr.toString());
	add1 =parseInt(target);
	add2 =parseInt(addr);
	setAddr(add1,add2);
});

socket.on('setCV',function(addr, value) {
	// target is the REG entry for the locomotive.
	// addr is 2 byte array, indicating the 10 bit address of the CV to be set.
	// form should be 000000AA AAAAAAAA.
	// value is the byte value to set in that variable.
	console.log(" SETCV request received with address: "+addr.toString()+" and value:"+value.toString())
	//var cmd = 0x7C  // command starts with bits 0111 11AA for CV Direct write.  AA are the 2 most significant address bits.
	var cmd = 0xEC  // command starts with bits 1110 11AA for CV Direct write.  AA are the 2 most significant address bits.
	
	addr[0] = (addr[0]&0x03);  // mask first 6 bits just in case. (expected to be 0's.)
	cmd = (cmd^addr[0]);	// combine with cmd to complete cmd.
	msg = [cmd,addr[1],parseInt(value)];
	sendServiceModeCommand(cmd,msg);
});

socket.on('verifyCV',function(target, addr, value) {
	// target is the REG entry for the locomotive.
	// addr is 2 byte array, indicating the 10 bit address of the CV to be set.
	// form should be 000000AA AAAAAAAA.
	// value is the byte value to verfified in that variable.
	console.log(" SETCV request received with target:"+target.toString()+"address: "+addr.toString()+" and value:"+value.toString())
	var cmd = 0x74  // command starts with bits 0111 01AA for CV Direct verify.  AA are the 2 most significant address bits.
	addr[0] = (addr[0]&0x03);  // mask first 6 bits just in case. (expected to be 0's.)
	cmd = (cmd^addr[0]);	// combine with cmd to complete cmd.
	msg = [cmd,addr[1],parseInt(value)];
	sendServiceModeCommand(target,msg);
});


  //Whenever someone disconnects this piece of code is executed
  socket.on('disconnect', function () {
    console.log('[' + new Date().toLocaleString('en-us') + '] [on disconnect] - '+'A user disconnected');
	socket.removeAllListeners();
  });

});


// *******************************************
// *  Utility Functions

function SendMessage(msg){
	io.emit('message',msg);
	console.log('[' + new Date().toLocaleString('en-us') + '] [on buttonTouch] - '+'sending button push message.');

}

function intToHex(num){
	return num.toString(16).padStart(2,'0');
}

function sendI2c(target,message){
// target is the dcc address to be set.)
// message is a buffer object to send.	

	const i2c1 = i2c.openSync(1);
	//convert the target received from a  string representation of hex value into a byte.
	reg = parseInt(target, 16);
	var retval = false;
	//convert the message received from byte array to buffer
	const buffer = Buffer.from(message);
    console.log('Sending i2c. Target: '+reg+' Message: '+buffer.toString()+' Length: '+buffer.length);
    i2c1.writeI2cBlock(PIC_ADDR, reg, buffer.length, buffer, (err, bytesWritten, buffer) => {
		if (err) {
		  console.log('[' + new Date().toLocaleString('en-us') + '] [ERROR] - '+err);
		  SendMessage(`[${new Date().toLocaleString('en-us')}] Command failed to send.`);
		} else {
		SendMessage(`[${new Date().toLocaleString('en-us')}] Command sent: ${bytesWritten} bytes written: ${buffer.toString()}`);
		console.log(`[${new Date().toLocaleString('en-us')}] [sendI2c] - ${bytesWritten} bytes written`);
		retval=true
		}
	}
	);
	i2c1.closeSync();
	//return retval;
}

function sendServiceModeCommand(target,msg){
//send 3 or more reset packages
  for(let i=0; i <4; i++){
	sendI2c(0x00,[0x00]);
  }
// send 5 or more writes
  for(let i=0; i <5; i++){
	sendI2c(target,msg);
  }
//send 6 or more Write or Reset packets.
  for(let i=0; i <6; i++){
	sendI2c(target,msg);
  }
// not part of spec - send another reset.
sendI2c(0x00,[0x00]);
// not part of spec.  non Service mode command exits service mode. Send light on.
sendI2c(0x00, [0x9F]);
}

function setAddr(add1,add2){
	//send 3 or more reset packages
	for(let i=0; i <4; i++){
		sendI2c("00",[0x00]);
	  }
	// send 5 or more Page Preset Packets.
	  for(let i=0; i <7; i++){
		sendI2c("7d",[0x01]);
	  }
	//send 6 or more Reset packets.
	  for(let i=0; i <8; i++){
		sendI2c("00",[0x00]);
	  }
	//send 3 more Reset packets.
	  for(let i=0; i <4; i++){
		sendI2c("00",[0x00]);
	  }
	  //send 5 or more write packets.
	  for(let i=0; i <6; i++){
		sendI2c("78",[add2]);
	  }
	  //send 10 or more write or restet packets.
	  for(let i=0; i <11; i++){
		sendI2c("78",[add2]);
	  }
}



// *********************************************
// *   start the app. 
http.listen(port, function(){
  console.log('[' + new Date().toLocaleString('en-us') + '] [http startup] - '+'listening on *:' + port);
});
