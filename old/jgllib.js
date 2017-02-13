/**
 * JGL - A javascript Graphics Library.
 * Modeled after mgl (MATLAB graphics library)
 * 
 * Author - Tuvia Lerea
 * @author Tuvia Lerea
 * @module jgllib
 * 
 */

/** 
 * HTML page must have a div element with class="jgl"
 */


//--------------------------Setup and Globals----------------------
// Screen object, holds a bunch of info about the screen and state of the canvas
/**
 * The canvas object
 * @type Object
 */
var canvas;
// mouse object, tracks mouse state
/**
 * The mouse object, which is always updated to the current state of the mouse
 * @type Mouse
 */
var mouse;


/**
 * Screen object, contains the canvases and other information
 * @constructor
 * @property {Object} canvas the front canvas.
 * @property {Ojbect} context the context for the front canvas.
 * @property {Number} height the height of the canvas.
 * @property {Number} width the width of the canvas.
 * @property {Array} stencils an array of all of the saved stencils.
 * @property {Boolean} drawingStencil boolean to determine if you are currently drawing a stencil.
 * @property {Boolean} useStencil determines if you are currently using a stencil
 * @property {Number} stencilSelected the number of the currently selected stencil
 * @property {Number} viewDistance defaults to 24 inches
 * @property {Number} ppi the pixels per inch of the screen.
 * @property {Number} degPerPix the degrees in visual angles per pixel
 * @property {Number} pixPerDeg the pixels per degree of visual angle
 * @property {Boolean} usingVisualAngles tells if you are currently drawing in visual angles
 * @property {Boolean} usingVisualAnglesStencil tells if you are currently drawing in visual angels for your stencil
 * @property {String} backgroundColor the color of the background
 * @property {Number} lastFlushTime the time of the last call to flush
 * @property {Number} frameRate the number of frames per second
 * @property {Boolean} isOpen tells if jgllib is open. 
 */
function Canvas() {	
	this.canvas = document.getElementById("canvas");
	this.context = this.canvas.getContext("2d"); // main on-screen context
	this.height = $("#canvas").height(); // height of screen
	this.width = $("#canvas").width(); // width of screen
	this.stencils = []; // array of all stencil canvases
	this.drawingStencil = false; // Are you drawing a stencil?
	this.useStencil = false; // is a stencil in use?
	this.stencilSelected = 0; // if so, which?
	this.viewDistance = 24; // set to a default right now
	this.ppi = 0; // Pixels / Inch, gets set when jglOpen is called
	this.degPerPix = 0; // gets set in jglOpen
	this.pixPerDeg = 0; // gets set in jglOpen
	this.usingVisualAngles = false; // Is the drawing in visualAngles?
	this.usingVisualAnglesStencil = false; // Is the stencil using visualAngles?
	this.backgroundColor = "#ffffff";
	this.lastFlushTime = 0;
	this.frameRate = 30;
	this.isOpen = false;
}

/**
 * Creates a mouse object. 
 * @constructor
 * @property {Array} buttons [left, middle, right]
 * @property {Number} x the x-coordinate
 * @property {Number} y the y-coordinate
 */
function Mouse() {
	this.buttons = []; // [left, middle, right]
	this.x = 0; // x-coordinate
	this.y = 0; // y-coordinate
}

/**
 * Sets up the mouse tracker. 
 * Binds the mouse move, down, and up events to keep track of the mouse movements.
 * @param {Ojbect} mouse the mouse object to keep track of the location of the mouse.
 * @private
 */
function mouseSetup(mouse) {
	$(window).mousemove(function(event){
		mouse.x = event.pageX;
		mouse.y = event.pageY;
	});
	$(window).mousedown(function(event){
		var button = event.which;
		mouse.buttons[button - 1] = 1;
	});
	$(window).mouseup(function(event) {
		var button = event.which;
		mouse.buttons[button - 1] = 0;
	});
}

//----------------------Main Screen Functions--------------------

/**
 * Sets up the jgl screen. This function adds both canvases to the
 * end of the class="jgl" element. The two canvases are the two buffers, 
 * one is on screen one is off, more about this in the jglFlush doc.
 * @param {Number} resolution The ppi of the screen.
 */
function jglOpen(resolution) {
	var stencils = [];
	if (canvas !== undefined && canvas.hasOwnProperty("stencils")) {
		stencils = canvas.stencils;
	}
	$(".jgl").append("<div id=\"jglDiv\" style=\"position: relative;\"><canvas style=\" position: absolute; top: 0px; left: 0px;\" id=\"canvas\" width=\"800\" height=\"800\"></canvas>"
			+ "</div>");
	canvas = new Canvas();
	window.resizeTo(canvas.width + 50, canvas.height + 80);
	canvas.stencils = stencils;
	mouse = new Mouse();
	mouseSetup(mouse);
	canvas.ppi = resolution;
	var inPerDeg = canvas.viewDistance * (Math.tan(0.0174532925));
	canvas.pixPerDeg = resolution * inPerDeg;
	canvas.degPerPix = 1 / canvas.pixPerDeg;
	
	jglVisualAngleCoordinates();
	
	canvas.isOpen = true;
}

/**
 * Determines if jgllib is currently open
 * @returns {Boolean} true is yes, false if no
 */
function jglIsOpen() {
	if (canvas === undefined) {
		return false;
	}
	return canvas.isOpen;
}

/**
 * Closes jgllib by removing the canvases from the page
 * sets isOpen to false. 
 */
function jglClose() {
	$("#jglDiv").remove();
	canvas.isOpen = false;
}

/**
 * Private function for clearing a context, written to shorten code.
 * @param {Object} context the context to clear.
 * @private
 */
function privateClearContext(context) {
	if (canvas.usingVisualAngles) {
		context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
	} else {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
}

/**
 * Function to clear the front buffer, as well as set the background color.
 * @param {Number} background the color to set the background to. param can be given
 * as a number on the grayscale, 0-255 or an array of three numbers [r,g,b].
 */
function jglClearScreen(background) {
	// if (arguments.length != 0) {
	// 	var r, g, b;
	// 	if ($.isArray(background)) {
	// 		r = numToHex(background[0]);
	// 		g = numToHex(background[1]);
	// 		b = numToHex(background[2]);
	// 	} else {
	// 		r = numToHex(background);
	// 		g = numToHex(background);
	// 		b = numToHex(background);
	// 	}
	// 	canvas.backgroundColor = "#" + r + g + b;

	// }
	canvas.backgroundColor = con2hex(background);
	privateClearContext(canvas.context);
}

/**
 * Waits the given number of seconds. WARNING may not work!!
 * @param {Number} secs the number of seconds to wait.
 */
function jglWaitSecs(secs) {
	console.log('NOT FUNCTIONAL');
	return;
	var first, second;
	first = new Date();
	var current = first.getTime();
	do {
		second = new Date();
	} while (Date.now() < current + (secs * 1000));
	
//	setTimeout(secs, function(){});
}

//------------------------Keyboard and Mouse functions ---------------------

/**
 * A function for getting information about the mouse.
 * @return A Mouse object, contains x, y, and buttons 
 * fields. buttons is a logical array, 1 means that button
 * is pressed.
 */
var jglGetMouse = function jglGetMouse() {
	return mouse;
}

/**
 * Function to gain access to the mouse event listener.
 * @param {Object} mouseEventCallback the mouse down callback function. 
 * This function must take an event object as a parameter.
 * @private
 */
function jglOnMouseClick(mouseEventCallback) {
	$(window).mouseDown(function(event) {
		mouseEventCallback(event);
	});
}

/**
 * Function to gain access to the key down event listener.
 * @param {Ojbect} keyDownEventCallback the key down callback Function.
 * This function must take an event object as a parameter.
 * @private
 */
function jglOnKeyDown(keyDownEventCallback) {
	$(window).keyDown(function(event) {
		keyDownEventCallback(event);
	});
}

/**
 * Function to get all active keys.
 * @returns {Array} an array of all active keys
 */
var jglGetKeys = function jglGetKeys() {
	return KeyboardJS.activeKeys();
}

//----------------------Coordinate Functions---------------------------

/**
 * Function for changing to visual Angle Coordinates.
 * If this function is called while drawing a stencil, 
 * it does not effect the normal canvas. 
 */
function jglVisualAngleCoordinates() {
	if ((canvas.usingVisualAngles && ! canvas.drawingStencil) || 
			(canvas.usingVisualAnglesStencil && canvas.drawingStencil)) {
		//Error
		throw "VisualCoordinates: Already using visual coordinates";
	}
	canvas.context.save();
	canvas.context.translate(canvas.width / 2, canvas.height / 2);
	canvas.context.transform(canvas.pixPerDeg,0,0,canvas.pixPerDeg, 0,0);
	
	canvas.context.save();
	canvas.context.translate(canvas.width / 2, canvas.height / 2);
	canvas.context.transform(canvas.pixPerDeg,0,0,canvas.pixPerDeg, 0,0);
	
	if (! canvas.drawingStencil) {
		canvas.usingVisualAngles = true;
	} else {
		canvas.usingVisualAnglesStencil = true;
	}
}

/**
 * Function for changing to screen coordinates.
 * If this function is called while drawing a stencil,
 * it does not effect the normal canvas.
 */
function jglScreenCoordinates() {
	if ((! canvas.usingVisualAngles && ! canvas.drawingStencil) || 
			(canvas.drawingStencil && ! canvas.usingVisualAnglesStencil)) {
		// Error
		throw "ScreenCoordinates: Already using screen coordinates";
	}
	canvas.context.restore();
	
	canvas.context.restore();
	if (! canvas.drawingStencil) {
		canvas.usingVisualAngles = false;
	} else {
		canvas.usingVisualAnglesStencil = false;
	}
}

/**
 * Function to get a parameter of the canvas object. 
 * @param {String} str the name of the parameter
 * @returns the value of that field in canvas
 */
function jglGetParam(str) {
	return eval("canvas." + str);
}

/**
 * Function to set a parameter of the canvas object
 * @param {String} param the field to set
 * @param {Any} val the value to set it to.
 */
function jglSetParam(param, val) {
	eval("canvas." + param + " = " + val);
}

////////////////////
// JGL PAGE CONTROLS
////////////////////


function jglGetPage(pagename) {
	if (!(pagename in self.pages)){
	    throw new Error(
		["Attemping to load page before preloading: ",
		pagename].join(""));
	};
	return self.pages[pagename];
}

function jglPreloadPages(pagenames) {
	//code copied from psiturk
	$(pagenames).each(function() {
		$.ajax({
			url: this,
			success: function(page_html) { self.pages[this.url] = page_html;},
			dataType: "html",
			async: false
		});
	});
}

function jglChangePage(pagename) {
	$('body').html(jglGetPage(pagename));
}