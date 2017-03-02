// JGL Client-side code
// *You should not need to modify this*

// The JGL client-side code deals with modifying the exp.html page
// according to the current experiment, and running the client-side functions.
// It runs in "blocks" defined in the task list. After each block
// it sends data to the server, and upon completion of the experiment it
// closes all windows and shuts down MTurk (via opener.turk, and the mmturkey)
// plugin.

// A warning about JGL compared to MGL. JGL strings commands together at times--but they operate asynchronously:
// i.e. if you call a function from within a function, there is no guarantee that the inner function returns before
// the outer one continues. Keep this in mind when you write your code :)

var socket = io();

///////////////////////////////////////////////////////////////////////
//////////////////////// JGL FUNCTIONS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

$(document).ready(function() {launch();});

var divList = ['error'];

var task; // task structure created by experiment code
var jgl = {}; // stuff that gets tracked (worker id, etc)

function launch() {
	initJGL();
	loadTemplate();
	getExperiment(); // load the experiment from the query string
	getAmazonInfo();
	loadExperiment();
	setTimeout(function() {
		loadTask_();
		updateFromServer(); // this also starts the experiment
		if (debug==1) {start();}
	},1000);
}

var exp, debug;
var callbackActive = [];

function getExperiment() {
	debug = Number(getQueryVariable('debug'));
	exp = getQueryVariable('exp');    
	if (exp==undefined) {
		error('noexp');
		return;
	}
}

function initJGL() {
	jgl.timing = {};
	jgl.live = false;
	jgl.serverConnected = -1;
}

function getAmazonInfo() {
	// these are NOT accessible to the server!
	if (debug==0) {
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

function submitHIT() {
	if (debug) {
		error('Normally the HIT would now be submitted');
		return
	}
	if (opener==undefined) {
		error('You did not keep the Amazon MTurk page open. Please re-open the HIT on MTurk and start again--it will take you directly to the final page and allow you to submit');
		return
	}
	// Otherwise, communicate with the server and submit
}

function loadTemplate() {
	var tempList = ['complete'];
	for (var i=0;i<tempList.length;i++) {
		addDiv(tempList[i]);
	}
}

function loadExperiment() {
	// Load experiment code
	$.getScript(exp+'/'+exp+'.client.js');
	// Load experiment divs
	$.get(exp+'/'+exp+'.html', function(data) {$(document.body).append(data);})
}

function updateFromServer() {
	if (debug==1) {
		jgl.curBlock = -1; // -1 before starting
		jgl.curTrial = -1; // -1 before starting
	} else {
		console.log('Attempting server connection');
		socket.emit('login',exp+'.'+jgl.hash);
		checkServerStatus();
	}
}

socket.on('update', function(msg) {
	console.log('Server connection succeeded currently at block ' + Number(msg));
	// Format is block
	// msg = msg.split('.');
	jgl.curBlock = Number(msg); //[0];
	jgl.curTrial = -1; // we only send data per block, so we're stuck re-starting at the first trial
	start();
});

socket.on('check', function() {
	jgl.serverConnected = true;
});

function checkServerStatus() {
	if (!jgl.serverConnected) {
		alert('The server appears to be disconnected. Data from the current block will not be saved. Please re-connect via MTurk--if this persists please e-mail gruturk@gmail.com');
	}
	jgl.serverConnected = false;
	socket.emit('check');

	setTimeout(checkServerStatus,10000);
}

function hideAll() {
	for (var di in divList) {
		var div = divList[di];
		$("#"+div).hide();
	}
}

function start() {
	console.log('Experiment starting');
	jgl.timing.experiment = now();
	jgl.live = true;
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
			$("#error-text").text('An error occurred: ' + type);
	}
}

///////////////////////////////////////////////////////////////////////
//////////////////////// DEFAULT CODE ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function consentEnd() {
	endBlock_(jgl.task);
}

function completeEnd() {
	submitHIT();
}

function addDiv(div) {
	console.log('Adding div: ' + div);
	divList.push(div);
	$.get('assets/templates/'+div+'.html', function(data) {$('#content').append(data);});
}

function processTask(task) {
	for (var ti=0;ti<task.length;ti++) {
		if (task[ti].type!=undefined) {
			if (divList.indexOf(task[ti].type)==-1) {
				addDiv(task[ti].type);
			}
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
	task.push({type:'complete',callbacks:{}});
}

function loadTask_() {
	// Run the user defined function
	jgl.task = loadTask();
	// Take the task and process it
	processTask(jgl.task);
}

function setupCanvas() {
	jgl.canvas = document.getElementById("canvas");
	jgl.canvas.width = window.innerWidth;
	jgl.canvas.height = window.innerHeight;
	jgl.ctx = jgl.canvas.getContext("2d");
	console.log('remove when real visual angle coordinates est');
	jgl.canvas.pixPerDeg = 40;
	jgl.canvas.background = 0.5;
	jglVisualAngleCoordinates();
	// Add event listeners
	if (jgl.task[jgl.curBlock].keys!=undefined) {document.addEventListener('keydown',keyEvent,true);}
	if (jgl.task[jgl.curBlock].mouse!=undefined) {document.addEventListener('click',clickEvent,true);}
}

///////////////////////////////////////////////////////////////////////
//////////////////////// EVENT HANDLERS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function keyEvent(event) {
	if (event.which==32) {event.preventDefault();} // block spacebar from dropping

	jgl.event.key = {};
	jgl.event.key.keyCode = event.which;

	getResponse_(jgl.task);
}

function clickEvent(event) {
	jgl.event.mouse = {};

  var rect = jgl.canvas.getBoundingClientRect(), // abs. size of element
    scaleX = jgl.canvas.width / rect.width,    // relationship bitmap vs. element for X
    scaleY = jgl.canvas.height / rect.height;  // relationship bitmap vs. element for Y

  jgl.event.mouse.x =  (event.clientX - rect.left) * scaleX;  // scale mouse coordinates after they have
  jgl.event.mouse.y =  (event.clientY - rect.top) * scaleY;    // been adjusted to be relative to element

  jgl.event.mouse.shift = event.shiftKey;

  getResponse_(jgl.task);
}

///////////////////////////////////////////////////////////////////////
//////////////////////// CALLBACKS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function endExp_() {
	console.log('Experiment complete');
}

// All JGL callbacks have an underscore, client callbacks are stored in the callbacks object
function startBlock_() {
	// increment block
	jgl.curBlock++;
	if (!debug) {socket.emit('block',jgl.curBlock);}
	jgl.curTrial = -1;

	// Check if we need to end the experiment
	if (jgl.curBlock>=(jgl.task.length)) {endExp_(); return}

	jgl.live = true;

	// Setup the block
	jgl.callbacks = jgl.task[jgl.curBlock].callbacks;
	hideAll();
	$("#"+jgl.task[jgl.curBlock].type).show();

	// run the experiment callback if necessary
	if (jgl.callbacks.startBlock) {jgl.callbacks.startBlock(jgl.task);}

	if (jgl.task[jgl.curBlock].type=='trial') {
		// trials use the update_() code and a canvas to render
		// set up canvas
		setupCanvas();
	} else {
		switch (jgl.task[jgl.curBlock].type) {
			// Anything that isn't a trial/canvas just waits for a submit function
			// (these could be instructions, forms, surveys, whatever)
			case 'consent':
				jgl.endBlockFunction = consentEnd;
				break;
			case 'complete':
				jgl.endBlockFunction = completeEnd;
				break;
			default:
				if (jgl.task[jgl.curBlock].endBlockFunction==undefined) {error('An error occurred: no endblock function was defined, this block will never end');}
				jgl.endBlockFunction = jgl.task[jgl.curBlock].endBlockFunction;
		}
	}

	if (jgl.task[jgl.curBlock].type=='trial' || jgl.task[jgl.curBlock].canvas==1) {
		jgl.timing.block = now();
		elapsed();
		jgl.tick=-1;
		update_();
	}
}

function update_() {
	if (!jgl.live) {return}

	var cblock = jgl.curBlock;
	var t = elapsed(); // get elapsed time
	// Check first trial
	if (jgl.curTrial==-1) {startTrial_();}
	// Check next trial
	if ((now()-jgl.timing.trial)>jgl.trial.length) {startTrial_();}
	// Next trial may have shut down the block, check this
	if (cblock != jgl.curBlock) {return}
	// Check next segment
	if ((now()-jgl.timing.segment)>jgl.trial.seglen[jgl.trial.thisseg]) {startSegment_();}

	// Update screen
	updateScreen_(jgl.task,t);

	jgl.tick = requestAnimationFrame(update_);
}

function endBlock_() {
	jgl.live = false;
	// run standard code
	cancelAnimationFrame(jgl.tick);

	// remove event listeners
	if (jgl.task[jgl.curBlock].keys!=undefined) {document.removeEventListener('keydown',keyEvent);}
	if (jgl.task[jgl.curBlock].mouse!=undefined) {document.removeEventListener('click',clickEvent);}

	// start the next block
	startBlock_();
}

function startTrial_() {
	jgl.curTrial++;
	// Check end block	
	if (jgl.curTrial>=jgl.task[jgl.curBlock].numTrials) {endBlock_();return}

	// Run trial:
	jgl.timing.trial = now();
	console.log('Starting trial: ' + jgl.curTrial);
	jgl.trial = jgl.task[jgl.curBlock].trials[jgl.curTrial];

	// Reset the event structure
	jgl.event = {};
	jgl.trial.responded = 0;

	// Start the segment immediately
	jgl.trial.thisseg = -1;
	startSegment_();

	if (jgl.callbacks.startTrial) {jgl.callbacks.startTrial();}
}

function endTrial_() {
	// save data into task[jgl.curBlock].datas 
	var data = {};
	// copy parameters

	// copy variables

	// copy defaults (RT, response, correct)

	// send to server
	if (!debug) {
		socket.emit('data',data);
	}
}

function startSegment_() {

	jgl.trial.thisseg++;
	jgl.trial.segname = jgl.task[jgl.curBlock].segnames[jgl.trial.thisseg];

	jgl.timing.segment = now();

	if (jgl.callbacks.startSegment) {jgl.callbacks.startSegment();}
}

function updateScreen_(time) {

	var framerate = 1000/time;
	// Clear screen
	jglClearScreen();
	// jgl.ctx.font="20px Georgia";
	// jgl.ctx.fillText('Trial: ' + jgl.curTrial + ' Segment: ' + jgl.trial.thisseg,10,50);

	if (jgl.callbacks.updateScreen) {jgl.callbacks.updateScreen();}
}

function getResponse_() {
	if (!jgl.live) {return}
	// actual event -- do nothing unless subject requests
	if (jgl.trial.response[jgl.trial.thisseg]) {
		if (jgl.trial.responded>0) {
			jgl.trial.responded++;
			console.log('Multiple responses recorded: ' + jgl.trial.responded);
			return
		}
		// called by the event listeners on the canvas during trials
		jgl.trial.RT = now() - jgl.timing.segment;
		jgl.trial.responded = true;		
		// call the experiment callback
		if (jgl.callbacks.getResponse && jgl.trial.responded) {jgl.callbacks.getResponse();}
	}
}