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

//-------------------Drawing Different Shapes-------------------

/**
 * Function for drawing 2D points.
 * @param {Array} x array of x coordinates
 * @param {Array} y array of y coordinates
 * @param {Number} size Size of point in degrees (diameter)
 * @param {String} color Color of points in #hex format
 */
function jglPoints2(x, y, size, color) {
	if (x.length != y.length) {
		// Error
		throw "Points2: Lengths dont match";
	}
	for (var i=0;i<x.length;i++) {
		canvas.context.fillStyle=color;
		canvas.context.beginPath();
		canvas.context.arc(x[i], y[i], size/2, 0, 2*Math.PI);
		canvas.context.fill();
		canvas.context.closePath();
	}
	//screen.context.save();
}

/**
 * Function for drawing 2D Lines
 * @param {Array} x0 array of starting x coordinates
 * @param {Array} y0 array of starting y coordinates
 * @param {Array} x1 array of ending x coordinates
 * @param {Array} y1 array of ending y coordinates
 * @param {Number} size width of line in pixels
 * @param {String} color in hex format "#000000"
 */
function jglLines2(x0, y0, x1, y1, size, color) {
	if (x0.length != y0.length || x1.length != y1.length || x0.length != x1.length) {
		//Error
		throw "Lines2: Lengths dont match";
	}
	for (var i=0;i<x0.length;i++) {
		canvas.context.lineWidth = size;
		canvas.context.strokeStyle=color;
		canvas.context.beginPath();
		canvas.context.moveTo(x0[i], y0[i]);
		canvas.context.lineTo(x1[i], y1[i]);
		canvas.context.stroke();
	}
}

function jglFillOval(x, y, size, color) {
	if (x.length != y.length || size.length != 2) {
		//Error
		throw "Fill Oval: Lengths dont match";
	}
	var radius = Math.min(size[0], size[1]);
	canvas.context.save();
	canvas.context.transform(0, size[0], size[1],0,0,0);
	jglPoints2(x, y, radius, color);
	canvas.context.restore();
}

function jglFillArc(x, y, size, color, sAng, wAng) {
	if (x.length != y.length) {
		//Error
		throw "Fill Oval: Lengths dont match";
	}
	canvas.context.fillStyle=color;
	canvas.context.beginPath();
	canvas.context.moveTo(0,0);
	canvas.context.arc(x,y,size,sAng,wAng);
	canvas.context.fill();
	canvas.context.closePath();
}

/**
 * Makes Filled Rectangles
 * @param {Array} x an array of x coordinates of the centers
 * @param {Array} y an array of y coordinates of the centers
 * @param {Array} size [width,height] array
 * @param {String} color color in hex format #000000
 */
function jglFillRect(x, y, size, color) {
	if (x.length != y.length || size.length != 2) {
		//Error
		throw "Fill Rect: Lengths dont match"
	}
	var upperLeft = {
			x:0,
			y:0
	};
	for (var i=0;i<x.length;i++) {
		canvas.context.fillStyle = color;
		upperLeft.x = x[i] - (size[0] / 2);
		upperLeft.y = y[i] - (size[1] / 2);
		canvas.context.fillRect(upperLeft.x, upperLeft.y, size[0], size[1]);
	}
}

/**
 * Draws a fixation cross onto the screen. 
 * If no params are given, cross defaults to center,
 * with lineWidth = 1, width = 10, and black.
 * @param {Number} width the width of the cross
 * @param {Number} lineWidth the width of the lines of the cross
 * @param {String} color the color in hex format
 * @param {Array} origin the center point in [x,y]
 */
function jglFixationCross(width, lineWidth, color, origin) {
	
	if (arguments.length == 0) {
		if (canvas.usingVisualAngles) {
			width = 1;
			lineWidth = 0.04;
			color = "#ff0000";
			origin = [0 , 0];
		} else {
			width = 20;
			lineWidth = 1;
			color = "#ff0000";
			origin = [canvas.backCanvas.width / 2 , backCanvas.height / 2];
		}
		
	}
	canvas.context.lineWidth = lineWidth;
	canvas.context.strokeStyle = color;
	canvas.context.beginPath();
	canvas.context.moveTo(origin[0] - width / 2, origin[1]);
	canvas.context.lineTo(origin[0] + width / 2, origin[1]);
	canvas.context.stroke();
	canvas.context.beginPath();
	canvas.context.moveTo(origin[0], origin[1] - width / 2);
	canvas.context.lineTo(origin[0], origin[1] + width / 2);
	canvas.context.stroke();
}

/**
 * Function for drawing a polygon.
 * The x and y params lay out a set of points.
 * @param {Array} x the x coordinates
 * @param {Array} y the y coordinates
 * @param {String} color the color, in hex format #000000
 */
function jglPolygon(x, y, color) {
	if (x.length != y.length || x.length < 3) {
		// Error, need at least three points to
		// make a polygon.
		throw "Polygon arrays not same length";
	}
	canvas.context.fillStyle = color;
	canvas.context.strokeStyle = color;
	canvas.context.beginPath();
	canvas.context.moveTo(x[0], y[0]);
	for (var i=1;i<x.length;i++) {
		canvas.context.lineTo(x[i], y[i]);
	}
	canvas.context.closePath();
	canvas.context.fill();
//	backCtx.stroke();
}


//----------------Timing Functions---------------------------

/**
 * Gets the current seconds since Jan 1st 1970.
 * @return Returns the seconds value;
 */
function jglGetSecs(t0) {
	if (t0 === undefined) {
		var d = new Date();
		return d.getTime() / 1000;
	} else {
		var d = new Date();
		return (d.getTime() / 1000) - t0;
	}
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

//-----------------------Text Functions------------------------

/**
 * Function to set the text params. Needs to be called right before jglTextDraw
 * @param {String} fontName the name of the font to use
 * @param {Number} fontSize the size of the font to use
 * @param {String} fontColor the color of the font to use
 * @param {Number} fontBold 1 for bold, 0 for not
 * @param {Number} fontItalic 1 for italic, 0 for not
 */
function jglTextSet(fontName, fontSize, fontColor, fontBold, fontItalic) {
	// fontString needs to be in a specific format, this function builds it.
	var fontString = "";
	if (fontBold == 1) {
		fontString = fontString.concat("bold ");
	}
	
	if (fontItalic == 1) {
		fontString = fontString.concat("italic ");
	}
	
	fontString = fontString.concat(fontSize, "px ", fontName);
	canvas.context.font = fontString;
	canvas.context.fillStyle = fontColor;
}

/**
 * Draws the given text starting at (x, y)
 * @param {String} text the text to be drawn
 * @param {Number} x the x coordinate of the beginning of the text
 * @param {Number} y the y coordinate of the beginning of the text
 */
function jglTextDraw(text, x, y) {
	canvas.context.fillText(text, x, y);
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

//--------------------------Texture Functions-----------------------------------

/**
 * Function to make array starting at low,
 * going to high, stepping by step.
 * @param {Number} low The low bound of the array
 * @param {Number} step the step between two elements of the array
 * @param {Number} high the high bound of the array
 */
function jglMakeArray(low, step, high) {
	if (step === undefined) {
		step = 1;
	}
	
	if (low < high) {
		var size = Math.floor((high - low) / step);
		var array = new Array(size);
		array[0] = low;
		for (var i=1;i<array.length;i++) {
			array[i] = array[i-1] + step;
		}
		return array;
	} else if (low > high) {
		var size = Math.floor((low - high) / step);
		var array = new Array(size);
		array[0] = low;
		for (var i=1;i<array.length;i++) {
			array[i] = array[i-1] - step;
		}
		return array;
	}
	return [low];
}

function repmat(array,reps) {
	out = [];
	for (i=0;i<reps;i++) {
		out = out.concat(array);
	}
	return(out);
}

/**
 * Function for generating jgl textures.
 * This function does different things depending on
 * what it is given. If a 1D array is passed in, 
 * the array is replicated down to make a square and the
 * resulting texture is returned, the texture is using grayscale.
 * If a 2D array is passed, a greyscale texture is created and returned.
 * If a 3D array is passed, if it is NxMx3 an RGB texture is returned,
 * and if it is NxMx4 and RGB and Alpha texture is returned.
 * @param {Array} array the array to pass in.
 * @returns the texture
 */
function jglCreateTexture(array) {
	
	/* Note on how imageData's work.
	 * ImageDatas are returned from createImageData,
	 * they have an array called data. The data array is
	 * a 1D array with 4 slots per pixel, R,G,B,Alpha. A
	 * greyscale texture is created by making all RGB values
	 * equals and Alpha = 255. The main job of this function
	 * is to translate the given array into this data array.
	 */
	if (! $.isArray(array)) {
		return;
	}
	var image;
	if ( ! $.isArray(array[0])) {
		// 1D array passed in
		image = canvas.context.createImageData(array.length, array.length);
		var counter = 0;
		for (var i=0;i<image.data.length;i += 4) {
			image.data[i + 0] = array[counter];
			image.data[i + 1] = array[counter];
			image.data[i + 2] = array[counter];
			image.data[i + 3] = 255;
			counter++;
			if (counter == array.length) {
				counter = 0;
			}
		}
		return image;
		
	} else if (! $.isArray(array[0][0])) {
		// 2D array passed in
		image = canvas.context.createImageData(array.length, array.length);
		var row = 0;
		var col = 0;
		for (var i=0;i<image.data.length;i += 4) {
			image.data[i + 0] = array[row][col];
			image.data[i + 1] = array[row][col];
			image.data[i + 2] = array[row][col];
			image.data[i + 3] = 255;
			col++;
			if (col == array[row].length) {
				col = 0;
				row++;
			}
		}
		return image;
	
	} else {
		// 3D array passed in
		if (array[0][0].length == 3) {
			// RGB
			image = canvas.context.createImageData(array.length, array.length);
			var row = 0;
			var col = 0;
			for (var i=0;i<image.data.length;i += 4) {
				image.data[i + 0] = array[row][col][0];
				image.data[i + 1] = array[row][col][1];
				image.data[i + 2] = array[row][col][2];
				image.data[i + 3] = 255;
				col++;
				if (col == array[row].length) {
					col = 0;
					row++;
				}
			}
			return image;
		} else if(array[0][0].length == 4) {
			//RGB and Alpha
			image = canvas.context.createImageData(array.length, array.length);
			var row = 0;
			var col = 0;
			for (var i=0;i<image.data.length;i += 4) {
				image.data[i + 0] = array[row][col][0];
				image.data[i + 1] = array[row][col][1];
				image.data[i + 2] = array[row][col][2];
				image.data[i + 3] = array[row][col][3];
				col++;
				if (col == array[row].length) {
					col = 0;
					row++;
				}
			}
			return image;
		} else {
			//Error
			throw "jglCreateTexture: invalid array dimensions";
		}
	}
}

/**
 * Function for drawing the given texture to screen. All params except texture
 * are optional, defaults to center with 0 rotation.
 * @param {Object} texture the texture to draw, should only pass something
 * given by jglCreateTexture.
 * @param {Number} xpos the x-coordinate to place the center of the texture.
 * @param {Number} ypos the y-coordinate to place the center of the texture.
 * @param {Number} rotation the rotation of the texture in degrees.
 */
function jglBltTexture(texture, xpos, ypos, rotation) {
	
	// Variables to keep track of the center, xpos and ypos will
	// be used to keep track of the top left corner, which is needed
	// by the canvas API.
	var xcenter, ycenter;

	if (xpos === undefined) {
		// default to center
		if (canvas.usingVisualAngles) {
			xpos = -texture.width * canvas.degPerPix/2;
			xcenter = 0;
		} else {
			xpos = canvas.width / 2 - texture.width/2;
			xcenter = canvas.width / 2;
		}
	} else { // center is given
		xcenter = xpos; // remember given center
		// determine top left corner given size of texture
		if (canvas.usingVisualAngles) {
			xpos = xpos - (texture.width * canvas.degPerPix) / 2;
		} else {
			xpos = xpos - texture.width / 2;
		}
	}
	if (ypos === undefined) {
		// default to center
		if (canvas.usingVisualAngles) {
			ypos = texture.height * canvas.degPerPix / 2;
			ycenter = 0;
		} else {
			ypos = canvas.height / 2 - texture.height / 2
			ycenter = canvas.height / 2;
		}
	} else { // center is given
		ycenter = ypos; // remember given center
		// determine top left corner given size of texture
		if (canvas.usingVisualAngles) {
			ypos = ypos + (texture.height * canvas.degPerPix) / 2;
		} else {
			ypos = ypos - texture.height / 2;
		}
	}
	
	if (rotation === undefined) { // default to 0 rotation
		rotation = 0;
	}
	
	// x and y coordinates of the top left corner in pixels, will only be used, 
	// if visualAngles are being used, meaning that xpos and ypos are in degrees
	var xtopLeft = (backCanvas.width / 2) + (xpos * canvas.pixPerDeg);
	var ytopLeft = (backCanvas.height / 2) - (ypos * canvas.pixPerDeg);

	// need another canvas to put the ImageData to so that stenciling and Alpha will work
	// since drawImage will be allow for those things, but putImageData will not. So,
	// the texture is drawn to the texCtx, and then the texCtx is drawn to the back buffer.

	if (canvas.usingVisualAngles) {
		xcenter = xcenter * canvas.pixPerDeg;
		xcenter = canvas.width / 2 + xcenter;
		
		ycenter = ycenter * canvas.pixPerDeg;
		ycenter = canvas.width / 2 - ycenter;
		
		texCtx.putImageData(texture, xtopLeft, ytopLeft); // draws texture to texCtx
		jglScreenCoordinates(); // switch to screenCoordinates to make image placement easier
		canvas.context.save();
		canvas.context.translate(xcenter, ycenter); // translate to rotate about the center of the texture
		canvas.context.rotate(rotation * 0.0174532925); // rotate uses radians, must convert
		canvas.context.drawImage(texCanvas, -xcenter, -ycenter); // draw image, 
		// The translate means that the top left corner is -width/2, -height/2
		canvas.context.restore(); // restore back to factory settings
		jglVisualAngleCoordinates(); // go back to visualAngleCoordinates
	} else {
		// put texture on texCtx
		texCtx.putImageData(texture, xpos, ypos);
		canvas.context.save();
		canvas.context.translate(xcenter, ycenter); //rotate about the center of the texture 
		canvas.context.rotate(rotation * 0.0174532925); // rotate in degrees
		canvas.context.drawImage(texCanvas, -xcenter, -ycenter);
		canvas.context.restore();
	}
	texCtx.clearRect(0,0,canvas.width, canvas.height); // clear texCtx


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