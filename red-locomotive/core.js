RedLocomotive('core', function(options, engine){
	"use strict"

	//create configuration
	var config = jQuery.extend({
		"fps": 30,
		"showFPS": false,
		"pauseOnBlur": true
	}, options);

	//get the canvas
	var mousePos = [0, 0],
		mousedown = [false, 0, 0],
		keyboard = {
			"up": false,
			"down": false,
			"right": false,
			"left": false,
			"enter": false,
			"esc": false
		},
		active = true,
		viewports = {},
		primaryViewport = false,
		timers = {},
		fpsElement,
		frameCount = 0,
		realFps = '?';

	//core loop
	setInterval(function () {

		if(!active) {
			return true;
		}

		draw();
		clock();

		engine.hook('core-loop');

		frameCount += 1;
		
	}, Math.round(1000 / config.fps));

	//core secondary loop
	setInterval(function () {

		if(!active) {
			return true;
		}

		fps();
		
		engine.hook('core-sec-loop');

		realFps = frameCount + 1;
		frameCount = 0;

	}, 1000);

	//events
	(function events() {
		//mouse position
		jQuery(document).mousemove(function (e) {
			mousePos = [e.pageX, e.pageY];
			engine.hook('mousemove', e);
		});
		//mouse down
		jQuery(document).mousedown(function (e) {
			mousedown = [true, e.pageX, e.pageY];
			engine.hook('mousedown', e);
		});
		//mouse up
		jQuery(document).mouseup(function (e) {
			mousedown = [false, e.pageX, e.pageY];
			engine.hook('mouseup', e);
		});
		//window focus
		jQuery(window).focus(function (e) {
			if(config.pauseOnBlur) {
				active = true;
			}
			engine.hook('active', e);
		});
		//window blur
		jQuery(window).blur(function (e) {
			if(config.pauseOnBlur) {
				active = false;
			}
			engine.hook('inactive', e);
		});
		jQuery(window).keydown(function(e){
			if(e.keyCode === 37) {keyboard.left = true; return false;}
			if(e.keyCode === 38) {keyboard.up = true; return false;}
			if(e.keyCode === 39) {keyboard.right = true; return false;}
			if(e.keyCode === 40) {keyboard.down = true; return false;}
			if(e.keyCode === 27) {keyboard.esc = true; return false;}
			if(e.keyCode === 13) {keyboard.enter = true; return false;}
			engine.hook('keydown', e);
		});
		jQuery(window).keyup(function(e){
			if(e.keyCode === 37) {keyboard.left = false; return false;}
			if(e.keyCode === 38) {keyboard.up = false; return false;}
			if(e.keyCode === 39) {keyboard.right = false; return false;}
			if(e.keyCode === 40) {keyboard.down = false; return false;}
			if(e.keyCode === 27) {keyboard.esc = false; return false;}
			if(e.keyCode === 13) {keyboard.enter = false; return false;}
			engine.hook('keyup', e);
		});
	})();

	function idGen() {
		var newDate = new Date;
		return newDate.getTime() + (Math.random() * 10) + (Math.random() * 10) + (Math.random() * 10);
	}

	function clock() {
		var timer;
		for (var id in timers) {
			if (timers.hasOwnProperty(id)) {
				timer = timers[id];

				if (timer.counter < timer.frames - 1) {
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

	function newTimer(type, frames, callback, startNow) {
		var id,
			counter;

		/**
		 * Removes the new timer
		 */
		function remove() {
			if(timers[id]) {
				delete timers[id];
			}
		}

		/**
		 * Changes the frame rate
		 * @param frames
		 */
		function setFrames(frames) {
			if(timers[id] && frames) {
				timers[id].frames = frames;
			}
		}

		if (type === 'interval' || type === 'timeout') {

			id = idGen();

			if (startNow) {
				counter = frames;
			} else {
				counter = 0;
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
		if (options.showFPS && engine.text) {
			if (!fpsElement) {
				fpsElement = engine.text.create('FPS ELEMENT', 'FPS: ' + realFps, 16, 0, 16);
			} else {
				fpsElement.text = 'FPS: ' + realFps;
			}
		}
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

				//draw text elements
				drawTextElements(viewport);

			}

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

		//get the canvas
		var canvas = jQuery(selector),
			context = canvas[0].getContext('2d');

		if (!width && !height) {
			canvas[0].width = canvas.width();
			canvas[0].height = canvas.height();
		} else {
			if (width) {
				canvas[0].width = width;
			}
			if (height) {
				canvas[0].height = height;
			}
		}

		if(viewportName && canvas[0].tagName === "CANVAS"){
			viewports[viewportName] = {
				"node": canvas,
				"context": context
			};
		}

		if(!primaryViewport) {
			primaryViewport = viewports[viewportName];
		}

		return viewports[viewportName];
	}

	/**
	 * Remove Viewport
	 * @param viewportName
	 */
	function removeViewport(viewportName) {
		if(viewports[viewportName]){
			delete viewports[viewportName];
			return true;
		}
		return false;
	}

	/**
	 * Draws all elements
	 * @param viewport
	 */
	function drawElements(viewport) {
		var elements,
			element,
			image,
			sW,
			sH,
			cP,
			sX,
			sY,
			dW,
			dH,
			dX,
			dY;

		//get the elements
		elements = engine.element.get('all');

		//draw the new content
		for (var elementName in elements) {
			if (elements.hasOwnProperty(elementName) ) {

				//get the element
				element = elements[elementName];

				if (element.spriteSheet && element.spriteSheet.image) {

					//abstract some data
					image = element.spriteSheet.image;
					sW = element.spriteSheet.spriteWidth;
					sH = element.spriteSheet.spriteHeight;

					cP = element.spritePos;
					sX = Math.floor(cP[0] * sW);
					sY = Math.floor(cP[1] * sH);

					dW = element.spriteSheet.spriteWidth;
					dH = element.spriteSheet.spriteHeight;
					dX = element.x;
					dY = element.y;

					//draw the sprite on to the
					viewport.context.drawImage(image[0], sX, sY, sW, sH, dX, dY, dW, dH);
				}

			}
		}
	}

	/**
	 * Draws all text elements
	 * @param viewport
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
			if (textElements.hasOwnProperty(elementName) ) {

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

	function getActive() {
		return active;
	}

	//return the core api
	return {
		"mousePosition": getMousePos,
		"mouseDown": getMouseDown,
		"keyboard": getKeyboard,
		"active": getActive,
		"viewport": {
			"create": newViewport,
			"remove": removeViewport
		},
		"every": every,
		"after": after,
		"idGen": idGen
	}

});