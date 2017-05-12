
function loadTask() {
	var task = [];

	var count=0;
	// CONSENT
	task[count] = {};
	task[count].type = 'consent';
	// consent is a default type with no callbacks
	task[count].variables = {};
	task[count].variables.consent = NaN;
	count++;
	// consent has no data

	// // SURVEY DEMOGRAPHICS
	task[count] = {};
	task[count].type = 'survey';
	task[count].surveys = ['survey-demo'];
	task[count].variables = {};
	count++;

	// SCREEN TEST
	task[count] = {};
	task[count].type = 'instructions';
	task[count].instructions = ['screen-test'];
	task[count].variables = {};
	count++;

	task[count++] = screenTestSetup();

	// SCREEN TEST
	task[count] = {};
	task[count].type = 'instructions';
	task[count].instructions = ['sound-test'];
	task[count].variables = {};
	count++;

	task[count++] = soundTestSetup();

	// // INSTRUCTIONS
	task[count] = {};
	task[count].type = 'instructions';
	task[count].variables = {};
	task[count].instructions = ['instruct-1','instruct-2'];
	count++;

	var levels = 3;
	for (var i=1;i<=levels;i++) {
		task[count++] = levelInstructionSetup(i);
		task[count++] = levelSetup(i);
		task[count++] = surveySetup();
	}

	// Setup sounds
	jglInitTone(500,200,'low');
	jglInitTone(1500,200,'high');

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

	return window['levelSetup_'+num](taskblock);
}

function checkStartTrial(event) {
	if (event.which==32) {
		jgl.active.pressed = true;

		if (!jgl.active.trialUp && (jgl.trial.segname=='wait')) {
			jgl.active.trialUp = true;
			event.preventDefault();
			setTimeout(jumpSegment,500); 
		}
	}
}

function checkEndTrial(event) {
	if (event.which==32) {
		jgl.active.pressed = false;

		if (!jgl.active.trialDown && !(jgl.trial.segname=='wait')) {
			jgl.active.trialDown = true;
			// call the local function
			jgl.active.checkEnd();
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

function setWaitFixColor(t) {
	if (jgl.active.fixTime===undefined) {
		jgl.active.fixTime=0;
		jgl.active.cFixColor=false;
		jgl.active.fixColors=["#808080","#1414C8"];
	}
	jgl.active.fixTime+=t;
	if (jgl.active.fixTime>500) {
		jgl.active.fixTime = 0;
		jgl.active.cFixColor = !jgl.active.cFixColor;
		jgl.active.fixColor = jgl.active.fixColors[jgl.active.cFixColor+0];
	}
}

function playSound() {
	jglPlayTone(jgl.trial.tone);
	jgl.active.soundPlayed = true;
}

function upGratings(ecc,angle,rotation) {
	jglDrawGrating("grating",ecc*Math.cos(angle),ecc*Math.sin(angle),rotation);
}