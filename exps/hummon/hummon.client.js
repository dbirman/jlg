
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

	task[count++] = soundTestSetup();

	// // INSTRUCTIONS
	task[count] = {};
	task[count].type = 'instructions';
	task[count].variables = {};
	task[count].instructions = ['instruct-1','instruct-2'];
	count++;

	// var count = 7;
	// var levels = 1;
	// for (var i=1;i<=levels;i++) {
	// 	task[count++] = levelInstructionSetup(i);
	// 	task[count++] = window['levelSetup'+i]();
	// 	task[count++] = surveySetup();
	// }

	jgl.active = {}; // use this for tracking what's happening

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
	// Setup callback functions
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock;
	taskblock.callbacks.endBlock = endBlock;

	console.log(window['levelSetup'+num]);
	return window['levelSetup'+num](taskblock);
}

function startBlock() {
	jgl.active.dots = initDots(500,5,5,1,0,12,1);

	document.addEventListener("keydown",checkStartTrial,false);
	document.addEventListener("keyup",checkEndTrial,false);
}

function endBlock() {
	document.removeEventListener("keydown",checkStartTrial,false);
	document.removeEventListener("keyup",checkEndTrial,false);
}

function checkStartTrial(event) {
	if (event.which==32 && !jgl.active.pressed) {
		jgl.active.pressed = true;
		if (jgl.trial.segname=='wait') {
			event.preventDefault();
			jumpSegment();
		}
	}
}

function checkEndTrial(event) {
	if (event.which==32) {
		jgl.active.pressed = false;
		if ((jgl.trial.segname!='resp')&&(jgl.trial.segname!='iti')) {
			jgl.active.dead = true;
			return
		}
		if (jgl.trial.segname=='resp') {
			if (jgl.trial.responded[jgl.trial.thisseg]==0) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp = 0;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg] = now() - jgl.timing.segment;

			}
		}
		if (jgl.trial.segname=='iti') {
			if (jgl.trial.responded[jgl.trial.thisseg-1]==0) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp=1;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg]=0;
			}
			event.preventDefault();
			jumpSegment();
		}
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
	console.log(taskblock);
	taskblock.callbacks.startBlock = startBlock_1
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
	taskblock.numTrials = Infinity; // can be infinite as well
	// Keys

	return taskblock;
}

function startBlock_1() {
	document.addEventListener("keydown",checkStartTrial,false);
	document.addEventListener("keyup",checkEndTrial,false);

	startBlock();
}

function startTrial_1() {
	// Check if we should
	if (checkEndConditions_1()) {
		endBlock_();
		return;
	}

	jgl.active.dead = false;
	if (jgl.trial.match) {
		jgl.trial.dir2 = jgl.trial.dir1;
	} else {
		jgl.trial.dir2 = randomElement([0, Math.PI*1/4, Math.PI*1/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*6/4, Math.PI*7/4]);
		while (jgl.trial.dir1==jgl.trial.dir2) {
			jgl.trial.dir2 = randomElement([0, Math.PI*1/4, Math.PI*1/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*6/4, Math.PI*7/4]);
		}
	}
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
	taskblock.parameters.ecc = 5;
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
	taskblock.numTrials = 5; // can be infinite as well
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
	if ((crash>=2) || (mean(values)>500) || (mean(values)<100)) {
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
	taskblock.numTrials = 5; // can be infinite as well
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
	if ((crash>=2) || (mean(values)>500) || (mean(values)<100)) {
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