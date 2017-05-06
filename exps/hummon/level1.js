
function levelSetup1(taskblock) {
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock_1;
	taskblock.callbacks.endBlock = endBlock_1;
	taskblock.callbacks.startTrial = startTrial_1;
	taskblock.callbacks.endTrial = endTrial_1;
	taskblock.callbacks.startSegment = startSegment_1;
	taskblock.callbacks.updateScreen = updateScreen_1;
	taskblock.callbacks.getResponse = getResponse_1;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
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
	taskblock.seglen = [Infinity,200,2000,0];
	// Responses
	taskblock.response = [0,1,1,0];
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
	jgl.active.pastCorrect = zeros(6);
	jgl.active.respDelay = 0;
	jgl.active.checkEnd = checkEnd_1;
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
	return all(jgl.active.pastCorrect.slice(0,4));
}

function checkEndConditions_1() {
	return (jgl.active.delay>500) && all(jgl.active.pastCorrect);
}

function startTrial_1() {
	// Check if we should
	if (checkEndConditions_1()) {
		endBlock_();
		return;
	}
	jgl.active.pressed = false;
	jgl.active.dead = false;
}

function endTrial_1() {
	jgl.active.pastCorrect.shift();
	jgl.active.pastCorrect.push(jgl.trial.correct);
	if (checkTrialConditions_1()) {jgl.active.delay += 50; jgl.active.delay = Math.min(jgl.active.delay,500);}
	// if we've met the end conditions, end everthhing
	if (checkEndConditions_1()) {jgl.task[jgl.curBlock].numTrials=jgl.curTrial;}
}

function checkEnd_1() {
	if (jgl.trial!==undefined) {
		// The user raised the spacebar, check what to do
		if ((jgl.trial.thisseg=='sample') && (jgl.active.delay<200)) {
			// Check what to do here 
			if ((now()-jgl.timing.segment)>jgl.active.delay) {
				// Correct
				jgl.trial.correct = true;
				jumpSegment();
				return
			}
		} else if (jgl.trial.thisseg=='resp') {
			if ((now()-jgl.timing.segment)>(jgl.active.delay-200)) {
				// Correct
				jgl.trial.correct = true;
				jumpSegment();
			}
		} else {
			// If none of the above was true, then user f'd up
			jgl.active.dead = true;
		}
	}
}

function startSegment_1() {
	jgl.active.fix = 1;
	jgl.active.fixColor = "#ffffff";
	jgl.active.resp = 0;
	jgl.active.drawGratings = 0;
	jgl.active.delay = 0;

	switch (jgl.trial.segname) {
		case 'wait':
			break;
		case 'sample':
			jgl.active.drawGratings = 1;
			break;
		case 'delay':
			if (isNaN(jgl.trial.correct)) {
				jgl.active.fix = 0;
				jgl.active.delay = 1; // show the delay timer
				jgl.trial.seglen[jgl.trial.thisseg] = 5000;
			}
			break;
	}
}

function updateScreen_1(t) {
	if (jgl.active.delayTimer>0) {
		upTimer();
	}
	if (jgl.active.dead) {return;}
	if (jgl.active.fix) {
		jglFixationCross(jgl.screenInfo.pixPerDeg,1,jgl.active.fixColor,[0,0]);
	}
	if (jgl.active.drawGratings) {
		upGratings(jgl.active.gratings);
	}
	if (jgl.active.resp) {
		upResp();
	}
}

function upGratings() {
	jglFillRect(5,0,[1,1],'#ffffff');
}

function upResp() {

}

function upTimer() {
	// Draw the timer on the screen 
	jglTextDraw(Math.round(5-(now()-jgl.timing.segment)/1000),0,0);
}

function getResponse_1() {
	// check if our response was within jgl.active.respDelay of the stimulus start
	if (true) {
		
	}
}