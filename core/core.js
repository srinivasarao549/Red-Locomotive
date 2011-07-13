RedLocomotive('core', function(options, engine){
	"use strict"

	//create configuration
	var config = jQuery.extend({
		"fps": 60
	}, options);

	//get the canvas
	var mousePos = [0, 0],
		mousedown = [false, 0, 0],
		active = false,
		viewports = {},
		timers = {},
		fpsElement,
		frameCount = 0,
		realFps = '?';

	//core loop
	setInterval(function () {

		draw();
		clock();

		engine.hook('core-loop');

		frameCount += 1;
		
	}, Math.round(1000 / config.fps));

	//core secondary loop
	setInterval(function () {

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
			active = true;
			engine.hook('active', e);
		});
		//window blur
		jQuery(window).blur(function (e) {
			active = false;
			engine.hook('inactive', e);
		});
	})();

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

	function after(callback, frames) {
		return newTimer('timeout', frames, callback);
	}

	function every(callback, frames) {
		return newTimer('interval', frames, callback);
	}

	function newTimer(type, frames, callback) {
		var id;

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

		function idGen() {
			var newDate = new Date;
			return newDate.getTime() + (Math.random() * 10) + (Math.random() * 10);
		}

		if (type === 'interval' || type === 'timeout') {

			id = idGen();

			timers[id] = {
				"type": type,
				"frames": frames,
				"counter": 0,
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

				if (element.spriteSheet && element.sequence) {

					//abstract some data
					image = element.spriteSheet.image;
					sW = element.spriteSheet.spriteWidth;
					sH = element.spriteSheet.spriteHeight;

					cP = element.sequence[element.frame];
					sX = Math.floor(cP[0] * sW);
					sY = Math.floor(cP[1] * sH);

					dW = element.spriteSheet.spriteWidth;
					dH = element.spriteSheet.spriteHeight;
					dX = element.x;
					dY = element.y;

					//draw the sprite on to the
					viewport.context.drawImage(image[0], sX, sY, sW, sH, dX, dY, dW, dH);

					if (element.frame < element.sequence.length - 1) {
						element.frame += 1;
					} else {
						element.frame = 0;
					}
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

	//return the core api
	return {
		"mousePosition": mousePos,
		"mouseDown": mousedown,
		"active": active,
		"viewport": {
			"create": newViewport,
			"remove": removeViewport
		},
		"every": every,
		"after": after
	}

});