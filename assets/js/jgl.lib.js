////////////////////
// JGL PAGE CONTROLS
////////////////////
function toggleFullScreen() {
	if (!document.documentElement.requestFullscreen && document.documentElement.webkitRequestFullscreen) {
		document.documentElement.requestFullscreen = document.documentElement.webkitRequestFullscreen;
	}
  if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen(); 
    }
  }
}

function any(array1,array2) {
	if (typeof array2 == 'number') {return any(array1,array2);}
	// Checks if any values are equal
	for (var i=0;i<array1.length;i++) {
		if (value==array1[i]) {return true;}
	}
	return false;
}

function any_(array1,value) {
	// Checks if any values are equal
	for (var i=0;i<array1.length;i++) {
		if (value==array1[i]) {return true;}
	}
	return false;
}

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

// TIMING

var prev_tick;

function elapsed() {
	// Returns time since the last call to elapsed
	var elapsed = now()-prev_tick;
	prev_tick = now();
	return elapsed;
}

function now() {
	return performance.now();
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
	if (typeof x == 'number') {
		x = [x]; y = [y];
	}
	if (x.length != y.length || size.length != 2) {
		//Error
		throw "Fill Rect: Lengths dont match"
	}
	for (var i=0;i<x.length;i++) {
		jgl.ctx.fillStyle = color;
		jgl.ctx.fillRect(x[i] - (size[0] / 2), y[i] - (size[1] / 2), size[0], size[1]);
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
		if (jgl.canvas.usingVisualAngles) {
			width = 1;
			lineWidth = 0.04;
			color = "#ff0000";
			origin = [0 , 0];
		} else {
			width = 20;
			lineWidth = 1;
			color = "#ff0000";
			origin = [jgl.canvas.width / 2 , jgl.canvas.height / 2];
		}
		
	}
	jgl.ctx.lineWidth = lineWidth;
	jgl.ctx.strokeStyle = color;
	jgl.ctx.beginPath();
	jgl.ctx.moveTo(origin[0] - width / 2, origin[1]);
	jgl.ctx.lineTo(origin[0] + width / 2, origin[1]);
	jgl.ctx.stroke();
	jgl.ctx.beginPath();
	jgl.ctx.moveTo(origin[0], origin[1] - width / 2);
	jgl.ctx.lineTo(origin[0], origin[1] + width / 2);
	jgl.ctx.stroke();
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
	jgl.ctx.fillText(text, x, y);
}


//----------------------Coordinate Functions---------------------------

/**
 * Function for changing to visual Angle Coordinates.
 * If this function is called while drawing a stencil, 
 * it does not effect the normal canvas. 
 */
function jglVisualAngleCoordinates() {
	jgl.ctx.save();
	jgl.ctx.translate(jgl.canvas.width / 2, jgl.canvas.height / 2);
	jgl.ctx.transform(jgl.canvas.pixPerDeg,0,0,jgl.canvas.pixPerDeg, 0,0);
		
	jgl.canvas.usingVisualAngles = true;
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

function jglClearScreen() {
	// Clear screen
	jgl.ctx.fillStyle = con2hex(jgl.canvas.background);
	jgl.ctx.fillRect(-jgl.canvas.width/jgl.canvas.pixPerDeg/2,-jgl.canvas.height/jgl.canvas.pixPerDeg/2,jgl.canvas.width/jgl.canvas.pixPerDeg,jgl.canvas.height/jgl.canvas.pixPerDeg);
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

// Mean of booleans (true==1; false==0)
function boolpercent(arr) {
	var count = 0;
	for (var i=0; i<arr.length; i++) {
		if (arr[i]) { count++; } 
	}
	return 100* count / arr.length;
}

function sortIndices(array,indices) {
    var ret = zeros(array.length);

    for (var i=0;i<array.length;i++) {
        ret[i] = array[indices[i]];
    }
    return(ret);
}

/**
 * Function to adjust the contrast of a stimulus relative to the screen gamma.
 * You must set myscreen.pow via the calibration.html survey first. This function
 * returns the hex of your color.
 */
function con2hex(contrast) {
	// if (myscreen.pow > -1) {
	// 	con = Math.round(Math.pow(contrast,1/myscreen.pow)*255);
	// } else {
	// 	con = contrast;
	// }
	con = Math.round(contrast*255);
	conS = con.toString(16);
	if (conS.length == 1) {
		conS = conS + conS;
	}
	hex = '#' + conS + conS + conS;
	return(hex);
}

function randomInteger(n) {
	return Math.floor(Math.random()*n);
}

function randomElement(array) {
	return array[randomInteger(array.length)];
}


// Random shit

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}