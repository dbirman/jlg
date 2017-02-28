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
	loadTemplate();
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
	if (!debug) {
		jgl.assignmentId = opener.assignmentId;
		jgl.workerId = opener.workerId;
		// only the hash and hit ID are sent to the server--perfect anonymity, even across experiments
		jgl.hash = md5(jgl.workerId + exp);
		jgl.hitId = opener.hitId;
	} else {
		jgl.assignmentId = 'debug';
		jgl.workerId = 'debug' + Math.random()*10000;
		jgl.hash = md5(jgl.workerId + exp);
		jgl.hitId = 'debug';
	}
}

function loadTemplate() {
	var tempList = ['consent','trial'];
	for (var i=0;i<tempList.length;i++) {
		$.get('assets/templates/'+tempList[i]+'.html', function(data) {$('#content').append(data);})
	}
}

function loadExperiment() {
	// Load experiment code
	$.getScript(exp+'/'+exp+'.client.js');
	// Load experiment divs
	$.get(exp+'/'+exp+'.html', function(data) {$(document.body).append(data);})
}

function updateFromServer() {
	if (debug) {
		jgl.curBlock = -1; // -1 before starting
		jgl.curTrial = -1; // -1 before starting
	} else {
		console.log('not implemented');
		// warning: experiment won't start until it receives notice
		// that the server is properly connected!
		setTimeout(checkServerStatus,10000);
	}
}

function hideAll() {
	for (var di in divList) {
		var div = divList[di];
		$("#"+div).hide();
	}
}

function start() {
	jgl.task = startBlock_(jgl.task);
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

function consentEnd() {
	jgl.task = endBlock_(jgl.task);
}

function processTask(task) {
	for (var ti=0;ti<task.length;ti++) {
		if (task[ti].type!=undefined) {
			divList.push(task[ti].type);
		}
		// setup trials
		task[ti].trials = [];
		for (var i=0;i<task[ti].numTrials;i++) {
			task[ti].trials[i] = {};
			// RESPONSE WATCH
			task[ti].trials[i].response = task[ti].response;
			// BLOCK RANDOMIZATION (setup parameters)
			if (task[ti].parameters!=undefined) {
				console.log('WARNING: Block randomization is not implemented. Using equal probabilities.');
				var params = Object.keys(task[ti].parameters);
				for (var pi=0;pi<params.length;pi++) {
					task[ti].trials[i][params[pi]] = randomElement(task[ti].parameters[params[pi]]);
				}
			}
			// VARIABLES
			if (task[ti].variables!=undefined) {
				var vars = Object.keys(task[ti].variables);
				for (var vi=0;vi<vars.length;vi++) {
					task[ti].trials[i][vars[vi]] = NaN;
				}
			}
			// SEGMENT TIMING (setup timing)
			if (task[ti].seglen!=undefined) {
				// seglen overrides min/max
				task[ti].trials[i].seglen = task[ti].seglen;
			} else if (task[ti].segmin!=undefined) {
				if (task[ti].segmax==undefined) {error('An error occurred: segment maximum was not defined');}
				else {
					task[ti].trials[i].seglen = [];
					task[ti].trials[i].length = 0;
					for (var si=0;si<task[ti].segmin.length;si++) {
						if (task[ti].segmin[si]==task[ti].segmax[si]) {
							task[ti].trials[i].seglen[si] = task[ti].segmax[si];
						} else {
							task[ti].trials[i].seglen[si] = task[ti].segmin[si] + Math.random()*(task[ti].segmax[si]-task[ti].segmin[si]);
						}
						task[ti].trials[i].length += task[ti].trials[i].seglen[si];
					}
				}
			}
		}
	}
	return task;
}

function loadTask_() {
	// Run the user defined function
	jgl.task = loadTask();
	// Take the task and process it
	jgl.task = processTask(jgl.task);
}

///////////////////////////////////////////////////////////////////////
//////////////////////// CALLBACKS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function endExp_(task) {
	console.log('experiment complete');
}

// All JGL callbacks have an underscore, client callbacks are stored in the callbacks object
function startBlock_() {
	// increment block
	jgl.curBlock++;
	jgl.curTrial = -1;

	// Check if we need to end the experiment
	if (jgl.curBlock>jgl.task.length) {
		task = endExp_(task);
		return task;
	}

	// Setup the block
	jgl.callbacks = task[jgl.curBlock].callbacks;
	hideAll();
	$("#"+task[jgl.curBlock].type).show();

	// run the experiment callback if necessary
	if (jgl.callbacks.startBlock) {jgl.callbacks.startBlock();}

	if (task[jgl.curBlock].type=='trial') {
		// trials use the update_() code and a canvas to render
		// set up canvas
		jgl.canvas = document.getElementById("canvas");
		jgl.ctx = jgl.canvas.getContext("2d");
	} else {
		switch (task[jgl.curBlock].type) {
			// Anything that isn't a trial/canvas just waits for a submit function
			// (these could be instructions, forms, surveys, whatever)
			case 'consent':
				jgl.endBlockFunction = consentEnd;
				break;
			default:
				if (task[jgl.curBlock].endBlockFunction==undefined) {error('An error occurred: no endblock function was defined, this task will never end');}
				jgl.endBlockFunction = task[jgl.curBlock].endBlockFunction;
		}
	}

	if (task[jgl.curBlock].canvas==1) {
		jgl.timing.block = now();
		elapsed();
		update_();
	}
}

function update_() {
	var t = elapsed(); // get elapsed time
	// Check first trial
	if (jgl.curTrial==-1) {startTrial_();}
	// Check next trial
	if ((now()-jgl.timing.trial)>jgl.trial.length) {startTrial_();}
	// Check next segment
	if ((now()-jgl.timing.segment)>jgl.trial.seglen[jgl.trial.thisseg]) {startSegment_();}

	// Update screen
	updateScreen_();

	jgl.tick = requestAnimationFrame(update_);
}

function endBlock_(task) {
	// run standard code
	if (jgl.tick!=undefined) {cancelAnimationFrame(jgl.tick);}

	// start the next block
	task = startBlock_(task);
	//
	return task;
}

function startTrial_() {
	jgl.curTrial++;
	if (jgl.curTrial>=task[jgl.curBlock].numTrials) {endBlock_();return}
	// Run trial:
	jgl.timing.trial = now();
	console.log('Starting trial: ' + trial);
	jgl.trial = task[jgl.curBlock].trials[trial];

	// Start the segment immediately
	jgl.trial.thisseg = -1;
	startSegment_();

	if (callbacks.startTrial) {callbacks.startTrial();}
}

function startSegment_(task) {
	jgl.trial.thisseg++;

	jgl.timing.segment = now();

	if (callbacks.startSegment) {callbacks.startSegment();}
}

function updateScreen_() {

	if (callbacks.updateScreen) {callbacks.updateScreen();}
}

function getResponse_(event) {
	// called by the event listener on the canvas during trials

	if (callbacks.getResponse) {callbacks.getResponse(event);}
}