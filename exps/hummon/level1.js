
function levelSetup1(taskblock) {
	taskblock.callbacks.startTrial = startTrial_1;
	taskblock.callbacks.startSegment = startSegment_1;
	taskblock.callbacks.updateScreen = updateScreen_1;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.ecc = 5;
	taskblock.variables.angle = 0; // display angle, ecc constant
	taskblock.variables.rotation = multiply(Math.PI,[0,1/8,2/8,3/8,4/8,5/8,6/8,7/8]); // actual orientation
	// Segment timing
	taskblock.segnames = ['wait','sample','iti'];
	// Seglen uses specific times
	taskblock.seglen = [Infinity,200,Infinity];
	// Responses
	taskblock.response = [0,1,0];
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	// taskblock.keys = 32;
	// Trials
	taskblock.numTrials = 250; // if we make it to 250 then we cancel the experiment
	// Keys

	return taskblock;
}

function checkEndConditions_1() {
	return false;
}

function startTrial_1() {
	// Check if we should
	if (checkEndConditions_1()) {
		endBlock_();
		return;
	}

	jgl.active.dead = false;
}

function startSegment_1() {
	jgl.active.fix = 0;
	jgl.active.fixColor = "#ffffff";
	jgl.active.drawDots = 0;
	jgl.active.resp = 0;
	jgl.active.dir = 0;
	switch (jgl.trial.segname) {
		case 'wait':
			jgl.active.fix = 1;
			break;
		case 'sample':
			jgl.active.fix = 1;
			jgl.active.drawDots = 1;
			jgl.active.dir = jgl.trial.dir1;
			break;
		case 'iti':
			if (isNaN(jgl.trial.correct)) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp=1;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg]=0;
				jgl.active.fix = 1;
			}
			if (!jgl.active.pressed) {setTimeout(jumpSegment,1000);}
			break;
	}
}

function updateScreen_1(t) {
	if (jgl.active.fix) {
		jglFixationCross(jgl.screenInfo.pixPerDeg,1,jgl.active.fixColor,[0,0]);
	}
	if (jgl.active.drawGratings) {
		upGratings(jgl.active.gratings);
	}
	if (jgl.active.resp) {
		upResp();
	}
	if (jgl.active.delayTimer>0) {
		upTimer();
	}
}