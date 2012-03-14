define(function() {

	//TODO create tests

	init.namespace = '';

	return init;

	function init(engine, data) {
		var api, elements, elementsEmitter;

		//save the elements object to the data object
		elements = data.elements = [];

		//create the elements event emitter
		elementsEmitter = engine.emitter();

		//attach the on method to to the elements array
		elements.on = elementsEmitter.on;

		api = {
			"element": Element
		};

		return api;

		function Element(id, spriteId, parentId, x, y, z, w, h) {
			var element, api, data, emitter, canvas, context;

			//set defaults
			if(typeof spriteId === 'number') {
				h = w;
				w = z;
				z = y;
				y = x;
				x = parentId;
				parentId = spriteId;
				spriteId = null;
			}
			if(typeof parentId === 'number') {
				h = w;
				w = z;
				z = y;
				y = x;
				x = parentId;
				parentId = null;
			}

			x = x || 0;
			y = y || 0;
			z = z || 0;


			//validate the arguments
			if(typeof id !== 'string') { throw new Error('Cannot create element. The id must be a string.'); }
			if(spriteId && typeof spriteId !== 'string') { throw new Error('Cannot create element. If given the spriteId must be a string.'); }
			if(parentId && typeof parentId !== 'string') { throw new Error('Cannot create element. If given the parentId must be a string.'); }
			if(typeof x !== 'number') { throw new Error('Cannot create element. The x position must be a number.'); }
			if(typeof y !== 'number') { throw new Error('Cannot create element. The y position must be a number.'); }
			if(typeof z !== 'number') { throw new Error('Cannot create element. The z position must be a number.'); }
			if(typeof w !== 'number') { throw new Error('Cannot create element. The width must be a number.'); }
			if(typeof h !== 'number') { throw new Error('Cannot create element. The height must be a number.'); }

			//create the canvas
			canvas = document.createElement('canvas');
			context = canvas.getContext('2d');
			canvas.width = w;
			canvas.height = h;

			//create the emitter
			emitter = engine.emitter();

			//bind render
			emitter.on('render', render);
			emitter.on('filter', filter);

			//when the element is ready then emit an update event from the elements array
			emitter.on('ready', function() { elementsEmitter.trigger('update'); });

			//watch the data object
			data = [];

			engine.watch(data).on('update', function() {
				emitter.trigger('render');
			});

			//create the element object and its api
			element = {
				"id": id,
				"width": w,
				"height": h,
				"position": {"x": x, "y": y, "z": z},
				"spriteId": spriteId,
				"parentId": parentId,
				"data": data,
				"emitter": emitter,
				"canvas": canvas,
				"context": context
			};

			//add the element to the elements object
			elements.push(element);

			//create the api
			api = {
				"move": move,
				"x": posX,
				"y": posY,
				"z": posZ,
				"width": width,
				"height": height,
				"sprite": sprite,
				"data": element.data,
				"on": emitter.on,
				"trigger": emitter.trigger,
				"set": emitter.set,
				"pipe": emitter.pipe
			};

			emitter.trigger('render');

			//return the api
			return api;

			/**
			 * Moves the element to a new set of position
			 * @param x
			 * @param y
			 * @param z
			 */
			function move(x, y, z) {
				var degree, distance, coordinates;

				//defaults
				if(x < 360 && x >= 0 && y && typeof z === 'undefined') {
					degree = x;
					distance = y;
					x = y = z = null;
				}

				//validate
				if(x && typeof x !== 'number') { throw new Error('Cannot update element. The x position must be a number.'); }
				if(y && typeof y !== 'number') { throw new Error('Cannot update element. The y position must be a number.'); }
				if(z && typeof z !== 'number') { throw new Error('Cannot update element. The z position must be a number.'); }
				if(degree && typeof degree !== 'number') { throw new Error('Cannot update element. The degree must be a number.'); }
				if(distance && typeof distance !== 'number') { throw new Error('Cannot update element. The distance must be a number.'); }

				//position
				if(x && y && z) {

					element.position = {
						"x": x,
						"y": y,
						"z": z
					}
					emitter.trigger('ready');

				//vector
				} else if(degree && distance) {
					coordinates = engine.coordinates(degree, distance);
					element.position.x += coordinates.x;
					element.position.y += coordinates.y;
					emitter.trigger('ready');
				}

				return element.position;
			}

			/**
			 * Moves the element on the x axis
			 * @param x
			 */
			function posX(x) {
				if(x && typeof x !== 'number') { throw new Error('Cannot update element. The x position must be a number.'); }

				if(x) {
					element.position.x = x;
					emitter.trigger('ready');
				}

				return element.position.x;
			}

			/**
			 * Moves the element on the y axis
			 * @param y
			 */
			function posY(y) {
				if(y && typeof y !== 'number') { throw new Error('Cannot update element. The y position must be a number.'); }

				if(y) {
					element.position.y = y;
					emitter.trigger('ready');
				}

				return element.position.y;
			}

			/**
			 * Moves the element on the z axis
			 * @param z
			 */
			function posZ(z) {
				if(z && typeof z !== 'number') { throw new Error('Cannot update element. The z position must be a number.'); }

				if(z) {
					element.position.z = z;
					emitter.trigger('ready');
				}

				return element.position.z;
			}

			function width(w) {
				if(w && typeof w !== 'number') { throw new Error('Cannot update element. The width must be a number.'); }

				if(w) {
					element.width = canvas.width = w;
					emitter.trigger('render');
				}

				return element.width;
			}
			function height(h) {
				if(h && typeof h !== 'number') { throw new Error('Cannot update element. The height must be a number.'); }

				if(h) {
					element.height = canvas.height = h;
					emitter.trigger('render');
				}

				return element.height;
			}

			/**
			 * set/get the element sprite
			 * @param spriteId
			 */
			function sprite(spriteId) {
				if(spriteId && spriteId !== 'string') { throw new Error('Cannot update element. The spriteId must be a string.') }

				if(spriteId) {
					element.spriteId = spriteId;
					emitter.trigger('render');
					return spriteId;
				} else {
					return element.spriteId;
				}
			}

			/**
			 * Applies the sprite to the element's canvas
			 */
			function render() {

				/*
				var sprite;

				//get the sprite
				sprite = data.sprites[element.spriteId];

				//if the sprite is invalid set the sprite to null
				if(!sprite) { element.spriteId = null; return; }

				//draw the sprite to the element
				context.drawImage(sprite.canvas, 0, 0, canvas.width, canvas.height);
				*/
				context.fillStyle = '#000';
				context.fillRect(0, 0, canvas.width, canvas.height);

				//trigger the filter event
				emitter.trigger('filter');
			}

			/**
			 * Applies filters to the element canvas
			 */
			function filter() {
				//TODO make this actually do something

				emitter.trigger('ready');
			}
		}
	}
});
