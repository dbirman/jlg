// JGL Client-side code
// *You should not need to modify this*

// The JGL client-side code deals with modifying the exp.html page
// according to the current experiment, and running the client-side functions.
// It runs in "blocks" defined in the task list. After each block
// it sends data to the server, and upon completion of the experiment it
// closes all windows and shuts down MTurk (via opener.turk, and the mmturkey)
// plugin.

// A warning about JGL compared to MGL. JGL relies on a string of commands
// executing one after another. There is no "controller" calling the different
// functions. In other words--if a function you write is very slow or crashes
// then the entire system will crash.

// var socket = io();

// socket.on('startTrial', function(msg) {
// 	startTrial(msg);
// });

///////////////////////////////////////////////////////////////////////
//////////////////////// JGL FUNCTIONS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

$(document).ready(function() {launch();});

var divList = ['error'];

var task; // task structure created by experiment code
var jgl = {}; // stuff that gets tracked (worker id, etc)

function launch() {
	getExperiment(); // load the experiment from the query string
	if (!debug) {getAmazonInfo();}
	loadExperiment();
	setTimeout(function() {
		loadTask_();
		updateFromServer();
		if (debug) {start();}
	},100);
}

var exp, debug;
var callbackActive = [];

function getExperiment() {
	debug = getQueryVariable('debug');
	debug = debug=='true';
	exp = getQueryVariable('exp');    
	if (exp==undefined) {
		error('noexp');
		return;
	}
}

function getAmazonInfo() {
	// these are NOT accessible to the server!
	jgl.assignmentId = opener.assignmentId;
	jgl.workerId = opener.workerId;
	// only the hash and hit ID are sent to the server--perfect anonymity, even across experiments
	jgl.hash = md5(jgl.workerId + exp);
	jgl.hitId = opener.hitId;
}

function loadExperiment() {
	// Load experiment code
	$.getScript(exp+'/'+exp+'.client.js');
	// Load experiment divs
	$.get(exp+'/'+exp+'.html', function(data) {$(document.body).append(data);})
}

function updateFromServer() {
	if (debug) {
		jgl.curBlock = 0;
		jgl.curTrial = 0;
	} else {
		console.log('not implemented');
		// warning: experiment won't start until it receives notice
		// that the server is properly connected!
		setTimeout(checkServerStatus,10000);
	}
}

function hideAll() {
	for (var div in divList) {
		$("#"+div).hide();
	}
}

function start() {
	startBlock_();
}

function error(type) {
	hideAll();
	$("#error").show();
	switch (type) {
		case 'noexp':
			$("#error-text").text('An error occurred: no experiment was specified in the html query string. Please send this error to the experimenter (gruturk@gmail.com).');
			break;
		default:
			$("#error-text").text('An unknown error occured.');
	}
}

///////////////////////////////////////////////////////////////////////
//////////////////////// DEFAULT CODE ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function submitConsent() {

}

function loadTask_() {
	task = [];
	// Run the user defined function
	loadTask();
}

///////////////////////////////////////////////////////////////////////
//////////////////////// INITIALIZERS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function initialize_consent() {

}

function initialize_trial() {

}

///////////////////////////////////////////////////////////////////////
//////////////////////// CALLBACKS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

// All JGL callbacks have an underscore, client callbacks are stored in the callbacks object
function startBlock_(task) {
	// run standard code

	// run the experiment callback if necessary
	if (callbacks.startBlock) {task = callbacks.startBlock(task);}
	return task;
}

function endBlock_(task) {
	// run standard code

}

function startTrial_(task) {

}

function startSegment_(task) {

}

function updateScreen_(task) {

}

function getResponse_(task) {
	// called by the event listener on the canvas during trials
}