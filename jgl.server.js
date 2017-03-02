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

  socket.on('disconnect', function() {try {logout(socket.id);} catch(err) {console.log(err);}});

  socket.on('login', function(msg) {try {login(socket.id,msg);} catch(err) {console.log(err);}});

  socket.on('check', function() {try {io.to(socket.id).emit('check','');} catch(err) {console.log(err);}});

  socket.on('update', function() {try {update(socket.id);} catch(err) {console.log(err);}});

  socket.on('data', function(data) {try {data(socket.id,data);} catch(err) {console.log(err);}});

  socket.on('block', function(block) {try {block(socket.id,block);} catch(err) {console.log(err);}});
});

var port = 8080;
http.listen(port, function(){
  console.log('Server live on *: ' + port);
  tick();
});

// //////////////////////////////////////////////////////////////////////////////
// //////////////////////// CONNECTION FUNCTIONS ////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////

function login(id,msg) {
  console.log('Connection: ID ' + id);
  // Login is exp.hash

  msg = msg.split('.');
  var experiment = msg[0], // name of experiment
    hash = msg[1];

  // Save info by socket id so we can pull it up later if we need to
  info[id] = {experiment:experiment,hash:hash};

  // check if experiment is available
  if (JGL[experiment]==undefined) {
    JGL[experiment] = {};
  }
  // check for existing state
  if (JGL[experiment][hash]==undefined) {
    // participant has never done this experiment before
    JGL[experiment][hash] = {}
    JGL[experiment][hash].connected = true;
    JGL[experiment][hash].block = -1;
    JGL[experiment][hash].data = [];
  } else {
    // participant already started experiment and is re-connecting
    JGL[experiment][hash].connected = true;
    console.log('Sending start signal to ' + ID + ' for block ' + JGL[experiment][hash].block);
  }

  io.to(id).emit('update',JGL[experiment][hash].block); // send the client its block state
}

function logout(id) {
  console.log('Disconnection: ID ' + id);

  if (info[id]!=undefined) {
    JGL[info[id].experiment][info[id].hash].connected = false;
  }
}

function update(id) {
  if (info[id]!=undefined) {
    console.log('Sending update info: ID ' + id);
    var block = JGL[info[id].experiment][info[id].hash].block;
  }
}

function data(id,data) {
  console.log('ID ' + id + ' sent data for their current block');
  if (JGL[experiment][hash].data.length != JGL[experiment][hash].block) {
    console.log('WARNING: ' + id + ' sent data without incrementing their block counter');
  }
  JGL[experiment][hash].data.push(data);
}

function block(id,block) {
  console.log('ID ' + id + ' is starting block '+ block);
  JGL[experiment][hash].block = block;
}

// ///////////////////////////////////////////////////////////////////////
// //////////////////////// JGL FUNCTIONS ////////////////////////////////
// ///////////////////////////////////////////////////////////////////////

var JGL = {};
var info = {};

function saveState() {
  // Save the state of the JGL object but NOT the data: key for a correct shutdown
}

function saveData() {
  // Go through all of the existing data and save it--remove data as you go (important for keeping overhead low)
}

function tick() {
  saveData();

  setTimeout(tick,60000); // repeat every minute
}
// ///////////////////////////////////////////////////////////////////////
// //////////////////////// HELPERS ////////////////////////////////
// ///////////////////////////////////////////////////////////////////////

var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}