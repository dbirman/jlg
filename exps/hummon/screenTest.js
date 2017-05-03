
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
	taskblock.parameters.ecc = 5*jgl.screenInfo.pixPerDeg;
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
	taskblock.numTrials = 6; // can be infinite as well
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
	if ((crash>=2) || (mean(values)>750) || (mean(values)<100)) {
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
	jglFixationCross();
	if (jgl.active.stim && (jgl.trial.segname=='stim')) {
		jglFillRect(jgl.trial.ecc*Math.cos(jgl.trial.angle), jgl.trial.ecc*Math.sin(jgl.trial.angle), [1, 1], jgl.active.color);
	}
}

function getResponse_screen() {
	jgl.trial.reaction = jgl.trial.RT[jgl.trial.thisseg];
	jgl.active.color="#000000";
}