/*!
 * Red Locomotive Viewports Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */
RedLocomotive('viewports', function(engine, options){

	var viewports = {};

	/**
	 * New Viewport
	 * @param viewportName
	 * @param container
	 * @param width
	 * @param height
	 * @param fillStyle
	 */
	function newViewport(viewportName, container, width, height, x, y, fillStyle) {

		if (viewportName === 'all') {
			throw new Error('Viewport name can not be reserved word "all".');
		}

		var bitmap = engine.bitmap.create(width, height),
			viewport = {
				"name": viewportName,
				"bitmap": bitmap,
				"x": x || 0,
				"y": y || 0,
				"width": width,
				"height": height,
				"cursor": {
					"x": 0,
					"y": 0
				},
				"fillStyle": fillStyle
			};
		viewports[viewportName] = viewport;

		jQuery(container).append(bitmap.canvas);

		bitmap.canvas.mousemove(function (event) {

			var DOMWidth = bitmap.canvas.width(),
				DOMHeight = bitmap.canvas.height(),
				DOMX = event.pageX - bitmap.canvas[0].offsetLeft,
				DOMY = event.pageY - bitmap.canvas[0].offsetTop,
				viewportWidth = bitmap.canvas[0].width,
				viewportHeight = bitmap.canvas[0].height;

			viewport.cursor.x = Math.round(DOMX * viewportWidth / DOMWidth);
			viewport.cursor.y = Math.round(DOMY * viewportHeight / DOMHeight);

		});

		engine.event('createViewport', viewport);
		return viewport;
	}

	/**
	 * Retreves a viewport by name
	 * @param viewportName
	 */
	function getViewport(viewportName) {

		if (typeof viewportName.name !== 'undefined') {
			viewportName = viewportName.name;
		}

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
		
		if (typeof viewportName.name !== 'undefined') {
			viewportName = viewportName.name;
		}

		if (viewports[viewportName]) {
			engine.event('removeViewport', viewports[viewportName]);
			delete viewports[viewportName];
			return true;
		}
		return false;
	}

	/**
	 * Check if a point is within a viewport
	 * @param viewport
	 * @param x
	 * @param y
	 */
	function pointInViewport(viewport, x, y) {
		return (
			//x is in left
			(x < viewport.x) &&
			//x is in right
			(x > viewport.x + viewport.width) &&
			//y is in top
			(y < viewport.y) &&
			//y is in bottom
			(y > viewport.y + viewport.height)
		);
	}

	return {
		"viewport": {
			"create": newViewport,
			"get": getViewport,
			"remove": removeViewport,
			"containsPoint": pointInViewport
		}
	}
});