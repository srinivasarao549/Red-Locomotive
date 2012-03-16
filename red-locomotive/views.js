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
		var viewEmitter, api, views;

		views = data.views = [];

		viewEmitter = engine.emitter();

		data.coreLoop.on('cycle', function() {
			viewEmitter.trigger('render');
		});

		api = {
			"view": View
		};

		return api;

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
			var api, canvas, context, regionData, emitter;

			regionData = {
				"x": null,
				"y": null,
				"width": null,
				"height": null,
				"elementRegions": {}
			};
			
			emitter = view.emitter = view.emitter || engine.emitter();
			canvas = view.canvas = view.canvas || document.createElement('canvas');
			context = view.context = view.context || canvas.getContext('2d');

			api = {};
			api.position = viewPosition;
			api.position.along = viewVector;
			api.rotation = viewRotation;
			api.x = viewX;
			api.y = viewY;
			api.z = viewZ;
			api.width = viewWidth;
			api.height = viewHeight;
			api.property = viewProperty;
			api.on = emitter.on;
			api.element = canvas;

			viewEmitter.on('render', render);

			return api;

			/**
			 * Sets/gets proerties
			 * @param key
			 * @param value
			 */
			function viewProperty(key, value) {
				if(typeof key !== 'string') { throw new Error('Cannot update view. The key must be a string.'); }
				if(key === 'id') { throw new Error('Cannot update view. The key may not be "id"'); }
				if(value) {
					view[key] = value;
				}
				return view[key];
			}

			/**
			 * Moves the element to a new set of position
			 * @param x
			 * @param y
			 * @param z
			 */
			function viewPosition(x, y, z) {
				if(x && typeof x !== 'number') { throw new Error('Cannot update view. The x position must be a number.'); }
				if(y && typeof y !== 'number') { throw new Error('Cannot update view. The y position must be a number.'); }
				if(z && typeof z !== 'number') { throw new Error('Cannot update view. The z position must be a number.'); }
				return {
					"x": viewProperty('x', x),
					"y": viewProperty('y', y),
					"z": viewProperty('z', z)
				};
			}

			/**
			 * Moves the element to the end of a vector
			 * @param degree
			 * @param distance
			 * @param z
			 */
			function viewVector(degree, distance, z) {
				var coordinates;
				if(typeof degree !== 'number') { throw new Error('Cannot update view. The degree must be a number.'); }
				if(typeof distance !== 'number') { throw new Error('Cannot update view. The distance must be a number.'); }
				if(z && typeof z !== 'number') { throw new Error('Cannot update view. The z position must be a number.'); }
				coordinates = engine.coordinates(degree, distance);
				return {
					"x": viewProperty('x', coordinates.x),
					"y": viewProperty('y', coordinates.y),
					"z": viewProperty('z', z)
				};
			}

			function viewRotation() {}

			//property setters/getters
			function viewX(x) { return viewProperty('x', x); }
			function viewY(y) { return viewProperty('y', y); }
			function viewZ(z) { return viewProperty('z', z); }
			function viewWidth(width) { return viewProperty('width', width); }
			function viewHeight(height) { return viewProperty('height', height); }

			function render() {
				var vx, vy, vz, vd, vw, vh, elements, eI, element, ex, ey, ez, ew, eh, regionElement;

				canvas.width !== view.width && (canvas.width = view.width);
				canvas.height !== view.height && (canvas.height = view.height);

				vx = view.x;
				vy = view.y;
				vz = view.z;
				vd = view.depth;
				vw = view.width;
				vh = view.height;

				//filter elements in range
				elements = [];
				for(eI = 0; eI < data.elements.length; eI += 1) {
					element = data.elements[eI];
					ex = element.x;
					ey = element.y;
					ez = element.z;
					ew = element.width;
					eh = element.height;

					//parent
					if(element.parentId) { continue; }

					//sprite
					if(typeof element.spriteId === 'string') { continue; }

					//left
					if(ex + ew <= vx) { continue; }
					//right
					if(ex >= vx + vw) { continue; }
					//top
					if(ey + eh <= vy) { continue; }
					//bottom
					if(ey >= vy + vh) { continue; }
					//height
					if(ez > vz + vd || ez < vz) { continue; }

					//expand the region to fit the element
					if(!regionData.x || ex < regionData.x) { regionData.x = ex; }
					if(!regionData.y ||ey < regionData.y) { regionData.y = ey; }
					if(!regionData.width ||ex + element.width > regionData.x + regionData.width) {
						regionData.width = ex + element.width - regionData.x;
					}
					if(!regionData.height || ey + element.height > regionData.y + regionData.height) {
						regionData.height = ey + element.height - regionData.y;
					}

					//if the element has a previous region position then fit it aswell
					if(regionData.elementRegions[element.id]) {
						regionElement = regionData.elementRegions[element.id];
						if(regionElement.x < regionData.x) { regionData.x = regionElement.x; }
						if(regionElement.y < regionData.y) { regionData.y = regionElement.y; }
						if(regionElement.x + regionElement.width > regionData.x + regionData.width) {
							regionData.width = regionElement.x + regionElement.width - regionData.x;
						}
						if(regionElement.y + regionElement.height > regionData.y + regionData.height) {
							regionData.height = regionElement.y + regionElement.height - regionData.y;
						}
					}

					//update the element's region data
					regionData.elementRegions[element.id] = {
						"x": element.x,
						"y": element.y,
						"width": element.width,
						"height": element.height
					};

					elements.push(element);
				}

				if(regionData.width && regionData.height) {

					//clear the canvas
					context.clearRect(regionData.x, regionData.y, regionData.width, regionData.height);
					context.strokeStyle = 'rgba(255, 0, 0, 1)';
					context.lineWidth = 1;
					//context.strokeRect(regionData.x, regionData.y, regionData.width, regionData.height);

					//reset the redraw Region
					regionData.x = regionData.y = regionData.height = regionData.width = null;

					//draw each element
					for(eI = 0; eI < elements.length; eI += 1) {
						element = elements[eI];

						context.drawImage(element.canvas, element.x, element.y, element.width, element.height);
					}
				}
			}
		}
	}
});