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
		viewports = {};

	//core loop
	setInterval(function () {
		draw();
		engine.hook('core-loop');
	}, Math.round(1000 / config.fps));

	//core secondary loop
	setInterval(function () {
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

	function draw() {

		var viewport,
			height,
			width,
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
				width = viewport.width();
				height = viewport.height();

				//empty the viewport
				viewport.context.clearRect(0, 0, width, height);

				//draw the new content
				for (var elementName in engine.DATA.ELEMENTS) {
					if (engine.DATA.ELEMENTS.hasOwnProperty(elementName) ) {

						//get the element
						element = engine.DATA.ELEMENTS[elementName];

						if (element.spriteSheet && element.sequence) {

							//abstract some data
							image = element.spriteSheet.image[0],
							sW = element.spriteSheet.spriteWidth,
							sH = element.spriteSheet.spriteHeight,

							cP = element.sequence[element.frame],
							sX = Math.floor(cP[0] * sW),
							sY = Math.floor(cP[1] * sH),

							dW = Math.floor(element.spriteSheet.spriteWidth * viewport.zoom),
							dH = Math.floor(element.spriteSheet.spriteHeight * viewport.zoom),
							dX = Math.floor(element.position[0] * viewport.zoom),
							dY = Math.floor(element.position[1] * viewport.zoom);

							//draw the sprite on to the
							viewport.context.drawImage(image, sX, sY, sW, sH, dX, dY, dW, dH);

							if (element.frame < element.sequence.length) {
								element.frame += 1;
							} else {
								element.frame = 0;
							}
						}

					}
				}
			}

		}

	}

	function newViewport(viewportName, selector, zoom) {

		//get the canvas
		var canvas = jQuery(selector),
			context = canvas[0].getContext('2d');
			zoom = zoom || 1;

		if(viewportName && canvas[0].tagName === "canvas"){
			viewports[viewportName] = {
				"node": canvas,
				"zoom": zoom,
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

	//return the core api
	return {
		"mousePosition": mousePos,
		"mouseDown": mousedown,
		"active": active,
		"DATA": {
			"VIEWPORTS": viewports
		}
	}

});