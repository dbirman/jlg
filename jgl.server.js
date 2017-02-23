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

  socket.on('disconnect', function(){logout(socket.id);});

  socket.on('login', function(msg) {login(socket.id,msg);});
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
    console.log('Logging in: ' + socket.id + ' for experiment ' + experiment);
    JGL.experiments[experiment].newExp(socket.id)
  } else {
    console.log('Subject: ' + socket.id )
  }
}

function logout(id) {
  try {
    console.log('Disconnection: ID ' + socket.id);
    // delete connected[socket.id];
    // disconnected[socket.id] = now(); // track server time, dispose of after 24 hours
  } catch(err) {
    console.log(err);
  }
}

function parseData(id,msg) {
  data[id].push(JGL.experiments[users[id].experiment].dataParse(msg));
}

function continueTrial(id) {
  // 
  var trialinfo = 0;
}

function sendTrialInfo(id,trialinfo) {
  // Send 
}

///////////////////////////////////////////////////////////////////////
//////////////////////// JGL FUNCTIONS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

var JGL = {}; // General experiment info, etc
var users = {}; // Which experiment a subject is in, which trial, etc
// var disconnected = {}; // Dead subjects
var data = {}; // Stores data from subjects

function endExp() {

}

function saveData() {
  
}

function tick() {
	saveData();
	garbage();

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

// function removeSubject() {
//   delete JGL[key];
//   delete data[key];
// }