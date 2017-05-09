
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
	// Segment timing
	taskblock.segnames = ['wait','sample1','delay1','sample2','resp','delay'];
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

function startBlock_2() {
	// Current delay: only thing we will adjust
	// this controls how far after the sample time starts should we
	// play the sound
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
	return (jgl.active.delay>=500) && all(jgl.active.pastCorrect);
}

function startTrial_2() {
	// Check if we should
	if (checkEndConditions_2()) {
		endBlock_();
		return;
	}
	jgl.trial.delay = jgl.active.delayStaircase; // this will increment

	jgl.active.trialUp = false;
	jgl.active.trialDown = false;
	jgl.active.dead = false;
	jgl.active.soundPlayed = false;
}

function endTrial_2() {
	jgl.active.pastCorrect.shift();
	jgl.active.pastCorrect.push(jgl.trial.correct);
	if (checkTrialConditions_2()) {jgl.active.delayStaircase += 50; jgl.active.delayStaircase = Math.min(jgl.active.delayStaircase,500);}
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

function updateScreen_2(t) {
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
				jglPlayTone(jgl.trial.tone);
				jgl.active.soundPlayed = true;
			}
			break;
		case 'resp':
			if ((!jgl.active.soundPlayed) && ((now()-jgl.timing.segment)>(jgl.trial.delay-200))) {
				jglPlayTone(jgl.trial.tone);
				jgl.active.soundPlayed = true;
			}
			break;
	}
	// if (jgl.active.resp) {
	// 	upResp();
	// }
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