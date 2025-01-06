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
	//convert the message received from byte array to buffer
	const buffer = Buffer.from(message);
    console.log('Sending i2C. Target: '+target+' Message: '+message+ ' Length: '+message.length);
    console.log('Sending i2c. Target: '+reg+' Message: '+buffer.toString()+' Length: '+buffer.length);
    i2c1.writeI2cBlock(PIC_ADDR, reg, buffer.length, buffer, (err, bytesWritten, buffer) => {
		if (err) {
		  console.log('[' + new Date().toLocaleString('en-us') + '] [ERROR] - '+err);
		  SendMessage(`[${new Date().toLocaleString('en-us')}] Command failed to send.`);
		} else {
		SendMessage(`[${new Date().toLocaleString('en-us')}] Command sent: ${bytesWritten} bytes written: ${buffer.toString()}`);
		console.log(`[${new Date().toLocaleString('en-us')}] [sendI2c] - ${bytesWritten} bytes written`);
		}
	}
	);
	i2c1.closeSync();
}


// *********************************************
// *   start the app. 
http.listen(port, function(){
  console.log('[' + new Date().toLocaleString('en-us') + '] [http startup] - '+'listening on *:' + port);
});
