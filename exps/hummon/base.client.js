
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