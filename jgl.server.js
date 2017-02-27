// JGL Server side code
// * You should not need to modify this *

// The JGL server deals with saving data, tracking participants, and
// passing files to the client-side code. This uses node, express, and 
// socket.io

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

  socket.on('disconnect', function() {logout(socket.id);});

  socket.on('login', function(msg) {try {login(socket.id,msg);} catch(err) {console.log(err);}});
});

var port = 8080;
http.listen(port, function(){
  console.log('Server live on *: ' + port);
  tick();
});

//////////////////////////////////////////////////////////////////////////////
//////////////////////// CONNECTION FUNCTIONS ////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function login(id,msg) {
  msg = msg.split('.');
  var experiment = msg[0]; // name of experiment

  // check if experiment is available
  if (JGL.experiments[experiment]!=undefined) {
    console.log('Logging in: ' + socket.id ' for experiment ' + experiment);
    JGL.experiments[experiment].newExp(socket.id)
  } else {
    
  }
}

function logout(id) {
  console.log('Disconnection: ID ' + socket.id);
}

///////////////////////////////////////////////////////////////////////
//////////////////////// JGL FUNCTIONS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

var JGL = {};

function saveData() {
  
}

function tick() {
	saveData();
	garbageCollect();

	setTimeout(tick,60000); // repeat every minute
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////// GARBAGE FUNCTIONS ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function garbage() {
  // var dkeys = Object.keys(disconnect);
  // for (var key in disconnected) {
  //   // this officially removes someone from the study
  //   if ((now() - disconnected[key]) > 86400) {removeSubject(key);}
  // }

}

function removeSubject() {
  delete disconnected[key];
  delete JGL[key];
  delete data[key];
}