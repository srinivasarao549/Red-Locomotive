/*!
 * Red Locomotive Core Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */
RedLocomotive('core', function(engine, options) {
    "use strict"

	//create configuration
	var config = jQuery.extend({
		"fps": 60
	}, options);

	//get the canvas
	var lastId = 0,
		millisecondsPerFrame = Math.floor(1000 / config.fps),
		active = false,
		frameCount = 0,
		realFps = '?',
		coreCycleDrift = 0,
		secondaryCycleDrift = 0,
		lastCoreLoopTime = 0,
		lastSecondaryLoopTime = 0,
		timers = {},
		events = {},
		tanMap = {},
		sinMap = {},
		cosMap = {},
		atanMap = {},
		asinMap = {},
		acosMap = {};

	//core loop
	(function loops(coreLoopTime) {

		//if inactive
		if (active) {
			coreLoop(coreLoopTime);
			secondaryLoop(coreLoopTime);
		}

		//get the next frame
		requestAnimationFrame(loops);

	})(new Date());

	function coreLoop(coreLoopTime){

		if(!lastCoreLoopTime) { lastCoreLoopTime = coreLoopTime; }

		if (coreCycleDrift < 10) {

			//count the number of cycles that should have occurred since the last
			coreCycleDrift += (coreLoopTime - lastCoreLoopTime) / millisecondsPerFrame;

		}

		//get the number of cycles for this loop
		var clockCycles = Math.floor(coreCycleDrift);

		//if there are cycles in this loop
		if(clockCycles > 0) {

			//run the clock for each cycle
			for(var i = 0; i < clockCycles; i += 1) {

				//call the core loop hook
				newEvent('coreLoop');

				//run the system clock
				clock();
			}

			//update the frame counter
			frameCount += 1;

			//remove the elapsed cycles from the frameDrift
			coreCycleDrift -= clockCycles;
			
			//draw once to each viewport
			draw();
		}

		//save the last core loop time
		lastCoreLoopTime = coreLoopTime;

	}

	function secondaryLoop(coreLoopTime){

		if(!lastSecondaryLoopTime) { lastSecondaryLoopTime = coreLoopTime; }

		if (secondaryCycleDrift < 10) {

			//count the number of cycles that should have occurred since the last
			secondaryCycleDrift += (coreLoopTime - lastSecondaryLoopTime) / 1000;

		}

		var clockCycles = Math.floor(secondaryCycleDrift);

		if(clockCycles > 0) {

			for(var i = 0; i < clockCycles; i += 1) {

				//call the second loop hook
				newEvent('secLoop');
			}

			//remove the elapsed cycles from the frameDrift
			secondaryCycleDrift -= clockCycles;

			//figure out the framerate
			realFps = frameCount;
			frameCount = 0;
		}

		//save the last core loop time
		lastSecondaryLoopTime = coreLoopTime;
	}

	//window focus
	jQuery(window).focus(function () {
		active = true;
	});
	//window blur
	jQuery(window).blur(function () {
		active = false;
	});

	function random(limit) {
		return Math.floor(Math.random() * (limit || 100)) || 0;
	}

	function idGen() {
		lastId += 1;
		return lastId;
	}

	/**
	 * Returns the distance from an x and y offset
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
	 * Returns degree of an x and y offset.
	 * @param xDistance
	 * @param yDistance
	 */
	function degree(xDistance, yDistance) {

		//if the distance is along x or y return the degree without using trig
		//
		//if the object is stationary return 0
		if (xDistance === 0 && yDistance === 0) {
			return 0;

		//if moving along the y axis
		} else if(xDistance === 0) {

			//return 0 for up
			if(yDistance < 0) {
				return 0;

			//return 180 for down
			} else {
				return 180;
			}

		//if moving along the x axis
		} else if (yDistance === 0) {

			//return 90 for right
			if(xDistance > 0) {
				return 90;

			//return 270 for left
			} else {
				return 270;
			}
		}

		//prepare some variables for the trig based method
		var quad, decimal;

		//figure out the quadrant
		if (xDistance >= 0 && yDistance < 0) {
			quad = 0;
		} else if(xDistance > 0 && yDistance >= 0) {
			quad = 1;
		} else if(xDistance <= 0 && yDistance > 0) {
			quad = 2;
		} else if(xDistance < 0 && yDistance <= 0) {
			quad = 3;
		}

		//inverse negative axis
		xDistance = xDistance < 0 ? -xDistance : xDistance;
		yDistance = yDistance < 0 ? -yDistance : yDistance;

		//get the decimal for atan
		switch (quad) {
			case 0:
			case 2:
				decimal = yDistance / xDistance;
			break;
			case 1:
			case 3:
				decimal = xDistance / yDistance;
			break;
		}

		//use arc tangent to find the degree of ascent.
		return (Math.round((engine.atan(decimal)) * 100) / 100) + (90 * quad);
	}

	function vector(xDistance, yDistance) {
		return [degree(xDistance, yDistance), distance(xDistance, yDistance)];
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

		var x = 0, y = 0;

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

	function after(callback, frames) {
		return newTimer('timeout', frames, callback, false);
	}

	function every(callback, frames, startNow) {
		return newTimer('interval', frames, callback, startNow);
	}

	/**
	 * newEvent - Executes a set of action by newEvent name.
	 * @param eventName {string} The event name.
	 * @param ...data {arguments} [optional] Any data to be passed to the actions on execution.
	 */
	function newEvent(eventName) {
		var data = Array.prototype.slice.call(arguments, 1);

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
					events[eventName][actionId].apply(this, data);
				}
			}
		}

		return {
			"clear": remove
		}
	}

	/**
	 * newAction - Registers a callback to be fired on the execution of a an event.
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

	function newCallCounter(iterations, callback) {
		
		var args = Array.prototype.slice.call(arguments, 2),
			i = 1;

		if (!iterations) {

			if (typeof callback === "function") {
				callback(args);
			}
			return function () {};

		} else {

			return function () {
				if(i < iterations) {
					i += 1;
				} else if(typeof callback === "function") {
					callback.apply(this, args);
				}

			}
			
		}
	}

	/**
	 * Draws everything!!!
	 */
	function draw() {

		var viewports = engine.viewport.get('all'),
			viewport,
			elements = engine.element.get('all'),
			element,
			x,
			y,
			stack;

		//loop through each viewport
		for (var viewportName in viewports) {
			if (viewports.hasOwnProperty(viewportName)) {
				viewport = viewports[viewportName];

				//clear the stack
				stack = [];

				//get the viewport context
				var context = viewport.bitmap.context;

				//empty the viewport
				if(viewport.fillStyle) {
					context.fillStyle = viewport.fillStyle;
					context.fillRect(0, 0, viewport.width, viewport.height);
				} else {
					context.clearRect(0, 0, viewport.width, viewport.height);
				}

				//sort the elements
				for (var elementName in elements) {
					if (elements.hasOwnProperty(elementName)) {

						//get the element
						element = elements[elementName];

						x = element.x - viewport.x;
						y = element.y - viewport.y;

						//Make sure the element is in view
						if (
							x + element.width > 0 && x < viewport.width - 1 &&
							y + element.height > 0 && y < viewport.height - 1
						) {

							//store the element in a stack sorted by z height
							if (!stack[element.z]) {
								stack[element.z] = [];
							}
							stack[element.z].push(element);
						}
					}
				}

				//anounce a new draw cycle and pass the stack to it
				newEvent('draw', stack);

				//draw the new content
				for (var z in stack) {
					if (stack.hasOwnProperty(z)) {
						for (var i = 0; i < stack[z].length; i += 1) {

							//get the element
							element = stack[z][i];

							//x and y
							x = element.x - viewport.x;
							y = element.y - viewport.y;

							var sprite = element.spriteSheet.sprites[element.spritePos[0]][element.spritePos[1]],
								imageData = sprite.canvas[0];

							//draw to the context
							viewport.bitmap.context.drawImage(imageData, x, y);

						}
					}
				}
			}
		}
	}

	function start() {
		active = true;
	}

	function clear() {

		//clear elements
		engine.element.remove('all');

		//unbind all key board bindings
		engine.unbind.key('all');

	}

	//return the core api
	return {
		"start": start,
		"callCounter": newCallCounter,
		"distance": distance,
		"degree": degree,
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
		"acos": acos,
		"clear": clear
	}

});