var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
// requires node packages: express and socket.io


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
		buttonTouch();
	}else {
		console.log("A button was released");	
	}
}); 

socket.on('slider', function(toggle) {
	if (toggle=="on") {
		console.log("A button was pushed");	
		buttonTouch();
	}else {
		console.log("A button was released");	
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

function buttonTouch(){
	io.emit('message',"A button was pushed!");
	console.log('[' + new Date().toLocaleString('en-us') + '] [on buttonTouch] - '+'sending button push message.');
	
}


// *********************************************
// *   start the app. 
http.listen(port, function(){
  console.log('[' + new Date().toLocaleString('en-us') + '] [http startup] - '+'listening on *:' + port);
});
