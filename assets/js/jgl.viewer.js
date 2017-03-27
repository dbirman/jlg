// The server password is a hash stored in a secure file on the
// server. It doesn't get pushed to github. 
var socket = io();

$(document).ready(function() {launch();});

function launch() {
	document.addEventListener('keypress',keyPressed,false);

	socket.on('vlogin',function() {login();});
}

function login() {
	document.removeEventListener('keypress',keyPressed,false);
	console.log('Successful login to server');
}

var keys = '';
function keyPressed(event) {
	if (event.which==13) {
		var loginKey = md5(keys);
		keys = '';
		socket.emit('vlogin',loginKey);
	} else {
		keys+=event.key;
	}
}