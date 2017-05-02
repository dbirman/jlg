
function loadTask() {
	var task = [];
	// CONSENT
	task[0] = {};
	task[0].type = 'consent';
	// consent is a default type with no callbacks
	task[0].variables = {};
	task[0].variables.consent = NaN;
	// consent has no data

	// // SURVEY DEMOGRAPHICS
	task[1] = {};
	task[1].type = 'survey';
	task[1].surveys = ['survey-demo'];
	task[1].variables = {};

	// SCREEN TEST
	task[2] = {};
	task[2].type = 'instructions';
	task[2].instructions = ['screen-test'];
	task[2].variables = {};

	task[3] = screenTestSetup();

	// SCREEN TEST
	task[4] = {};
	task[4].type = 'instructions';
	task[4].instructions = ['sound-test'];
	task[4].variables = {};

	task[5] = scoundTestSetup();

	// // INSTRUCTIONS
	task[6] = {};
	task[6].type = 'instructions';
	task[6].variables = {};
	task[6].instructions = ['instruct-1','instruct-2'];

	var count = 7;
	for (var i=1;i<=7;i++) {
		task[count++] = levelInstructionSetup(i);
		task[count++] = levelSetup(i);
		task[count++] = surveySetup();
	}

	jgl.active = {}; // use this for tracking what's happening

	return task;
}

function levelInstructionSetup(num) {
	taskblock = {};
	taskblock.type = 'instructions';
	taskblock.variables = {};
	taskblock.instructions = ['level-'+num];
}

function surveySetup() {
	taskblock = {};
	taskblock.type = 'survey';
	taskblock.variables = {};
	taskblock.surveys = ['survey-rule'];
}

function levelSetup(num) {
	// RT TRIALS
	taskblock = {};
	taskblock.type = 'trial'; // this will give us use of the canvas
	// Set minimum screen dimensions 
	taskblock.minX = 8;
	taskblock.minY = 8;
	// Setup callback functions
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock;
	taskblock.callbacks.endBlock = endBlock;

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