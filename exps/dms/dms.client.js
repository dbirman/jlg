
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

	task[3] = addTaskBlock(10);

	// FIRST BLOCK
	task[2] = {};
	task[2].type = 'instructions';
	// instructions is a default type with no callbacks
	// it simply displays whatever divs we specify by adding them to an instruction page and showing/hiding them in order
	task[2].variables = {};
	task[2].instructions = ['instruct-block1'];

	jgl.live = {}; // use this for tracking what's happening

	jgl.live.dots = 

	return task;
}

function addTaskBlock(numTrials,practice) {

	// RT TRIALS
	taskblock = {};
	taskblock.type = 'trial'; // this will give us use of the canvas
	// Set minimum screen dimensions 
	taskblock.minX = 5;
	taskblock.minY = 5;
	// Setup callback functions
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock;
	taskblock.callbacks.startSegment = startSegment;
	taskblock.callbacks.endBlock = endBlock;
	taskblock.callbacks.updateScreen = updateScreen;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	taskblock.parameters.practice = 1;
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	// Segment timing
	taskblock.segnames = ['wait','sample','delay','test','resp','iti'];
	// Seglen uses specific times
	taskblock.segmin = [Infinity,650,650,650,1500,Infinity];
	taskblock.segmax = [Infinity,650,650,650,1500,Infinity];
	// Responses
	taskblock.response = [0,0,0,0,0,1,0];
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	taskblock.keys = 32;
	// Trials
	taskblock.numTrials = numTrials; // can be infinite as well
	// Keys

	return taskblock;
}

function startBlock() {
	document.addEventListener("keydown",checkStartTrial,false);
	document.addEventListener("keyup",checkEndTrial,false);
}

function endBlock() {
	document.removeEventListener("keydown",checkStartTrial,false);
	document.removeEventListener("keyup",checkEndTrial,false);
}

function checkStartTrial(event) {
	if (jgl.trial.segname=='wait' && event.which==32) {
		event.preventDefault();
		jumpSegment();
	}
}

function checkEndTrial(event) {

}

function startSegment() {
	jgl.live.fix = 0;
	jgl.live.dots = 0;
	switch(jgl.trial.segname) {
		case 'wait':
			jgl.live.fix = 1;
			break;
		case 'sample':
			jgl.live.fix = 1;
			break;
		case 'delay':
			jgl.live.fix = 1;
			break;
		case 'test':
			jgl.live.fix = 1;
			break;
		case 'resp':
			break;
		case 'iti':
			break;
	}
}

function updateScreen() {
	if (jgl.live.fix) {jglFixationCross();}
	if (jgl.live.dots) {drawDots();}
}


// A dots drawing package for changing motion coherence

function initDots(n,maxx,maxy,coherent,dir,spd,sz) {
	if (arguments.length < 7) {
		throw new Error('Not enough arguments for initDots()');
	}
	var dots = {};
	dots.n = n;
	dots.minx = 0;
	dots.miny = 0;
	dots.maxx = maxx;
	dots.maxy = maxy;
	dots.x = zeros(n);
	dots.y = zeros(n);
	dots.coherent = [];
	dots.speed = spd;
	dots.size = sz;
	dots.szoff = Math.floor(dots.size/2);
	dots.dir = dir;
	for (var i=0;i<n;i++) {
		dots.x[i] = Math.random()*dots.maxx;
		dots.y[i] = Math.random()*dots.maxy;
		dots.coherent.push(Math.random()<coherent);
	}
	if (!((dots.size % 2)==1)) {
		console.log('Dot size must be odd');
	}
	return dots;
}

function updateDots(dots,coherent,dir,elapsed) {
	if (typeof(dir) !== 'undefined') {dots.dir = dir;}

	for (var i=0;i<dots.n;i++) {
		dots.coherent[i] = Math.random()<coherent;
		var xs, ys;
		if (dots.coherent[i]) {
			xs = Math.cos(dots.dir);
			ys = Math.sin(dots.dir);
		} else {
			xs = Math.cos(Math.random()*2*Math.PI);
			ys = Math.sin(Math.random()*2*Math.PI);
		}
		dots.x[i] += xs*dots.speed*elapsed;
		dots.y[i] += ys*dots.speed*elapsed;
		if (dots.x[i]>dots.maxx) {dots.x[i] -= dots.maxx;}
		if (dots.y[i]>dots.maxy) {dots.y[i] -= dots.maxy;}
		if (dots.x[i]<0) {dots.x[i] += dots.maxx;}
		if (dots.x[i]<0) {dots.y[i] += dots.maxy;}
	}
	return dots;
}

function drawDots(dots,ctx) {
	ctx.fillStyle = "#ffffff";
	for (var i=0;i<dots.n;i++) {
		ctx.fillRect(Math.round(dots.x[i])-dots.szoff,Math.round(dots.y[i])-dots.szoff,dots.size,dots.size);
	}
}
