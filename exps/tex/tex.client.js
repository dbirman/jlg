
function loadTask() {
	var task = [];
	// CONSENT
	task[0] = {};
	task[0].type = 'consent';
	task[0].type = 'skip';
	// consent is a default type with no callbacks
	task[0].variables = {};
	task[0].variables.consent = NaN;
	// consent has no data

	// RT TRIALS
	task[1] = {};
	task[1].type = 'trial'; // this will give us use of the canvas
	task[1].callbacks = {};
	task[1].callbacks.startSegment = startSegment;
	task[1].callbacks.updateScreen = updateScreen;
	task[1].callbacks.getResponse = getResponse;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	task[1].parameters = {};
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	task[1].variables = {};
	task[1].variables.key = undefined;
	// Segment timing
	task[1].segnames = ['delay','stim','iti'];
	// Seglen uses specific times
	task[1].segmin = [1000,100000,100000];
	task[1].segmax = [1000,100000,100000];
	// Responses
	task[1].response = [0,1,0];
	// Trials
	task[1].numTrials = 1; // can't be infinite, best to have smaller blocks with breaks in between (e.g. an instruction page that is blank)
	// Keys
	task[1].keys = 32; // (check w/ http://keycode.info/)

	return task;
}

let fix, tex, texSprite, showResp, rt_text;

function startSegment() {
	if (jgl.trial.segname=='delay') {
		if (rt_text!=undefined) {rt_text.destroy();}
		fix = jglFixationCross();
	}
	if (jgl.trial.segname=='stim') {
		fix.destroy();
		tex = jglCreateTexture('exps/tex/imgs/example1.jpg');
		console.log(tex);
		texSprite = jglBltTexture(tex,0,0,math.PI/4);

	}
}

function updateScreen() { 
	
}

function getResponse() {
	jgl.trial.key = jgl.event.key.keyCode;
}