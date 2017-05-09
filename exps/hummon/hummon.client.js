
function loadTask() {
	var task = [];

	var count=0;
	// CONSENT
	// task[count] = {};
	// task[count].type = 'consent';
	// // consent is a default type with no callbacks
	// task[count].variables = {};
	// task[count].variables.consent = NaN;
	// count++;
	// // consent has no data

	// // // SURVEY DEMOGRAPHICS
	// task[count] = {};
	// task[count].type = 'survey';
	// task[count].surveys = ['survey-demo'];
	// task[count].variables = {};
	// count++;

	// // SCREEN TEST
	// task[count] = {};
	// task[count].type = 'instructions';
	// task[count].instructions = ['screen-test'];
	// task[count].variables = {};
	// count++;

	// task[count++] = screenTestSetup();

	// // SCREEN TEST
	// task[count] = {};
	// task[count].type = 'instructions';
	// task[count].instructions = ['sound-test'];
	// task[count].variables = {};
	// count++;

	// task[count++] = soundTestSetup();

	// // // INSTRUCTIONS
	// task[count] = {};
	// task[count].type = 'instructions';
	// task[count].variables = {};
	// task[count].instructions = ['instruct-1','instruct-2'];
	// count++;

	var levels = 1;
	for (var i=1;i<=levels;i++) {
		// task[count++] = levelInstructionSetup(i);
		task[count++] = levelSetup(i);
		task[count++] = surveySetup();
	}

	// Setup sounds
	jglInitTone(100,200,'low');
	jglInitTone(1000,200,'high');

	return task;
}

function levelInstructionSetup(num) {
	var taskblock = {};
	taskblock.type = 'instructions';
	taskblock.variables = {};
	taskblock.instructions = ['level-'+num];
	return taskblock;
}

function surveySetup() {
	var taskblock = {};
	taskblock.type = 'survey';
	taskblock.variables = {};
	taskblock.surveys = ['survey-rule'];
	return taskblock;
}

function levelSetup(num) {
	// RT TRIALS
	var taskblock = {};

	taskblock.type = 'trial'; // this will give us use of the canvas
	// Set minimum screen dimensions 
	taskblock.minX = 8;
	taskblock.minY = 8;

	return window['levelSetup'+num](taskblock);
}

function checkStartTrial(event) {
	if (event.which==32 && !jgl.active.pressed && !jgl.active.trialUp) {
		jgl.active.trialUp = true;
		jgl.active.pressed = true;
		if (jgl.trial.segname=='wait') {
			event.preventDefault();
			jumpSegment();
		}
	}
}

function checkEndTrial(event) {
	if (event.which==32 && !jgl.active.trialDown) {
		jgl.active.trialDown = true;
		jgl.active.pressed = false;
		// otherwise, call the local function
		jgl.active.checkEnd();
	}
}

function checkCorrect(nmResp) {
	if (jgl.trial.match!=nmResp) {
		jgl.trial.correct=1;
		jgl.active.fixColor="#00ff00";
	} else {
		jgl.trial.correct=0;
		jgl.active.fixColor="#ff0000";
		
	}
}

function upResp() {
	if (jgl.trial.correct==1) {
		jgl.ctx.fillStyle = "#00ff00";
		jglTextDraw("Correct",0,0);
	} else {
		// No overt signal when incorrect
		jgl.active.delayTimer = 5.000;
	}
}

function upDelay() {
	if (jgl.active.delayTimer > 0) {

	} else {
		checkEndTrial();
	}
}
function levelSetup1(taskblock) {
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock_1;
	taskblock.callbacks.endBlock = endBlock_1;
	taskblock.callbacks.startTrial = startTrial_1;
	taskblock.callbacks.endTrial = endTrial_1;
	taskblock.callbacks.startSegment = startSegment_1;
	taskblock.callbacks.updateScreen = updateScreen_1;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	taskblock.parameters.tone = ['low','high'];
	taskblock.parameters.rotation = multiply(Math.PI,[0,1/8,2/8,3/8,4/8,5/8,6/8,7/8]); // actual orientation
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.ecc = 5;
	taskblock.variables.angle = 0; // display angle, ecc constant
	// delay controls how long participants have to wait to be correct 
	taskblock.variables.delay = NaN;
	// Segment timing
	taskblock.segnames = ['wait','sample','resp','delay'];
	// Seglen uses specific times
	// We use zero for the delay time, so that we can add the delay segment
	// only when we need to use it
	taskblock.seglen = [Infinity,200,2000,Infinity];
	// Responses
	taskblock.response = [0,0,0,0];
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	// taskblock.keys = 32;
	// Trials
	taskblock.numTrials = 250; // if we make it to 250 then we cancel the experiment

	return taskblock;
}

function startBlock_1() {
	// Current delay: only thing we will adjust
	// this controls how far after the sample time starts should we
	// play the sound
	jgl.active.pastCorrect = zeros(4);
	jgl.active.respDelay = 0;
	jgl.active.checkEnd = checkEnd_1;
	jgl.active.delayStaircase = 0;
	document.addEventListener("keydown",checkStartTrial,false);
	document.addEventListener("keyup",checkEndTrial,false);
}

function endBlock_1() {
	document.removeEventListener("keydown",checkStartTrial,false);
	document.removeEventListener("keyup",checkEndTrial,false);
}

// After every trial, we check whether we got the last four trials correct
// (probability 1/16) and increment/decrement the relevant delays
function checkTrialConditions_1() {
	return all(jgl.active.pastCorrect.slice(4,6));
}

function checkEndConditions_1() {
	return (jgl.active.delay>=500) && all(jgl.active.pastCorrect);
}

function startTrial_1() {
	// Check if we should
	if (checkEndConditions_1()) {
		endBlock_();
		return;
	}
	jgl.trial.delay = jgl.active.delayStaircase; // this will increment

	jgl.active.trialUp = false;
	jgl.active.trialDown = false;
	jgl.active.dead = false;
	jgl.active.soundPlayed = false;
}

function endTrial_1() {
	jgl.active.pastCorrect.shift();
	jgl.active.pastCorrect.push(jgl.trial.correct);
	if (checkTrialConditions_1()) {jgl.active.delayStaircase += 50; jgl.active.delayStaircase = Math.min(jgl.active.delayStaircase,500);}
	// if we've met the end conditions, end everthhing
	if (checkEndConditions_1()) {jgl.task[jgl.curBlock].numTrials=jgl.curTrial;}
}

function checkEnd_1() {
	if (jgl.trial!==undefined) {
		jgl.active.dead=true;
		// If the user raised the spacebar at the right time, set the
		// trial to be correct
		if ((jgl.trial.segname=='sample') && (jgl.trial.delay<200)) {
			// Check what to do here 
			if ((now()-jgl.timing.segment)>jgl.trial.delay) {trialCorrect_1();}
		} else if (jgl.trial.segname=='resp') {
			if ((now()-jgl.timing.segment)>(jgl.trial.delay-200)) {trialCorrect_1();}
		}
	}
}

function trialCorrect_1() {
	jgl.trial.correct = true;
	jgl.active.drawGratings = 0;
	jgl.active.fixColor = "#00ff00";
}

function startSegment_1() {
	jgl.active.fix = 1;
	jgl.active.fixColor = "#ffffff";
	jgl.active.resp = 0;
	jgl.active.drawGratings = 0;
	jgl.active.delay = 0;

	if (jgl.active.dead) {jgl.active.fix=0;}

	switch (jgl.trial.segname) {
		case 'sample':
			jgl.active.drawGratings = 1;
			break;
		case 'resp':
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'delay':
			if (jgl.trial.correct) {
				// They got the trial correct, continue display "correct"
				jgl.active.fixColor = "#00ff00";
				updateSeglen(500,jgl.trial.thisseg);
			} else if (isNaN(jgl.trial.correct) || (!jgl.trial.correct)) {
				// They got the trial wrong
				jgl.active.delay = 1; // show the delay timer
				updateSeglen(5000,jgl.trial.thisseg);
			}
			break;
	}
}

function updateScreen_1(t) {
	if (jgl.active.delay) {
		upTimer();
	}
	if (jgl.active.fix) {
		jglFixationCross(1,1,jgl.active.fixColor,[0,0]);
	}
	if (jgl.active.drawGratings) {
		upGratings(jgl.active.gratings);
	}
	switch (jgl.trial.segname) {
		case 'sample':
			if ((!jgl.active.soundPlayed) && ((now()-jgl.timing.segment)>jgl.trial.delay)) {
				playSound();
			}
			break;
		case 'resp':
			if ((!jgl.active.soundPlayed) && ((now()-jgl.timing.segment)>(jgl.trial.delay-200))) {
				playSound();
			}
			break;
	}
	// if (jgl.active.resp) {
	// 	upResp();
	// }
}

function playSound() {
	jglPlayTone(jgl.trial.tone);
	jgl.active.soundPlayed = true;
}

function upGratings() {
	jglFillRect(5,0,[1,1],'#ffffff');
}

function upResp() {
	jglTextSet('Arial',12,'#00ff00');
	jglTextDraw('Correct',0,0);
}

function upTimer() {
	// Draw the timer on the screen 
	var perc = ((now()-jgl.timing.segment)/1000)/5;
	jglFillArc(0,0,2,3,'#ff0000',perc*2*Math.PI,2*Math.PI);
	jglTextSet('Arial',32,'#ff0000');
	jglTextDraw(Math.ceil(5-5*perc)+'',0,0);
}
function levelSetup1(taskblock) {
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock_2;
	taskblock.callbacks.endBlock = endBlock_2;
	taskblock.callbacks.startTrial = startTrial_2;
	taskblock.callbacks.endTrial = endTrial_2;
	taskblock.callbacks.startSegment = startSegment_2;
	taskblock.callbacks.updateScreen = updateScreen_2;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	taskblock.parameters.tone = ['low','high'];
	taskblock.parameters.rotation = multiply(Math.PI,[0,1/8,2/8,3/8,4/8,5/8,6/8,7/8]); // actual orientation
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.ecc = 5;
	taskblock.variables.angle1 = 0; // display angle, ecc constant
	taskblock.variables.angle2 = 0; // display angle, ecc constant
	// delay controls how long participants have to wait to be correct 
	taskblock.variables.delay = NaN;
	taskblock.variables.delay1 = NaN;
	// Segment timing
	taskblock.segnames = ['wait','sample1','delay1','sample2','resp','delay'];
	// Seglen uses specific times
	// We use zero for the delay time, so that we can add the delay segment
	// only when we need to use it
	taskblock.seglen = [Infinity,200,0,200,2000,Infinity];
	// Responses
	taskblock.response = zeros(taskblock.seglen.length);
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	// taskblock.keys = 32;
	// Trials
	taskblock.numTrials = 250; // if we make it to 250 then we cancel the experiment

	return taskblock;
}

function startBlock_2() {
	// Current delay: only thing we will adjust
	// this controls how far after the sample time starts should we
	// play the sound
	console.log('Starting level 2');
	jgl.active.pastCorrect = zeros(4);
	jgl.active.respDelay = 0;
	jgl.active.checkEnd = checkEnd_2;
	jgl.active.delayStaircase = 0;
	document.addEventListener("keydown",checkStartTrial,false);
	document.addEventListener("keyup",checkEndTrial,false);
}

function endBlock_2() {
	document.removeEventListener("keydown",checkStartTrial,false);
	document.removeEventListener("keyup",checkEndTrial,false);
}

// After every trial, we check whether we got the last four trials correct
// (probability 1/16) and increment/decrement the relevant delays
function checkTrialConditions_2() {
	return all(jgl.active.pastCorrect.slice(4,6));
}

function checkEndConditions_2() {
	return (jgl.active.delayStaircase>=1000) && all(jgl.active.pastCorrect);
}

function startTrial_2() {
	// Check if we should
	if (checkEndConditions_2()) {
		endBlock_();
		return;
	}
	jgl.trial.delay = 500;
	jgl.trial.delay1 = jgl.active.delayStaircase; // this will increment
	jgl.trial.seglen[2] = jgl.trial.delay1;

	jgl.active.trialUp = false;
	jgl.active.trialDown = false;
	jgl.active.dead = false;
	jgl.active.soundPlayed = false;
}

function endTrial_2() {
	jgl.active.pastCorrect.shift();
	jgl.active.pastCorrect.push(jgl.trial.correct);
	if (checkTrialConditions_2()) {jgl.active.delayStaircase += 100; jgl.active.delayStaircase = Math.min(jgl.active.delayStaircase,500);}
	// if we've met the end conditions, end everthhing
	if (checkEndConditions_2()) {jgl.task[jgl.curBlock].numTrials=jgl.curTrial;}
}

function checkEnd_2() {
	if (jgl.trial!==undefined) {
		jgl.active.dead=true;
		// If the user raised the spacebar at the right time, set the
		// trial to be correct
		if ((jgl.trial.segname=='sample') && (jgl.trial.delay<200)) {
			// Check what to do here 
			if ((now()-jgl.timing.segment)>jgl.trial.delay) {trialCorrect_2();}
		} else if (jgl.trial.segname=='resp') {
			if ((now()-jgl.timing.segment)>(jgl.trial.delay-200)) {trialCorrect_2();}
		}
	}
}

function trialCorrect_2() {
	jgl.trial.correct = true;
	jgl.active.drawGratings = 0;
	jgl.active.fixColor = "#00ff00";
}

function startSegment_2() {
	jgl.active.fix = 1;
	jgl.active.fixColor = "#ffffff";
	jgl.active.resp = 0;
	jgl.active.drawGratings = 0;
	jgl.active.delay = 0;

	if (jgl.active.dead) {jgl.active.fix=0;}

	switch (jgl.trial.segname) {
		case 'sample1':
			jgl.active.drawGratings = 1;
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'delay1':
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'sample2':
			jgl.active.drawGratings = 1;
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'resp':
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'delay':
			if (jgl.trial.correct) {
				// They got the trial correct, continue display "correct"
				jgl.active.fixColor = "#00ff00";
				updateSeglen(500,jgl.trial.thisseg);
			} else if (isNaN(jgl.trial.correct) || (!jgl.trial.correct)) {
				// They got the trial wrong
				jgl.active.delay = 1; // show the delay timer
				updateSeglen(5000,jgl.trial.thisseg);
			}
			break;
	}
}

function updateScreen_2(t) {
	if (jgl.active.delay) {
		upTimer();
	}
	if (jgl.active.fix) {
		jglFixationCross(1,1,jgl.active.fixColor,[0,0]);
	}
	if (jgl.active.dead) {return;}
	if (jgl.active.drawGratings) {
		upGratings();
	}
	switch (jgl.trial.segname) {
		case 'sample2':
			if ((!jgl.active.soundPlayed) && ((now()-jgl.timing.segment)>jgl.trial.delay)) {
				playSound();
			}
			break;
		case 'resp':
			if ((!jgl.active.soundPlayed) && ((now()-jgl.timing.segment)>(jgl.trial.delay-200))) {
				playSound();
			}
			break;
	}
}
function screenTestSetup() {
	// RT TRIALS
	taskblock = {};
	taskblock.type = 'trial'; // this will give us use of the canvas
	// Set minimum screen dimensions 
	taskblock.minX = 8;
	taskblock.minY = 8;
	// Setup callback functions
	taskblock.callbacks = {};
	taskblock.callbacks.endBlock = endBlock_screen;
	taskblock.callbacks.startTrial = startTrial_screen;
	taskblock.callbacks.updateScreen = updateScreen_screen;
	taskblock.callbacks.getResponse = getResponse_screen;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	taskblock.parameters.ecc = 5*jgl.screenInfo.pixPerDeg;
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.angle = NaN; // we will pick randomly
	taskblock.variables.reaction = NaN; // we will pick randomly
	// Segment timing
	taskblock.segnames = ['delay','stim'];
	// Seglen uses specific times
	taskblock.segmin = [250,1000];
	taskblock.segmax = [2000,1000];
	// Responses
	taskblock.response = [0,1];
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	taskblock.keys = 32;
	// Trials
	taskblock.numTrials = 6; // can be infinite as well
	// Keys

	return taskblock;
}

function endBlock_screen() {
	// Get RT values
	var values = [];
	var crash = 0; // if they miss two or more we crash out
	for (var i=0;i<5;i++) {
		var crt = jgl.task[jgl.curBlock].data.reaction[i];
		if (isnan(crt)) {crash++;}
		else {
			values.push(crt);
		}
	}
	console.log(mean(values));
	console.log(crash);
	if ((crash>=2) || (mean(values)>750) || (mean(values)<100)) {
		// They're probably fucking around
		error('There is a problem with your screen, it is not showing the stimulus with the correct timing. We are really sorry. This is likely a browser incompatibility issue. Please close this window and return the HIT.');
	}
}

function startTrial_screen() {
	jgl.trial.angle = Math.random() * 2 * Math.PI;
	jgl.active = {};
	jgl.active.stim = true;
	jgl.active.color = "#ffffff";
}

function updateScreen_screen() {
	jglFixationCross();
	if (jgl.active.stim && (jgl.trial.segname=='stim')) {
		jglFillRect(jgl.trial.ecc*Math.cos(jgl.trial.angle), jgl.trial.ecc*Math.sin(jgl.trial.angle), [1, 1], jgl.active.color);
	}
}

function getResponse_screen() {
	jgl.trial.reaction = jgl.trial.RT[jgl.trial.thisseg];
	jgl.active.color="#000000";
}
function soundTestSetup() {
	// RT TRIALS
	taskblock = {};
	taskblock.type = 'trial'; // this will give us use of the canvas
	// Set minimum screen dimensions 
	taskblock.minX = 8;
	taskblock.minY = 8;
	// Setup callback functions
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock_sound;
	taskblock.callbacks.endBlock = endBlock_sound;
	taskblock.callbacks.startTrial = startTrial_sound;
	taskblock.callbacks.updateScreen = updateScreen_sound;
	taskblock.callbacks.getResponse = getResponse_sound;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	taskblock.parameters.sound = [0,1];
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.reaction = NaN; // we will pick randomly
	// Segment timing
	taskblock.segnames = ['delay','stim'];
	// Seglen uses specific times
	taskblock.segmin = [250,1000];
	taskblock.segmax = [2000,1000];
	// Responses
	taskblock.response = [0,1];
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	taskblock.keys = 32;
	// Trials
	taskblock.numTrials = 6; // can be infinite as well
	// Keys

	return taskblock;
}

function startBlock_sound() {
	jglInitTone(100,200,'low');
	jglInitTone(2000,200,'high');
}

function endBlock_sound() {
	// Get RT values
	var values = [];
	var crash = 0; // if they miss two or more we crash out
	for (var i=0;i<5;i++) {
		var crt = jgl.task[jgl.curBlock].data.reaction[i];
		if (isnan(crt)) {crash++;}
		else {
			values.push(crt);
		}
	}
	if ((crash>=2) || (mean(values)>750) || (mean(values)<100)) {
		// They're probably fucking around
		error('There is a problem with your screen, it is not showing the stimulus with the correct timing. We are really sorry. This is likely a browser incompatibility issue. Please close this window and return the HIT.');
	}
}

function startTrial_sound() {
	jgl.active = {};
	jgl.active.stim = true;
	jgl.active.resp = false;
}

function updateScreen_sound() {
	jglFixationCross();
	if (jgl.active.stim && (jgl.trial.segname=='stim')) {
		opts = ['low','high'];
		jglPlayTone(opts[jgl.trial.sound]);
		jgl.active.stim=false;
	}
	if (jgl.active.resp) {
		jglFillRect(0,0, [1, 1], "#000000");
	}
}

function getResponse_sound() {
	jgl.trial.reaction = jgl.trial.RT[jgl.trial.thisseg];
	jgl.active.resp=true;
}