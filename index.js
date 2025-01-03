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
  res.sendFile('test.html', { root: __dirname });
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

socket.on('throttle',function(target,value) {
	// target is the REG entry for the locomotive.
	// value is a 7 bit value for speed. 1st bit is direction, remaning 7 are the 128 speed steps.
	console.log(" Throttle request received with target:"+target.toString()+" and value:"+buffer.toString())
	var buffer = Buffer.from([0x3F,value]);
	console.log(" Throttle request submitted to target:"+target.toString()+" and message:"+buffer.toString())
	sendI2c(target,buffer);
});

socket.on('eStop',function() {
	var target = 0x00;
	console.log(" Throttle request received with target:"+target.toString()+" and value:"+buffer.toString())
	var buffer = Buffer.from([0x3F,0X01]);
	console.log(" Throttle request submitted to target:"+target.toString()+" and message:"+buffer.toString())
	sendI2c(target,buffer);
});

socket.on('lights',function(target,value) {
	// target is the REG entry for the locomotive.
	// value is true (lights on) or false (lights off)
	console.log(" Light request received with target:"+target.toString()+" and value:"+buffer.toString())
	if(value){
		var buffer = Buffer.from([0x9F]);
		console.log(" Lights on for target:"+target.toString())
		sendI2c(target,buffer);
	} else {
		var buffer = Buffer.from([0x80]);
		console.log(" Lights off for target:"+target.toString())
		sendI2c(target,buffer);
	} 
});

  //Whenever someone disconnects this piece of code is executed
  socket.on('disconnect', function () {
    console.log('[' + new Date().toLocaleString('en-us') + '] [on disconnect] - '+'A user disconnected');
	socket.removeAllListeners();
  });

});


// *******************************************
// *  Utility Functions

function buttonTouch(msg){
	io.emit('message',msg);
	console.log('[' + new Date().toLocaleString('en-us') + '] [on buttonTouch] - '+'sending button push message.');
	
}

function sendI2c(target,message){
// target is the dcc address to be set.)
// message is a buffer object to send.	

	const i2c1 = i2c.openSync(1);
    i2c1.writeI2cBlockSync(PIC_ADDR, target, message.length, message);
	i2c1.closeSync();
}


// *********************************************
// *   start the app. 
http.listen(port, function(){
  console.log('[' + new Date().toLocaleString('en-us') + '] [http startup] - '+'listening on *:' + port);
});
