
function loadTask() {
	var task = [];
	// CONSENT
	task[0] = {};
	task[0].type = 'consent';
	// consent is a default type with no callbacks
	task[0].callbacks = {};
	// consent has no data

	// RT TRIALS
	task[1] = {};
	task[1].type = 'trial'; // this will give us use of the canvas
	task[1].callbacks = {};
	task[1].callbacks.startSegment = startSegment;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	task[1].parameters = {};
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	task[1].variables = {};
	// Segment timing
	task[1].segnames = ['delay','stim','iti'];
	// Seglen uses specific times
	task[1].segmin = [500,1000,1000];
	task[1].segmax = [2000,1000,3000];
	// Responses
	task[1].response = [0,1,0];
	// Trials
	task[1].numTrials = 20; // can be infinite as well

	return task;
}

function startTrial() {

}

function startSegment() {

}

function updateScreen() {
	
}
