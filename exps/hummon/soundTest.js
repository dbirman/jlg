
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
	taskblock.parameter.sound = [0,1];
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.reaction = NaN; // we will pick randomly
	// Segment timing
	taskblock.segnames = ['delay','stim'];
	// Seglen uses specific times
	taskblock.segmin = [0,1000];
	taskblock.segmax = [1000,1000];
	// Responses
	taskblock.response = [0,0,1];
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	// taskblock.keys = 32;
	// Trials
	taskblock.numTrials = 5; // can be infinite as well
	// Keys

	return taskblock;
}

function startBlock_sound() {
	jglInitTone(100,200,'low');
	jglInitTone(500,200,'high');
}

function endBlock_sound() {
	// Get RT values
	values = zeros(5);
	for (var i=0;i<5;i++) {
		values[i] = jgl.data.reaction[i];
	}
	if ((mean(values)>500) || (mean(values)<100)) {
		// They're probably fucking around
		alert('There is a problem with your sound system, it is not playing the stimulus with the correct timing. We''re really sorry. This is likely a browser incompatibility issue. Please close this window and return the HIT.');
		jgl.curBlock = -Infinity; // this will crash the code without allowing participants to continue
		endExp_();
	}
}

function startTrial_sound() {
	jgl.active = {};
	jgl.active.stim = true;
}

function updateScreen_sound() {
	if (jgl.active.stim && (jgl.trial.segname=='stim')) {
		opts = ['low','high'];
		jglPlayTone(opts[jgl.trial.sound]);
	}
}

function getResponse_sound() {
	jgl.trial.reaction = jgl.trial.RT[jgl.trial.thisseg];
}