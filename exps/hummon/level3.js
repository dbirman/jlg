
function levelSetup_3(taskblock) {
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock_3;
	taskblock.callbacks.endBlock = endBlock_3;
	taskblock.callbacks.startTrial = startTrial_3;
	taskblock.callbacks.endTrial = endTrial_3;
	taskblock.callbacks.startSegment = startSegment_3;
	taskblock.callbacks.updateScreen = updateScreen_3;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	taskblock.parameters.match = [0,1];
	taskblock.parameters.respond = [0,1];
	taskblock.parameters.ecc = 5;
	taskblock.parameters.rotation1 = multiply(Math.PI,[0,1/8,2/8,3/8,4/8,5/8,6/8,7/8]); // actual orientation
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.tone = NaN;
	taskblock.variables.rotation2 = NaN; // based on rotation 1
	taskblock.variables.angle = 0; // display angle, ecc constant
	// delay controls how long participants have to wait to be correct 
	taskblock.variables.delay = NaN;
	// Segment timing
	taskblock.segnames = ['wait','sample1','delay1','sample2','resp','delay'];
	// Seglen uses specific times
	// We use zero for the delay time, so that we can add the delay segment
	// only when we need to use it
	taskblock.seglen = [Infinity,200,1000,200,2000,Infinity];
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

function startBlock_3() {
	// Current delay: only thing we will adjust
	// this controls how far after the sample time starts should we
	// play the sound
	console.log('Starting level 3');
	jgl.active.pastCorrect = zeros(6);
	jgl.active.respDelay = 0;
	jgl.active.checkEnd = checkEnd_3;
	jgl.active.delayStaircase = 0;
	jglInitGrating("grating",1,1,0.1,0.4);
	document.addEventListener("keydown",checkStartTrial,false);
	document.addEventListener("keyup",checkEndTrial,false);
}

function endBlock_3() {
	document.removeEventListener("keydown",checkStartTrial,false);
	document.removeEventListener("keyup",checkEndTrial,false);
}

// After every trial, we check whether we got the last four trials correct
// (probability 1/16) and increment/decrement the relevant delays
function checkTrialConditions_3() {
	return all(jgl.active.pastCorrect.slice(4,6));
}

function checkEndConditions_3() {
	return all(jgl.active.pastCorrect);
}

function startTrial_3() {
	// Check if we should
	if (checkEndConditions_3()) {
		endBlock_();
		return;
	}
	jgl.trial.delay = 500;
	jgl.trial.angle = 0;

	jgl.trial.rotation2 = jgl.trial.rotation1;
	if (jgl.trial.match) {
		if (jgl.trial.respond) {
			jgl.trial.tone = "low";
		} else {
			jgl.trial.tone = "high";
		}
	} else {
		if (jgl.trial.respond) {
			jgl.trial.tone = "high";
		} else {
			jgl.trial.tone = "low";
		}
		while (jgl.trial.rotation1==jgl.trial.rotation2) {
			jgl.trial.rotation2 = randomElement(multiply(Math.PI,[0,1/8,2/8,3/8,4/8,5/8,6/8,7/8]));
		}
	}

	jgl.active.trialUp = false;
	jgl.active.trialDown = false;
	jgl.active.dead = false;
	jgl.active.soundPlayed = false;
}

function endTrial_3() {
	jgl.active.pastCorrect.shift();
	jgl.active.pastCorrect.push(jgl.trial.correct);
	// if (checkTrialConditions_3()) {jgl.active.delayStaircase += 150; jgl.active.delayStaircase = Math.min(jgl.active.delayStaircase,1000);}
	// if we've met the end conditions, end everthhing
	if (checkEndConditions_3()) {jgl.task[jgl.curBlock].numTrials=jgl.curTrial;}
}

function checkEnd_3() {
	if (jgl.trial!==undefined) {
		jgl.active.dead=true;
		// If the user raised the spacebar at the right time, set the
		// trial to be correct
		if (jgl.trial.segname=='resp') {
			if ((now()-jgl.timing.segment)>(jgl.trial.delay-200)) {trialCorrect_3();}
		} else if (jgl.trial.segname=='delay') {
			if (!jgl.trial.respond) {
				jgl.trial.correct = true;
				jgl.active.fixColor = "#00ff00";
			} else {
				jgl.trial.correct = false;
			}
			checkForDelay_3();
		}
	}
}

function trialCorrect_3() {
	if (jgl.trial.respond) {
		jgl.trial.correct = true;
		jgl.active.drawGratings = 0;
		jgl.active.fixColor = "#00ff00";
	} else {
		jgl.active.fix = 0;
	}
}

function startSegment_3() {
	jgl.active.fix = 1;
	if (jgl.trial.segname=="wait") {
		jgl.active.fixColor = "#808080";
	} else {
		jgl.active.fixColor = "#1414C8";
	}
	jgl.active.resp = 0;
	jgl.active.drawGratings = 0;
	jgl.active.delay = 0;

	if (jgl.active.dead) {jgl.active.fix=0;}

	switch (jgl.trial.segname) {
		case 'sample1':
			jgl.active.drawGratings = 1;
			jgl.active.ecc = jgl.trial.ecc;
			jgl.active.angle = jgl.trial.angle;
			jgl.active.rotation = jgl.trial.rotation1;
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'delay1':
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'sample2':
			jgl.active.drawGratings = 1;
			jgl.active.ecc = jgl.trial.ecc;
			jgl.active.angle = jgl.trial.angle;
			jgl.active.rotation = jgl.trial.rotation2;
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'resp':
			if (jgl.active.dead) {jumpSegment(); return}
			break;
		case 'delay':
			if (jgl.active.dead) {
				checkForDelay_3();
			}
			break;
	}
}

function checkForDelay_3() {
	if (jgl.trial.correct) {
		// They got the trial correct, continue display "correct"
		jgl.active.fixColor = "#00ff00";
		jgl.active.fix = 1;
		updateSeglen(now()-jgl.timing.segment+500,jgl.trial.thisseg);
	} else if (isNaN(jgl.trial.correct) || (!jgl.trial.correct)) {
		// They got the trial wrong
		jgl.active.delay = 1; // show the delay timer
		jgl.active.fix = 0;
		updateSeglen(now()-jgl.timing.segment+5000,jgl.trial.thisseg);
	}
}

function updateScreen_3(t) {
	if (jgl.active.delay) {
		upTimer();
	}
	if (jgl.active.fix) {
		if (jgl.trial.segname=='wait') {setWaitFixColor(t);}
		var radius;
		if (jgl.trial.segname=='resp') {
			radius = 0.25;
			// radius = (1-(now()-jgl.timing.segment)/jgl.trial.seglen[jgl.trial.thisseg])*0.25;
		} else {radius = 0.25;}
		jglFixationCircle(radius,jgl.active.fixColor,[0,0]);
	}
	if (jgl.active.dead) {
		return;
	}
	if (jgl.active.drawGratings) {
		upGratings(jgl.active.ecc,jgl.active.angle,jgl.active.rotation);
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