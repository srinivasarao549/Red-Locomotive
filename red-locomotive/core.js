RedLocomotive('core', function(engine, options) {

	//create configuration
	var config = jQuery.extend({
		"showFPS": false,
		"pauseOnBlur": true
	}, options);

	//get the canvas
	var lastId = 0,
		mousePos = [0, 0],
		mousedown = [false, 0, 0],
		keyboard = {
			"axisCode": 0,
			"enter": false,
			"esc": false
		},
		active = true,
		primaryViewport = false,
		frameCount = 0,
		realFps = '?',
		viewports = {},
		timers = {},
		events = {},
		fpsElement,
		tanMap = {},
		sinMap = {},
		cosMap = {},
		atanMap = {},
		asinMap = {},
		acosMap = {};

	//core loop
	(function coreLoop() {

		//update the frame counter
		frameCount += 1;

		//stop the loop if the system is inactive
		if (!active) { requestAnimFrame(coreLoop); return; }

		//draw than advance
		draw();
		clock();

		//call the core loop hook
		newEvent('coreLoop');

		requestAnimFrame(coreLoop);
	})();

	//core secondary loop
	setInterval(function () {

		//update the fps
		if (options.showFPS && engine.text) { fps(); }
		realFps = frameCount;
		frameCount = 0;

		//stop the loop if the system is inactive
		if (!active) { return true; }

		//call the second loop hook
		newEvent('coreSecLoop');

	}, 1000);

	//events
	(function eventsHooks() {
		var depressedKeyCodes = [];

		//mouse position
		jQuery(document).mousemove(function (e) {
			mousePos = [e.pageX , e.pageY];
			newEvent('mousemove', e);
		});
		//mouse down
		jQuery(document).mousedown(function (e) {
			mousedown = [true, e.pageX, e.pageY];
			newEvent('mousedown', e);
		});
		//mouse up
		jQuery(document).mouseup(function (e) {
			mousedown = [false, e.pageX, e.pageY];
			newEvent('mouseup', e);
		});
		//window focus
		jQuery(window).focus(function (e) {
			if (config.pauseOnBlur) {
				active = true;
			}
			newEvent('focus', e);
		});
		//window blur
		jQuery(window).blur(function (e) {
			if (config.pauseOnBlur) {
				active = false;
			}
			newEvent('blur', e);
		});

		jQuery(window).keydown(function(e) {
			newEvent('keydown', e);
			if (e.keyCode === 38 && !depressedKeyCodes[38]) {
				keyboard.axisCode += 1;
				depressedKeyCodes[38] = true;
				return false;
			}
			if (e.keyCode === 39 && !depressedKeyCodes[39]) {
				keyboard.axisCode += 10;
				depressedKeyCodes[39] = true;
				return false;
			}
			if (e.keyCode === 40 && !depressedKeyCodes[40]) {
				keyboard.axisCode += 100;
				depressedKeyCodes[40] = true;
				return false;
			}
			if (e.keyCode === 37 && !depressedKeyCodes[37]) {
				keyboard.axisCode += 1000;
				depressedKeyCodes[37] = true;
				return false;
			}
			if (e.keyCode === 27) {
				keyboard.esc = true;
				return false;
			}
			if (e.keyCode === 13) {
				keyboard.enter = true;
				return false;
			}
		});

		jQuery(window).keyup(function(e) {
			newEvent('keyup', e);
			if (e.keyCode === 38) {
				keyboard.axisCode -= 1;
				depressedKeyCodes[38] = false;
				return false;
			}
			if (e.keyCode === 39) {
				keyboard.axisCode -= 10;
				depressedKeyCodes[39] = false;
				return false;
			}
			if (e.keyCode === 40) {
				keyboard.axisCode -= 100;
				depressedKeyCodes[40] = false;
				return false;
			}
			if (e.keyCode === 37) {
				keyboard.axisCode -= 1000;
				depressedKeyCodes[37] = false;
				return false;
			}
			if (e.keyCode === 27) {
				keyboard.esc = false;
				return false;
			}
			if (e.keyCode === 13) {
				keyboard.enter = false;
				return false;
			}
		});
	})();

	function random(multi) {
		return Math.floor(Math.random() * (multi || 100)) || 0;
	}

	function idGen() {
		lastId += 1;
		return lastId;
	}

	/**
	 * Returns the distance from an x and y offset.
	 * @param xDistance
	 * @param yDistance
	 */
	function distance(xDistance, yDistance) {

		xDistance = xDistance < 0 ? -xDistance : xDistance;
		yDistance = yDistance < 0 ? -yDistance : yDistance;

		//use pythagoras theorem to find the distance.
		return Math.round(Math.sqrt(Math.pow(yDistance, 2) + Math.pow(xDistance, 2)) * 100) / 100;

	}

	/**
	 * Returns angle of an x and y offset.
	 * @param xDistance
	 * @param yDistance
	 */
	function angle(xDistance, yDistance) {

		if(xDistance === 0 && yDistance === 0) {
			return 0;
		}

		var quad;

		if (xDistance >= 0 && yDistance < 0) {
			quad = 0;
		} else if(xDistance > 0 && yDistance >= 0) {
			quad = 1;
		} else if(xDistance <= 0 && yDistance > 0) {
			quad = 2;
		} else if(xDistance < 0 && yDistance <= 0) {
			quad = 3;
		}

		xDistance = xDistance < 0 ? -xDistance : xDistance;
		yDistance = yDistance < 0 ? -yDistance : yDistance;

		//use arc tangent to find the angle of ascent.
		return (Math.round((engine.atan(yDistance / xDistance)) * 100) / 100) + (90 * quad);
	}

	function vector(xDistance, yDistance) {
		return [angle(xDistance, yDistance), distance(xDistance, yDistance)];
	}

	/**
	 * Returns the end coordinates of a vector starting at 0, 0.
	 * @param degree
	 * @param distance
	 */
	function coords(degree, distance) {

		//throw an error if greater than 360 or less than 0
		if (degree >= 360) {
			degree /= degree / 360;
		} else if (degree < 0) {
			degree *= -degree / 360;
		}

		var quad = Math.floor(degree / 90);
		degree -= 90 * quad;

		var x, y;

		switch (quad) {
			case 0:
				y = -cos(degree) * distance;
				x = sin(degree) * distance;
				break;
			case 1:
				y = sin(degree) * distance;
				x = cos(degree) * distance;
				break;
			case 2:
				y = cos(degree) * distance;
				x = -sin(degree) * distance;
				break;
			case 3:
				y = -sin(degree) * distance;
				x = -cos(degree) * distance;
				break;
		}

		x = Math.round(x * 10) / 10;
		y = Math.round(y * 10) / 10;

		return {"x": x, "y": y};
	}

	function tan(input) {
		if (!tanMap[input]) {
			tanMap[input] = Math.tan(input * Math.PI / 180);
		}
		return tanMap[input];
	}

	function sin(input) {
		if (!sinMap[input]) {
			sinMap[input] = Math.sin(input * Math.PI / 180);
		}
		return sinMap[input];
	}

	function cos(input) {
		if (!cosMap[input]) {
			cosMap[input] = Math.cos(input * Math.PI / 180);
		}
		return cosMap[input];
	}

	function atan(input) {
		if (!atanMap[input]) {
			atanMap[input] = Math.atan(input) / Math.PI * 180;
		}
		return atanMap[input];
	}

	function asin(input) {
		if (!asinMap[input]) {
			asinMap[input] = Math.asin(input) / Math.PI * 180;
		}
		return asinMap[input];
	}

	function acos(input) {
		if (!acosMap[input]) {
			acosMap[input] = Math.acos(input) / Math.PI * 180;
		}
		return acosMap[input];
	}

	function clock() {
		var timer;
		for (var id in timers) {
			if (timers.hasOwnProperty(id)) {
				timer = timers[id];

				if (timer.counter < timer.frames) {
					timer.counter += 1;
				} else {

					if (typeof timer.callback === 'function') {
						timer.callback();
					}
					if (timer.type === 'timeout') {
						delete timers[id];
					} else if (timer.type === 'interval') {
						timer.counter = 0;
					}
				}
			}
		}
	}

	function after(callback, frames, startNow) {
		return newTimer('timeout', frames, callback, startNow);
	}

	function every(callback, frames, startNow) {
		return newTimer('interval', frames, callback, startNow);
	}

	/**
	 * newEvent - Executes a set of action by newEvent name.
	 * @param eventName {string} The event name.
	 * @param data {object} [optional] Any data object to be passed to the actions on execution.
	 */
	function newEvent(eventName, data) {

		/**
		 * Removes the event
		 */
		function remove() {
			if (events[eventName]) {
				delete events[eventName];
			}
		}

		if (events[eventName]) {
			for (var actionId in events[eventName]) {
				if (events[eventName].hasOwnProperty(actionId) && typeof events[eventName][actionId] === "function") {
					events[eventName][actionId](data);
				}
			}
		}

		return {
			"clear": remove
		}
	}

	/**
	 * action - Registers a callback to be fired on the execution of a an event.
	 * @param eventName {string} Name of the event to be paired with.
	 * @param callback {function} Callback to be executed on execution of the defined event.
	 */
	function newAction(eventName, callback) {
		var actionId;

		/**
		 * Removes the action
		 */
		function remove() {
			if (events[eventName][actionId]) {
				delete events[eventName][actionId];
			}
		}

		if (typeof callback === "function") {

			//generate an action id
			actionId = idGen();

			//If the event has not been defined yet, define it.
			if (!events[eventName]) {
				events[eventName] = {};
			}

			//define the action
			events[eventName][actionId] = callback;

			return {
				"clear": remove
			}
		}

		return false;
	}

	function newTimer(type, frames, callback, startNow) {
		var id,
			counter;

		/**
		 * Removes the new timer
		 */
		function remove() {
			if (timers[id]) {
				delete timers[id];
			}
		}

		/**
		 * Changes the frame rate
		 * @param frames
		 */
		function setFrames(frames) {
			if (timers[id] && frames) {
				timers[id].frames = frames;
			}
		}

		if (type === 'interval' || type === 'timeout') {

			id = idGen();

			if (startNow) {
				counter = frames;
			} else {
				counter = 1;
			}

			timers[id] = {
				"type": type,
				"frames": frames,
				"counter": counter,
				"callback": callback
			};

			return {
				"clear": remove,
				"setFrames": setFrames
			}

		}

		return false;
	}

	/**
	 * Draws the fps
	 */
	function fps() {
		if (!fpsElement) {
			fpsElement = engine.text.create('FPS ELEMENT', 'FPS: ' + realFps, 16, 0, 16);
		} else {
			fpsElement.text = 'FPS: ' + realFps;
		}
	}

	/**
	 * New Viewport
	 * @param viewportName
	 * @param selector
	 * @param width
	 * @param height
	 */
	function newViewport(viewportName, selector, width, height) {

		if (viewportName === 'all') {
			throw new Error('Viewport name can not be reserved word "all".');
		}

		//get the canvas
		var canvas = jQuery(selector),
			context = canvas[0].getContext('2d');

		if (viewportName && canvas[0].tagName === "CANVAS") {

			canvas[0].width = width || 800;
			canvas[0].height = height || 600;

			var viewport = {
				"node": canvas,
				"context": context,
				"x": 0,
				"y": 0,
				"width": canvas[0].width,
				"height": canvas[0].height,
				"cursor": {
					"x": 0,
					"y": 0
				}
			};
			viewports[viewportName] = viewport;

			canvas.mousemove(function (e) {

				var realWidth = canvas.width(),
					realHeight = canvas.height(),
					realX = e.pageX - canvas[0].offsetLeft,
					realY = e.pageY - canvas[0].offsetTop,
					viewportWidth = canvas[0].width,
					viewportHeight = canvas[0].height;

				viewport.cursor.x = Math.round(realX * viewportWidth / realWidth);
				viewport.cursor.y = Math.round(realY * viewportHeight / realHeight);

			});
		}



		if (!primaryViewport) {
			primaryViewport = viewports[viewportName];
		}

		newEvent('createViewport', viewports[viewportName]);
		return viewports[viewportName];
	}

	function getViewport(viewportName) {
		if (viewports[viewportName]) {
			return viewports[viewportName];
		} else if (viewportName === 'all') {
			return viewports;
		} else {
			return false;
		}
	}

	/**
	 * Remove Viewport
	 * @param viewportName
	 */
	function removeViewport(viewportName) {
		if (viewports[viewportName]) {
			newEvent('removeViewport', viewports[viewportName]);
			delete viewports[viewportName];
			return true;
		}
		return false;
	}

	function offsetInViewport(viewport, x, y) {
		return (
			//x is in left
			(x < viewport.x) &&
			//x is in right
			(x > viewport.x + viewport.node[0].width) &&
			//y is in top
			(y < viewport.y) &&
			//y is in bottom
			(y > viewport.y + viewport.node[0].height)
		);
	}

	/**
	 * Draws everything!!!
	 */
	function draw() {

		var viewport,
			height,
			width;

		//loop through each viewport
		for (var viewportName in viewports) {
			if (viewports.hasOwnProperty(viewportName)) {
				viewport = viewports[viewportName];

				//get the viewport height and width
				width = viewport.node[0].width;
				height = viewport.node[0].height;

				//empty the viewport
				viewport.context.clearRect(0, 0, width, height);

				//draw elements
				drawElements(viewport);

				viewport.context.strokeStyle = '#f00';
				viewport.context.fillStyle = 'transparent';
				viewport.context.lineWidth = 1;
				viewport.context.lineCap = 'square';
				viewport.context.strokeRect(viewport.cursor.x - 1, viewport.cursor.y - 1, 3, 3);

				//draw text elements
				drawTextElements(viewport);
			}
		}
	}

	/**
	 * Draws all elements
	 * @param viewport
	 */
	function drawElements(viewport) {
		var elements,
			element,
			x,
			y,
			stack = [];

		//get the elements
		elements = engine.element.get('all');

		//order the new content
		for (var elementName in elements) {
			if (elements.hasOwnProperty(elementName)) {

				//get the element
				element = elements[elementName];

				//check to make sure its a valid element
				if (element.spriteSheet) {

					x = element.x - viewport.x;
					y = element.y - viewport.y;

					//Make sure the element is in view
					if (
						x + element.width > 0 &&
						x < viewport.node[0].width &&
						y + element.height > 0 &&
						y < viewport.node[0].height
					) {

						if (!stack[element.z]) {
							stack[element.z] = [];
						}
						stack[element.z].push(element);

					}
				}

			}
		}

		newEvent('draw', stack);

		//draw the new content
		for (var level in stack) {
			if (stack.hasOwnProperty(level)) {
				for (var i = 0; i < stack[level].length; i += 1) {

					//get the element
					element = stack[level][i];

					//x and y
					x = element.x - viewport.x;
					y = element.y - viewport.y;

					//draw the element to the view
					drawElement(element, viewport.context, x, y);
				}
			}
		}
	}

	function drawElement(element, context, dX, dY, cPC, cPR) {

		var cP;

		if (cPC && cPR) {
			cP = [cPC, cPR];
		} else {
			cP = element.spritePos;
		}

		//abstract some data
		var canvas = element.spriteSheet.canvas,
			sW = element.spriteSheet.spriteWidth,
			sH = element.spriteSheet.spriteHeight,

			sX = Math.floor(cP[0] * sW),
			sY = Math.floor(cP[1] * sH),

			dW = element.spriteSheet.spriteWidth,
			dH = element.spriteSheet.spriteHeight;

		if(
			(sX < 0) ||
			(sY < 0) ||
			(sX + sW > canvas[0].width) ||
			(sY + sH > canvas[0].height)
		) {
			throw new RangeError('Sprite at [' + cP[0] + ', ' + cP[1] + '] is out of range on element "' + element.name + '"');
		} else {
			//draw the sprite on to the
			context.drawImage(canvas[0], sX, sY, sW, sH, dX, dY, dW, dH);
		}

	}

	/**
	 * Draws all text elements
	 * @param viewport {object}
	 */
	function drawTextElements(viewport) {
		var textElements,
			textElement,
			font,
			fontString,
			size,
			text,
			x,
			y,
			w;

		//get the elements
		textElements = engine.text.get('all');

		//draw the new content
		for (var elementName in textElements) {
			if (textElements.hasOwnProperty(elementName)) {

				//get the element
				textElement = textElements[elementName];

				if (textElement.text && textElement.size && textElement.font) {

					//abstract some data
					font = textElement.font;
					size = textElement.size;
					text = textElement.text;
					x = textElement.x;
					y = textElement.y;
					w = textElement.width || false;

					//set the font
					fontString = size + 'px ' + font;

					viewport.context.font = fontString;
					viewport.context.fillStyle = '#000';
					viewport.context.strokeStyle = '#000';
					viewport.context.fillText(text, x, y, w);
				}
			}
		}
	}

	function getMousePos() {
		return mousePos;
	}

	function getMouseDown() {
		return mousedown;
	}

	function getKeyboard() {
		return keyboard;
	}

	function loopIsActive() {
		return active;
	}

	function pause() {
		newEvent('pause');
		active = false;
	}

	function resume() {
		newEvent('resume');
		active = true;
	}

	//return the core api
	return {
		"mousePosition": getMousePos,
		"mouseDown": getMouseDown,
		"keyboard": getKeyboard,
		"loopIsActive": loopIsActive,
		"pause": pause,
		"resume": resume,
		"viewport": {
			"create": newViewport,
			"get": getViewport,
			"remove": removeViewport,
			"offsetInViewport": offsetInViewport
		},
		"canvas": {
			"applyElement": drawElement
		},
		"distance": distance,
		"angle": angle,
		"vector": vector,
		"coords": coords,
		"every": every,
		"after": after,
		"event": newEvent,
		"when": newAction,
		"random": random,
		"idGen": idGen,
		"tan": tan,
		"atan": atan,
		"sin": sin,
		"asin": asin,
		"cos": cos,
		"acos": acos
	}

});