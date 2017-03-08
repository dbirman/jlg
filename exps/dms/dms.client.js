
function loadTask() {
	var task = [];
	// CONSENT
	task[0] = {};
	task[0].type = 'consent';
	// consent is a default type with no callbacks
	task[0].variables = {};
	task[0].variables.consent = NaN;
	// consent has no data

	// SURVEY DEMOGRAPHICS
	task[1] = {};
	task[1].type = 'survey';
	// survey is a default type with no callbacks
	// the demographics survey is a default type
	task[1].surveys = ['survey-demo'];
	task[1].variables = {};
	// the default survey type needs an answer list that we can push to
	// as we get answers
	// if we don't set this it will be done automatically
	task[1].variables.answers = [];

	// INSTRUCTIONS
	task[2] = {};
	task[2].type = 'instructions';
	// instructions is a default type with no callbacks
	// it simply displays whatever divs we specify by adding them to an instruction page and showing/hiding them in order
	task[2].variables = {};
	task[2].instructions = ['instruct-1','instruct-2','instruct-3','instruct-4'];

	// RT TRIALS
	task[3] = {};
	task[3].type = 'trial'; // this will give us use of the canvas
	// Set minimum screen dimensions 
	task[3].minX = 5;
	task[3].minY = 5;
	// Setup callback functions
	task[3].callbacks = {};
	task[3].callbacks.startBlock = startBlock;
	task[3].callbacks.endBlock = endBlock;
	task[3].callbacks.updateScreen = updateScreen;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	task[3].parameters = {};
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	task[3].variables = {};
	// Segment timing
	task[3].segnames = ['wait','sample','delay','test','resp','iti'];
	// Seglen uses specific times
	task[3].segmin = [Infinity,650,650,650,1500,500];
	task[3].segmax = [Infinity,650,650,650,1500,1500];
	// Responses
	task[3].response = [0,0,0,0,0,1,0];
	// Backgroud color (defaults to 0.5)
	task[3].background = 0.5;
	// If you give different keys 
	task[3].keys = 32;
	// Trials
	task[3].numTrials = 1; // can be infinite as well
	// Keys

	// SURVEY 1
	// task[3] = {};
	// task[3].type = 'survey'; // a standard type which uses a surveyAnswer(value) callback to store data
	// task[3].surveys = ['']

	return task;
}

function startBlock() {
	document.addEventListener("keyup",checkStartTrial,false);
}

function endBlock() {
	document.removeEventListener("keyup",checkStartTrial,false);
}

function checkStartTrial(event) {
	if (jgl.trial.segname=='wait' && event.which==32) {
		jumpSegment();
	}
}

function updateScreen() {
	if (jgl.trial.segname=='delay') {
		jglFixationCross();
	}
	if (jgl.trial.segname=='stim' && !jgl.trial.responded) {
		jglFillRect(0,0,[1,1],'#ffffff');
	} else if (jgl.trial.responded) {
		if (jgl.trial.RT<300) {
			jglTextSet('Arial',1,'#00ff00');
		} else {
			jglTextSet('Arial',1,'#ff0000');
		}
		jglTextDraw(Math.round(jgl.trial.RT),0,0);
	}
}