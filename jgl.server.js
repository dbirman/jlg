// Requirements
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// GET function
app.get( '/*' , function( req, res ) {
    // this is the current file they have requested
    var file = req.params[0]; 
    // console.log('\t :: Express :: file requested: ' + file);    

    // give them what they want
    res.sendfile("./" + file);
}); 


io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);

  socket.on('disconnect', function(){
  	try {
	    console.log('user disconnected');
	    taDisconnect(socket.id);
  	} catch(err) {
  		console.log(err);
  	}
  });
});

var port = 8080;
http.listen(port, function(){
  console.log('Server live on *: ' + port);
  tick();
});

///////////////////////////////////////////////////////////////////////
//////////////////////// JGL FUNCTIONS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

var JGL = {}; // Track subject info over time
var activeExp = {}; // Track a subject's current experiment
var data = {}; // 

function saveData() {

}

function garbageCollect() {

}

function tick() {
	saveData();
	garbageCollect();

	setTimeout(tick,60000);
}