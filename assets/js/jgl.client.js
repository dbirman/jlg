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

var socket;

///////////////////////////////////////////////////////////////////////
//////////////////////// JGL FUNCTIONS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

$(document).ready(function() {launch();});

var divList = ['error','loading'];

var jgl = {}; // stuff that gets tracked (worker id, etc)

function launch() {
	jgl.screenInfo = screenInfo();

	var fList = [initJGL,getExperiment,loadTemplate,getAmazonInfo,loadExperiment,loadTask_,preload,updateFromServer,function() {if (debug) {start();}}];
	
	for (var fi=0;fi<fList.length;fi++) {
		setTimeout(fList[fi],fi*200);
	}
}

var exp, debug;

// PRELOAD
//	preload the instruction and surveys called for by this particular
//	experiment
function preload() {
	var loadInstructions = false,
		loadSurvey = false;
	for (var i=0;i<jgl.task.length;i++) {
		switch (jgl.task[i].type) {
			case 'instructions': loadInstructions = true; break;
			case 'survey': loadSurvey = true; break;
		}
	}

	if (loadInstructions) {preloadInstructions();}
	if (loadSurvey) {preloadSurvey();}
}

// SCREENINFO
//	set up the screen information: get pixels per cm and scale screen
//	then hide the pixels per inch measurement div
function screenInfo() {
	// Get DPI
	var screenInfo = {};
	var dpi_x = document.getElementById('dpi').offsetWidth;
	var dpi_y = document.getElementById('dpi').offsetHeight;
	if ((dpi_x!=dpi_y) || dpi_x===0 || dpi_y===0) {error('There is an issue with your screen--you cannot continue');return;}
	screenInfo.PPI = dpi_x;
	screenInfo.PPcm = screenInfo.PPI/2.54;
	screenInfo.screenSize = window.screen.width/screenInfo.PPcm; // in cm
	screenInfo.screenDistance = 60; // in cm
	screenInfo.totalcm = 2*Math.PI*screenInfo.screenDistance; // Total CM for 360 degrees
	screenInfo.pixPerDeg = screenInfo.PPcm*screenInfo.totalcm/360;
	screenInfo.screenSizeDeg = window.screen.width/screenInfo.pixPerDeg; // in cm

	$("#dpi").hide();

	return screenInfo;
}

// GETEXPERIMENT
//	Figure out what experiment was requested and whether we are in debug mode
function getExperiment() {
	debug = Number(getQueryVariable('debug'));
	exp = getQueryVariable('exp');    
	if (exp==undefined) {
		error('noexp');
		return;
	}
	if (!debug) {socket = io(); setupSocket();}
}

// SETUPSOCKET
// 	Sets up the socket object to recognize the various messages that the
//	server can send
function setupSocket() {
	socket.on('update', function(msg) {
		console.log('Server connection succeeded currently at block ' + (Number(msg)+1));
		// Format is block
		// msg = msg.split('.');
		jgl.curBlock = Number(msg); //[0];
		jgl.curTrial = -1; // we only send data per block, so we're stuck re-starting at the first trial
		start();
	});

	socket.on('check', function() {
		jgl.serverConnected = true;
	});

	socket.on('submitted', function() {
		jgl.live = false;
		error('You already participated and submitted this HIT. Please release it for another participant.');
	});
}

// INITJGL
//	Initialize the JGL object
function initJGL() {
	jgl.timing = {};
	jgl.live = false;
	jgl.serverConnected = -1;
	jgl.data = [];
	jgl.eventListeners = [];
}

// GETAMAZONINFO
//	Pulls from the mmturkey object information about the worker, HIT and
//	assignment. Also generates a hash of the worker ID and experiment name
//	which is what actually gets sent to the server to store data
function getAmazonInfo() {
	// these are NOT accessible to the server!
	if (debug==0) {
		jgl.assignmentId = opener.turk.assignmentId;
		jgl.workerId = opener.turk.workerId;
		// only the hash and hit ID are sent to the server--perfect anonymity, even across experiments
		jgl.hash = md5(jgl.workerId + exp);
		jgl.hitId = opener.turk.hitId;
	} else {
		jgl.assignmentId = 'debug'+randomInteger(500);
		jgl.workerId = 'debug';
		jgl.hash = md5(jgl.workerId + exp);
		jgl.hitId = 'debug';
	}
}

// SUBMITHIT
//	Submits the HIT and disables the experiment	
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
	socket.emit('submit');
	// Warning: opener.submit actually closes this window!
	// some browsers might not allow this
	opener.submit();
	setTimeout(error('Please close this window'),5000);
}

// LOADTEMPLATE
//	Load all of the default template files (usually just complete)
function loadTemplate() {
	var tempList = ['complete'];
	for (var i=0;i<tempList.length;i++) {
		addDiv(tempList[i]);
	}
}

// LOADEXPERIMENT
//	Load the experiment script
function loadExperiment() {
	// Load experiment code
	$.getScript('exps/'+exp+'/'+exp+'.client.js');
}

// UPDATEFROMSERVER
//	Login to the server and wait for the server to tell us to start
//  the current block
function updateFromServer() {
	if (debug==1) {
		jgl.curBlock = -1; // -1 before starting
		jgl.curTrial = -1; // -1 before starting
	} else {
		console.log('Attempting server connection');
		socket.emit('login',exp+'.'+jgl.hash+jgl.assignmentId);
		checkServerStatus();
	}
}

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
		$("#"+divList[di]).hide();
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
	jgl.trial.consent = true;
	endBlock_();
}

function completeEnd() {
	submitHIT();
}

function addDiv(div) {
	console.log('Adding div: ' + div);
	divList.push(div);
	$.get('assets/templates/'+div+'.html', function(data) {$('#content').append(data);});
	$("#"+div).hide();
}

function processTask(task) {
	for (var ti=0;ti<task.length;ti++) {
		if (task[ti].type!=undefined) {
			if (divList.indexOf(task[ti].type)==-1) {
				addDiv(task[ti].type);
			}
		}
		if (task[ti].type=='trial') {
			// setup trials
			task[ti].trials = [];
			for (var i=0;i<task[ti].numTrials;i++) {
				task[ti].trials[i] = {};
				// RESPONSE WATCH
				task[ti].trials[i].response = task[ti].response;
				// DEFAULTS
				task[ti].trials[i].RT = NaN;
				task[ti].trials[i].correct = NaN;
				task[ti].trials[i].response = NaN;
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
		else {
			// VARIABLES
			task[ti].trial = {};
			if (task[ti].variables!=undefined) {
				var vars = Object.keys(task[ti].variables);
				for (var vi=0;vi<vars.length;vi++) {
					task[ti].trial[vars[vi]] = NaN;
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
	jgl.canvas.width = window.innerWidth-50;
	jgl.canvas.degX = jgl.canvas.width/jgl.screenInfo.pixPerDeg;
	jgl.canvas.height = window.innerHeight-50;
	jgl.canvas.degY = jgl.canvas.height/jgl.screenInfo.pixPerDeg;
	if (jgl.canvas.degX<jgl.task[jgl.curBlock].minX || jgl.canvas.degY<jgl.task[jgl.curBlock].minY) {error('Your screen is not large enough to support our experiment. Please maximize the window or switch to a larger screen and refresh the page.');}
	jgl.ctx = jgl.canvas.getContext("2d");
	jgl.canvas.pixPerDeg = jgl.screenInfo.pixPerDeg;
	jglVisualAngleCoordinates();
	// Background color
	if (jgl.task[jgl.curBlock].background!==undefined) {
		jgl.canvas.background = jgl.task[jgl.curBlock].background;
	} else {
		jgl.canvas.background = 0.5;
	}
	// Add event listeners
	if (jgl.task[jgl.curBlock].keys!=undefined) {eventListenerAdd('keydown',keyEvent);}
	if (jgl.task[jgl.curBlock].mouse!=undefined) {eventListenerAdd('click',clickEvent);}
}

function eventListenerAdd(trigger,func) {
	jgl.eventListeners.push({trigger:trigger,func:func});
	document.addEventListener(trigger,func,false);
}

function eventListenerRemoveAll() {
	for (var i=0;i<jgl.eventListeners.length;i++) {
		document.removeEventListener(jgl.eventListeners[i].trigger,jgl.eventListeners[i].func,false);
	}
}

///////////////////////////////////////////////////////////////////////
//////////////////////// EVENT HANDLERS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function keyEvent(event) {
	if (event.which==32) {event.preventDefault();} // block spacebar from dropping

	jgl.event.key = {};
	jgl.event.key.keyCode = event.which;

	getResponse_();
}

function clickEvent(event) {
	jgl.event.mouse = {};

  var rect = jgl.canvas.getBoundingClientRect(), // abs. size of element
    scaleX = jgl.canvas.width / rect.width,    // relationship bitmap vs. element for X
    scaleY = jgl.canvas.height / rect.height;  // relationship bitmap vs. element for Y

  jgl.event.mouse.x =  (event.clientX - rect.left) * scaleX;  // scale mouse coordinates after they have
  jgl.event.mouse.y =  (event.clientY - rect.top) * scaleY;    // been adjusted to be relative to element

  jgl.event.mouse.shift = event.shiftKey;

  getResponse_();
}

///////////////////////////////////////////////////////////////////////
//////////////////////// CALLBACKS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function endExp_() {
	console.log('Experiment complete');

	if (jgl.callbacks.endExp!=undefined) {jgl.callbacks.endExp();}
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
	if (jgl.task[jgl.curBlock].callbacks!=undefined) {
		jgl.callbacks = jgl.task[jgl.curBlock].callbacks;
	} else {
		jgl.callbacks = {};
	}

	hideAll();
	$("#"+jgl.task[jgl.curBlock].type).show();

	// run the experiment callback if necessary
	if (jgl.callbacks.startBlock) {jgl.callbacks.startBlock(jgl.task);}

	if (jgl.task[jgl.curBlock].type=='trial') {
		// trials use the update_() code and a canvas to render
		// set up canvas
		setupCanvas();
	} else {
		jgl.trial = jgl.task[jgl.curBlock].trial; // we need this to store saved data
		switch (jgl.task[jgl.curBlock].type) {
			// Anything that isn't a trial/canvas just waits for a submit function
			// (these could be instructions, forms, surveys, whatever)
			case 'consent':
				jgl.endBlockFunction = consentEnd;
				break;
			case 'complete':
				jgl.endBlockFunction = completeEnd;
				break;
			case 'instructions':
				setupInstructions();
				jgl.endBlockFunction = instructionsEnd;
				break;
			case 'survey':
				setupSurvey();
				jgl.endBlockFunction = surveyEnd;
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

	// SPECIAL CASE: CUR TRIAL -1 AND BLOCK START < 3000 MS
	if (jgl.curTrial==-1 && (now()-jgl.timing.block)<3000) {
		updateScreen_(t);
		jgl.tick = requestAnimationFrame(update_);
		return;
	}
	// Check first trial (waits a bit)
	if (jgl.curTrial==-1) {startTrial_();}
	// Check next trial
	if ((now()-jgl.timing.trial)>jgl.trial.length) {endTrial_(); startTrial_();}
	// Next trial may have shut down the block, check this
	if (cblock != jgl.curBlock) {return}
	// Check next segment
	if ((now()-jgl.timing.segment)>jgl.trial.seglen[jgl.trial.thisseg]) {startSegment_();}

	// Update screen
	updateScreen_(t);

	// Start repeats
	jgl.tick = requestAnimationFrame(update_);
}

function endBlock_() {
	jgl.live = false;
	// run standard code
	cancelAnimationFrame(jgl.tick);

	// remove event listeners
	eventListenerRemoveAll();
	
	var data = {};
		
	if (jgl.task[jgl.curBlock].type=='trial') {
		// save data into task[jgl.curBlock].datas 
		// copy parameters
		var params = Object.keys(jgl.task[jgl.curBlock].parameters);
		for (var pi=0;pi<params.length;pi++) {
			data[params[pi]] = jgl.trial[params[pi]];
		}

		// copy variables
		var variables = Object.keys(jgl.task[jgl.curBlock].variables);
		for (var vi=0;vi<variables.length;vi++) {
			data[variables[vi]] = jgl.trial[variables[vi]];
		}

		// copy defaults (RT, response, correct)
		var defaults = ['RT','response','correct','framerate'];
		for (var di=0;di<defaults.length;di++) {
			// these might not be defined, so don't just copy by default
			if (jgl.trial[defaults[di]]!=undefined) {data[defaults[di]] = jgl.trial[defaults[di]];}
		}
	} else {
		// copy variables
		var variables = Object.keys(jgl.task[jgl.curBlock].variables);
		for (var vi=0;vi<variables.length;vi++) {
			data[variables[vi]] = jgl.trial[variables[vi]];
		}
	}

	if (jgl.callbacks.endBlock) {jgl.callbacks.endBlock();}

	// send to server
	jgl.data.push(data);
	if (!debug) {
		socket.emit('data',data);
	}

	// start the next block
	startBlock_();
}

function jumpSegment(delay) {
	if (delay===undefined) {delay = 0;}
	if (jgl.trial.seglen[jgl.trial.thisseg]==Infinity) {
		jgl.trial.seglen[jgl.trial.thisseg]=now()-jgl.timing.segment+delay;
		jgl.trial.length = sum(jgl.trial.seglen);
	}
	startSegment_();
}

function startTrial_() {
	jgl.curTrial++;
	// Check end block	
	if (jgl.curTrial>=jgl.task[jgl.curBlock].numTrials) {endBlock_();return}

	// Run trial:
	jgl.timing.trial = now();
	console.log('Starting trial: ' + jgl.curTrial);
	jgl.trial = jgl.task[jgl.curBlock].trials[jgl.curTrial];
	jgl.trial.framerate = [];

	// Reset the event structure
	jgl.event = {};
	jgl.trial.RT = zeros(jgl.task[jgl.curBlock].response.length);
	jgl.trial.responded = zeros(jgl.task[jgl.curBlock].response.length);

	// Start the segment immediately
	jgl.trial.thisseg = -1;
	startSegment_();

	if (jgl.callbacks.startTrial) {jgl.callbacks.startTrial();}
}

function endTrial_() {
	jgl.trial.framerate = 1000/mean(jgl.trial.framerate);

	if (jgl.callbacks.endTrial) {jgl.callbacks.endTrial();}
}

function startSegment_() {

	jgl.trial.thisseg++;

	// check if we went too far
	if (jgl.trial.thisseg>=jgl.task[jgl.curBlock].segnames.length) {
		// end trial
		return 
	}
	jgl.trial.segname = jgl.task[jgl.curBlock].segnames[jgl.trial.thisseg];

	jgl.timing.segment = now();

	if (jgl.callbacks.startSegment) {jgl.callbacks.startSegment();}
}

function updateScreen_(t) {
	// jgl.trial.framerate.push(t);
	// Clear screen
	jglClearScreen();
	// jgl.ctx.font="1px Georgia";
	// jgl.ctx.fillText('Trial: ' + jgl.curTrial + ' Segment: ' + jgl.trial.thisseg,-5,-5);
	if (jgl.curTrial===-1) {getReady();}

	if (jgl.callbacks.updateScreen) {jgl.callbacks.updateScreen(t);}
}

function getResponse_() {
	if (!jgl.live) {return}
	// actual event -- do nothing unless subject requests
	if (jgl.trial.response[jgl.trial.thisseg]===1) {
		if (jgl.trial.responded[jgl.trial.thisseg]>0) {
			jgl.trial.responded[jgl.trial.thisseg]++;
			console.log('Multiple responses recorded: ' + jgl.trial.responded);
			return
		}
		// called by the event listeners on the canvas during trials
		jgl.trial.RT[jgl.trial.thisseg] = now() - jgl.timing.segment;
		jgl.trial.responded[jgl.trial.thisseg] = true;		
		// call the experiment callback
		if (jgl.callbacks.getResponse) {jgl.callbacks.getResponse();}
	}
}
///////////////////////////////////////////////////////////////////////
//////////////////////// GET READY ////////////////////////////////
///////////////////////////////////////////////////////////////////////

// This is a special updateScreen callback that just displays
// "get ready!" on the screen

function getReady() {
	jglTextSet('Courier New',2,'#ffffff');
	jglTextDraw('Get Ready',0,0);
}

///////////////////////////////////////////////////////////////////////
//////////////////////// INSTRUCTIONS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function preloadInstructions() {
	// JGL NOTE: Only store instruction divs in the local exp.html file
	// General templates should be shared in assets/templates so that 
	// everybody can use them
	$.get('exps/'+exp+'/'+exp+'_instructions.html', function(data) {$('#instructionsdiv').append(data);})
}

function setupInstructions() {
	jgl.instructions = jgl.task[jgl.curBlock].instructions;
	jgl.instructions.push("instructions-end");
	jgl.curInstructions = -1;

	incInstructions(1);
}

function displayInstructions() {
	for (var i=0;i<jgl.instructions.length;i++) {
		$("#"+jgl.instructions[i]).hide();
	}
	$("#"+jgl.instructions[jgl.curInstructions]).show();
}

function incInstructions(increment) {
	jgl.curInstructions+=increment;
	// check end conditions
	if (jgl.curInstructions>=jgl.instructions.length) {
		jgl.endBlockFunction();
		return;
	}
	// set prev/next buttons
	if (jgl.curInstructions==0) {
		// disable prev
		$("#inst-prev").prop("disabled",true);
	} else {
		$("#inst-prev").prop("disabled",false);
	}
	// show the right instructions slide
	displayInstructions();
}

function instructionsEnd() {
	endBlock_();
}

///////////////////////////////////////////////////////////////////////
//////////////////////// SURVEYS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function preloadSurvey() {
	// JGL NOTE: Only store instruction divs in the local exp.html file
	// General templates should be shared in assets/templates so that 
	// everybody can use them
	$.get('exps/'+exp+'/'+exp+'_survey.html', function(data) {$('#surveydiv').append(data);})
	// Block enter key on all forms
	$(document).on("keypress", "form", function(event) { 
    return event.keyCode != 13;
	});
}

function setupSurvey() {
	jgl.surveys = jgl.task[jgl.curBlock].surveys;
	jgl.curSurvey = 0;
	var cur = jgl.surveys[jgl.curSurvey].split('-');
	var suffix = cur[1];
	jgl.curForm = suffix;
	displaySurvey();	
	$("#survey-submit").prop("disabled",true);
	$("#"+jgl.curForm).change(function() {setSurveySubmit();});
}

function displaySurvey() {
	for (var i=0;i<jgl.surveys.length;i++) {
		$("#"+jgl.surveys[i]).hide();
	}
	$("#"+jgl.surveys[jgl.curSurvey]).show();
}

function setSurveySubmit() {
	if (checkSurveySubmit()) {
		$("#survey-submit").prop("disabled",false);
	} else {
		$("#survey-submit").prop("disabled",true);
	}
}

function checkSurveySubmit() {
	// Check whether the form is complete
	var form = document.forms[jgl.curForm];
	// check that each input is not empty
	for (var i=0;i<form.length;i++) {
		if (form[i].value=="") {return false;}
	}
	return true;
}

function submitSurvey() {
	var form = document.forms[jgl.curForm];
	// check that each input is not empty
	jgl.trial.answers = {};
	for (var i=0;i<form.length;i++) {
		jgl.trial.answers[form[i].id] = form[i].value;
	}
	jgl.curSurvey+=1;
	// check end conditions
	if (jgl.curSurvey>=jgl.surveys.length) {
		jgl.endBlockFunction();
		return
	}
	// show the right instructions slide
	displaySurvey();
}

function surveyEnd() {
	endBlock_();
}