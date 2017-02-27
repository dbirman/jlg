
function loadTask() {
	// CONSENT
	task[0] = {};
	task[0].type = 'consent';
	// consent is a default type with no callbacks
	task[0].callbacks = [];
	// consent has no data

	// RT TRIALS
	task[1] = {};
	task[1].type = 'trial'; // this will give us use of the canvas
	task[1].callbacks = [undefined,startTrial,startSegment,updateScreen,undefined];
	// RT task doesn't have any parameters, but this gets auto-populated with data
	task[1].parameters = {};
	// Segment timing
	task[1].segnames = ['delay','stim','iti'];
	// Seglen uses specific times
	task[1].segmin = [500,1000,1000];
	task[1].segmax = [2000,1000,3000];
	// Trials
	task[1].trials = 20; // can be infinite as well
}

function startTrial() {

}

function startSegment() {

}

function updateScreen() {
	
}
