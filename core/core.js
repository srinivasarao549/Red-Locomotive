RedLocomotive('core', function(options, engine){
	"use strict"

	//create configuration
	var config = jQuery.extend({
		"fps": 30
	}, options);

	//get the canvas
	var mousePos = [0, 0],
		mousedown = [false, 0, 0],
		active = false,
		viewports = {},
		fpsElement;

	//core loop
	setInterval(function () {
		draw();
		engine.hook('core-loop');
	}, Math.round(1000 / config.fps));

	//core secondary loop
	setInterval(function () {
		fps();
		engine.hook('core-sec-loop');
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

	function fps() {
		if (options.showFPS && engine.text) {
			if (!fpsElement) {
				fpsElement = engine.text.create('FPS ELEMENT', 'FPS: 0', 16, 10, 10);
			}

		}
	}

	function draw() {

		var viewport,
			height,
			width,
			elements,
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

		//loop through each viewport
		for (var viewportName in viewports) {
			if (viewports.hasOwnProperty(viewportName)) {
				viewport = viewports[viewportName];

				//get the viewport height and width
				width = viewport.node.width();
				height = viewport.node.height();

				//empty the viewport
				viewport.context.clearRect(0, 0, width, height);

				//draw elements
				drawElements(viewport);

				//draw text elements
				drawTextElements(viewport);

			}

		}

	}

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
	}

	function removeViewport(viewportName) {
		if(viewports[viewportName]){
			delete viewports[viewportName];
			return true;
		}
		return false;
	}

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
					image = element.spriteSheet.image,
					sW = element.spriteSheet.spriteWidth,
					sH = element.spriteSheet.spriteHeight,

					cP = element.sequence[element.frame],
					sX = Math.floor(cP[0] * sW),
					sY = Math.floor(cP[1] * sH),

					dW = element.spriteSheet.spriteWidth,
					dH = element.spriteSheet.spriteHeight,
					dX = element.x,
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
					w = textElement.width || undefined;

					//set the font
					fontString = size + 'px ' + font;

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
		}
	}

});