define(function() {

	//set core namespace
	init.namespace = '';

	//return the init function
	return init;

	/**
	 * Creates the views api
	 * @param engine
	 * @param data
	 */
	function init(engine, data) {
		var views;

		views = data.views = [];

		function View(id, x, y, z, range, width, height) {
			var view;

			//defaults
			if(typeof width !== 'number' && typeof height !== 'number' ) {
				width = x;
				height = y;
				x = y = null;
			}

			//validate
			if(typeof id !== 'string') { throw new Error('Cannot create view. The id must be a string.'); }
			if(typeof width !== 'number') { throw new Error('Cannot create view. The width must be a number.'); }
			if(typeof height !== 'number') { throw new Error('Cannot create view. The height must be a number.'); }
			if(x && typeof x !== 'number') { throw new Error('Cannot create view. The x must be a number.'); }
			if(y && typeof y !== 'number') { throw new Error('Cannot create view. The y must be a number.'); }
			if(z && typeof z !== 'number') { throw new Error('Cannot create view. The z must be a number.'); }
			if(range && typeof range !== 'number') { throw new Error('Cannot create view. The depth must be a number.'); }

			view = {
				"id": id,
				"x": x,
				"y": y,
				"z": z,
				"range": range,
				"width": width,
				"height": height
			};

			//add the element to the elements object
			views.push(view);

			return wrap(view);
		}

		function wrap(view) {
			var api, view, canvas, context, redrawRegion;

			canvas = document.createElement('canvas');
			context = canvas.getContext('2d');

			canvas.width = width;
			canvas.height = height;

			view = {
				"id": id,
				"width": width,
				"height": height,
				"position": {
					"x": x,
					"y": y,
					"z": z,
					"depth": range
				},
				"canvas": canvas,
				"context": context
			};

			views.push(view);

			data.elements.on('update', render);

			api = {
				"element": canvas,
				"move": move,
				"x": viewX,
				"y": viewY,
				"z": viewZ,
				"h": depth,
				"width": width,
				"height": height
			};

			return api;

			function move(x, y, z, d) {
				var degree, distance, coordinates;

				//defaults
				if(x < 360 && x >= 0 && y && typeof z === 'undefined' && typeof d === 'undefined') {
					degree = x;
					distance = y;
					x = y = z = d = null;
				}

				//validate
				if(x && typeof x !== 'number') { throw new Error('Cannot update view. The x position must be a number.'); }
				if(y && typeof y !== 'number') { throw new Error('Cannot update view. The y position must be a number.'); }
				if(z && typeof z !== 'number') { throw new Error('Cannot update view. The z position must be a number.'); }
				if(d && typeof d !== 'number') { throw new Error('Cannot update view. The h position must be a number.'); }
				if(degree && typeof degree !== 'number') { throw new Error('Cannot update view. The degree must be a number.'); }
				if(distance && typeof distance !== 'number') { throw new Error('Cannot update view. The distance must be a number.'); }

				//position
				if(x && y && z && d) {

					return view.position = {
						"x": x,
						"y": y,
						"z": z,
						"depth": d
					};

				//vector
				} else if(degree && distance) {
					coordinates = engine.coordinates(degree, distance);
					view.position.x += coordinates.x;
					view.position.y += coordinates.y;

				//return
				} else {
					return view.position;
				}
			}

			function viewX(x) {
				if(x && typeof x === 'number') { throw new Error('Cannot update view. The x position must be a number'); }
				if(x) {
					return view.position.x = x;
				} else {
					return view.position.x;
				}
			}

			function viewY(y) {
				if(y && typeof y === 'number') { throw new Error('Cannot update view. The y position must be a number'); }
				if(y) {
					return view.position.y = y;
				} else {
					return view.position.y;
				}
			}

			function viewZ(z) {
				if(z && typeof z === 'number') { throw new Error('Cannot update view. The z position must be a number'); }
				if(z) {
					return view.position.z = z;
				} else {
					return view.position.z;
				}
			}

			function depth(d) {
				if(d && typeof d === 'number') { throw new Error('Cannot update view. The h position must be a number'); }
				if(d) {
					return view.position.depth = d;
				} else {
					return view.position.depth;
				}
			}

			function width(w) {
				if(w && typeof w !== 'number') { throw new Error('Cannot update view. The width must be a number.'); }

				if(w) {
					return view.width = canvas.width = w;
				} else {
					return view.width;
				}
			}

			function height(h) {
				if(h && typeof h !== 'number') { throw new Error('Cannot update view. The height must be a number.'); }

				if(h) {
					return view.height = canvas.height = h;
				} else {
					return view.height;
				}
			}

			function render() {
				var vx, vy, vz, vd, vw, vh, elements, eI, element, ex, ey, ez, ew, eh;

				//clear the canvas
				context.clearRect(0, 0, canvas.width, canvas.height);

				vx = view.position.x;
				vy = view.position.y;
				vz = view.position.z;
				vd = view.position.depth;
				vw = view.width;
				vh = view.height;

				//filter elements in range
				elements = [];
				for(eI = 0; eI < data.elements.length; eI += 1) {
					element = data.elements[eI];
					ex = element.position.x;
					ey = element.position.y;
					ez = element.position.z;
					ew = element.width;
					eh = element.height;

					//sprite
					if(typeof element.spriteId === 'string') { continue; }

					//left
					if(ex + ew <= vx) { console.log('x left'); continue; }
					//right
					if(ex >= vx + vw) { console.log('x right'); continue; }
					//top
					if(ey + eh <= vy) { console.log('x top'); continue; }
					//bottom
					if(ey >= vy + vh) { console.log('x bottom'); continue; }
					//height
					if(ez > vz + vd || ez < vz) { console.log('x height'); continue; }

					console.log('added element' + element.id);

					elements.push(element);
				}

				//draw each element
				for(eI = 0; eI < elements.length; eI += 1) {
					element = elements[eI];
					context.drawImage(element.canvas, element.position.x, element.position.y, element.width, element.height);
				}
			}

			function dispatchRedraw() {
				if(redrawRegion.width && redrawRegion.height) {

					//reset the redraw Region
					redrawRegion.x = 0;
					redrawRegion.y = 0;
					redrawRegion.width = 0;
					redrawRegion.height = 0;
				}
			}

			function queueFrame(element) {

				//x
				if(element.x < redrawRegion.x) { redrawRegion.x = element.x; }
				if(element.lastState.x < redrawRegion.x) { redrawRegion.x = element.lastState.x; }

				//y
				if(element.y < redrawRegion.y) { redrawRegion.y = element.y; }
				if(element.lastState.y < redrawRegion.y) { redrawRegion.y = element.lastState.y; }

				//width
				if(element.x + element.width > redrawRegion.x + redrawRegion.width) {
					redrawRegion.width = element.x + element.width - redrawRegion.x;
				}
				if(element.lastState.x + element.lastState.width > redrawRegion.x + redrawRegion.width) {
					redrawRegion.width = element.lastState.x + element.lastState.width - redrawRegion.x;
				}

				//height
				if(element.y + element.height > redrawRegion.y + redrawRegion.height) {
					redrawRegion.height = element.y + element.height - redrawRegion.y;
				}
				if(element.lastState.y + element.lastState.height > redrawRegion.y + redrawRegion.height) {
					redrawRegion.height = element.lastState.y + element.lastState.height - redrawRegion.y;
				}
			}
		}

		return {
			'view': createView
		}
	}
});