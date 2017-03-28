// The server password is a hash stored in a secure file on the
// server. It doesn't get pushed to github. 
var socket = io();

$(document).ready(function() {launch();});

function launch() {
	document.addEventListener('keypress',keyPressed,false);

	$("#experiments").append("\<h2 id=\"login\"\>Please log in\</h2\>");
	socket.on('vlogin',function() {login();});

	socket.on('vJGL', function(jgl) {parseJGL(jgl);});
	socket.on('vinfo',function(info) {parseInfo(info);});

	tick();
}

function tick() {
	getInfo();

	setTimeout(tick,5000);
}

function login() {
	document.removeEventListener('keypress',keyPressed,false);
	console.log('Successful login to server');
	$("#experiments").html("");
	populate();
}

function parseJGL(jgl) {
	$("#experiments").html("");
	var exps = Object.keys(jgl);
	for (var e=0;e<exps.length;e++) {
		var exp = jgl[exps[e]];
		$("#experiments").append("\<h4\>"+exps[e]+ " is active\</h4\>");
		var ids = Object.keys(exp);
		for (var i=0;i<ids.length;i++) {
			var status = exp[ids[i]].connect ? 'connected' : 'disconnected',
				block = exp[ids[i]].block;
			$("#experiments").append("\<p\>"+ids[i]+ " is "+status+" on block "+block+"\</p\>");
		}
	}
}

function parseInfo(info) {
	$("#connections").html("");
	var ids = Object.keys(info);
	for (var i=0;i<ids.length;i++) {
		if (info[ids[i]]===true) {
			$("#connections").append("\<h4\>"+ids[i]+ " connected as\</h4\>\<p\>server viewer\</p\>");
		} else {
			$("#connections").append("\<h4\>"+ids[i]+ " connected as\</h4\>\<p\>participant in "+info[ids[i]].experiment+"\</p\>");

		}
	}
}

function populate() {
	// $("#controls").append("<button type=\"button\" id=\"getinfo\" class=\"btn btn-primary btn-lg\" onclick=\"getInfo();\">Get info</button>");
}

function getInfo() {
	socket.emit('vinfo');
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