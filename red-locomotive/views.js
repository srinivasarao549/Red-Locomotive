define(function() {
	init.namespace = '';
	return init;
	function init(engine, data) {
		var views;

		data.elements.on('update', function() { console.log('redraw'); });

		views = data.views = [];

		function createView(id, x, y, z, d, w, h) {
			var api, view, canvas, context;

			//defaults
			if(typeof w === 'undefined' && typeof h === 'undefined') {
				w = x;
				h = y;
				x = y = null;
			}

			//validate
			if(typeof id !== 'string') { throw new Error('Cannot create view. The id must be a string.'); }
			if(typeof w !== 'number') { throw new Error('Cannot create view. The width must be a number.'); }
			if(typeof h !== 'number') { throw new Error('Cannot create view. The height must be a number.'); }
			if(x && typeof x !== 'number') { throw new Error('Cannot create view. The x must be a number.'); }
			if(y && typeof y !== 'number') { throw new Error('Cannot create view. The y must be a number.'); }
			if(z && typeof z !== 'number') { throw new Error('Cannot create view. The z must be a number.'); }
			if(d && typeof d !== 'number') { throw new Error('Cannot create view. The depth must be a number.'); }

			canvas = document.createElement('canvas');
			context = canvas.getContext('2d');

			canvas.width = w;
			canvas.height = h;

			view = {
				"id": id,
				"width": w,
				"height": h,
				"position": {
					"x": x,
					"y": y,
					"z": z,
					"depth": d
				},
				"canvas": canvas,
				"context": context
			};

			views.push(view);

			data.elements.on('update', render);

			api = {
				"element": canvas,
				"move": move,
				"x": posX,
				"y": posY,
				"z": posZ,
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

			function posX(x) {
				if(x && typeof x === 'number') { throw new Error('Cannot update view. The x position must be a number'); }
				if(x) {
					return view.position.x = x;
				} else {
					return view.position.x;
				}
			}

			function posY(y) {
				if(y && typeof y === 'number') { throw new Error('Cannot update view. The y position must be a number'); }
				if(y) {
					return view.position.y = y;
				} else {
					return view.position.y;
				}
			}

			function posZ(z) {
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
		}

		return {
			'view': createView
		}
	}
});