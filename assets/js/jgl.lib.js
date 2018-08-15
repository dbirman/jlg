////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// JGL MAIN LIBRARY //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions that have yet to be converted are in jlg.lib.old.js

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// JGL CORE //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//----------------------Coordinate Functions---------------------------

/**
 * Function for changing to visual Angle Coordinates.
 * If this function is called while drawing a stencil, 
 * it does not effect the normal canvas. 
 */
function jglVisualAngleCoordinates() {
	let w = app.view.parentNode.clientWidth,
		h = app.view.parentNode.clientHeight;
	console.log('Setting 0,0 to: ' + w/2 + ', ' +h/2);
	jgl.pixi.container.setTransform(w/2, h/2);
	jgl.pixi.usingVisualAngles = true;
}


//-----------------------Text Functions------------------------

/**
 * Function to set the text params. Needs to be called right before jglTextDraw
 * @param {String} fontFamily the name of the font to use
 * @param {Number} fontSize the size of the font in *degrees*
 * @param {String} fontColor the color of the font to use (use hex format #FFFFFF)
 * @param {Number} style can be 'bold', 'italic', 'oblique'
 */
function jglTextSet(fontFamily = 'Arial', fontSize = 1, fontColor = '#ffffff', style = 'normal') {
	jgl.pixi.textStyle = new PIXI.TextStyle({
		fontFamily: fontFamily,
		fill:fontColor,
		fontSize:fontSize*jgl.screenInfo.pixPerDeg,
		fontStyle:style,
		align:'center'
	});
}

/**
 * Draws the given text starting at (x, y). Make sure to run jglTextSet first.
 * @param {String} text the text to be drawn
 * @param {Number} x the x coordinate of the beginning of the text (degs)
 * @param {Number} y the y coordinate of the beginning of the text (degs)
 * @returns {Object} a handle pointing to the text object
 */
function jglTextDraw(text, x = 0, y = 0) {
	if (jgl.pixi.textStyle==undefined) {console.log('Text drawing failure: set the style first'); return}
  let t = new PIXI.Text(text,jgl.pixi.textStyle);
  t.x = x * jgl.screenInfo.pixPerDeg; t.y = y * jgl.screenInfo.pixPerDeg;
  t.anchor.set(0.5,0.5);
  jgl.pixi.textContainer.addChild(t);
  return t;
}

//-------------------Drawing Different Shapes-------------------

/**
 * Draws a fixation cross onto the screen. 
 * If no params are given, cross defaults to center,
 * with lineWidth = 1, width = 0.1, and white.
 * @param {Number} width the width of the cross
 * @param {Number} lineWidth the width of the lines of the cross
 * @param {String} color the color in hex format
 * @param {Array} origin the center point in [x,y]
 */
function jglFixationCross(width = 1, lineWidth = 0.1, color = 0xFFFFFF, origin = [0,0]) {
	let g = new PIXI.Graphics();
	jgl.pixi.fixContainer.addChild(g);


	if (jgl.pixi.usingVisualAngles) {
		g.lineStyle(lineWidth*jgl.screenInfo.pixPerDeg,color);
		origin = multiply(origin,jgl.screenInfo.pixPerDeg);
		width = width * jgl.screenInfo.pixPerDeg;
	} else {
		g.lineStyle(lineWidth,color);
	}

	g.moveTo(origin[0]-width/2,origin[1]);
	g.lineTo(origin[0]+width/2,origin[1]);
	g.moveTo(origin[0],origin[1]-width/2);
	g.lineTo(origin[0],origin[1]+width/2);

	return g;
}

/**
 * Draws a fixation circle onto the screen. 
 * @param {Number} radius
 * @param {Number} color in binary 0xFFFFFF
 * @param {Array} origin in [0,0] format
 */
function jglFixationCircle(radius = 1,color = 0xFFFFFF,origin = [0,0]) {
	let g = new PIXI.Graphics();
	jgl.pixi.fixContainer.addChild(g);

	if (jgl.pixi.usingVisualAngles) {
		origin = multiply(origin,jgl.screenInfo.pixPerDeg);
		radius = radius * jgl.screenInfo.pixPerDeg;
	}

	g.beginFill(color);
	g.drawCircle(origin[0],origin[1],radius);

	return g;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// TIMING ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let prev_tick = {};

/**
 * Get the elapsed time since the last call to this function (in ms).
 * @param {String} type is a string to let you track calls to elapsed()
 */
function elapsed(type = 'null') {
	// Returns time since the last call to elapsed
	let n = now();
	if (prev_tick[type]!=undefined) {
		let elapsed = n - prev_tick[type];
		prev_tick[type] = n;
		return elapsed;
	} else {
		prev_tick[type] = n;
		return 0;
	}
}

/**
 * Get the current time (in ms).
 */
function now() {
	return performance.now();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// ARRAY HELPER FUNCS ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Compare two arrays against each other. If any of their contents match at any point the function will return true.
 * @param {Array} 
 * @param {Array} or {Number}
 */
function any(array1,array2) {
	if (typeof array2 == 'number') {return any_(array1,array2);}
	// Checks if any values are equal
	for (var i=0;i<array1.length;i++) {
		for (var j=0;j<array2.length;j++) {
			if (array1[i]==array2[j]) {return true;}
		}
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

/**
 * Returns a random integer between 0 and n
 * @param {Number}
 */
function randomInteger(n) {
	return Math.floor(Math.random()*n);
}

/**
 * Returns a random element from the array
 * @param {Array}
 */
function randomElement(array) {
	return array[randomInteger(array.length)];
}

/**
 * Function to make array of zeros of given length.
 * @param {Number} length the length of the array to make
 * @returns {Array} the zero array
 */
function zeros(length) {
	var tempArray = new Array(length);
	for (var i=0;i<tempArray.length;i++) {
		tempArray[i] = 0;
	}
	return tempArray;
}

/**
 * Function to element wise multiple any combination of two arrays and / or scalars.
 * @param {Array|Number} first the first item.
 * @param {Array|Number} second the second item.
 * @returns {Array} the multiplied array.
 */
function multiply(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array multiply, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return n * second[i];
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return n * second;
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return n * first;
		});
	} else {
		return [first * second];
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// HTML HELPER FUNCS /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * If your HTML string is setup as: http(s)://yourserver:8080/exp.html?QUERY=VALUE this code will return VALUE
 * @param{String} the QUERY variable in the HTML string
 */
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

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// PIXI HELPER FUNCS /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A Depth Container is a PIXI Container with an additional .zOrder parameter. Calling .sortChildren() on a DContainer object will ensure that the correct z-indexes are observed. This is useful e.g. for rendering a fixation cross.
 */
class DContainer extends PIXI.Container {
  addChildZ(container, zOrder) {
    container.zOrder = zOrder || 0;
    container.arrivalOrder = this.children.length;
    this.addChild(container);
    this.sortChildren();
  }
 
  sortChildren() {
    const _children = this.children;
    let len = _children.length, i, j, tmp;
    for (i = 1; i < len; i++) {
      tmp = _children[i];
      j = i - 1;
      while (j >= 0) {
        if (tmp.zOrder < _children[j].zOrder) {
          _children[j + 1] = _children[j];
        } else if (tmp.zOrder === _children[j].zOrder && tmp.arrivalOrder < _children[j].arrivalOrder) {
          _children[j + 1] = _children[j];
 
        } else {
          break;
        }
        j--;
      }
      _children[j + 1] = tmp;
    }
  };
}
