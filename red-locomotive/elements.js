define(function() {

	//TODO create tests

	init.namespace = '';

	return init;

	function init(engine, data) {
		var api, elements, elementsEmitter;

		//create the elements array and elements emitter
		elementsEmitter = engine.emitter();
		elements = data.elements = [];
		elements.on = elementsEmitter.on;

		//create the elements api tree
		api = {
			"element": Element
		};

		return api;

		function Element(id, spriteId, x, y, z, width, height) {
			var element, api, emitter, canvas, context;

			//set defaults
			if(typeof spriteId === 'number') {
				height = width;
				width = z;
				z = y;
				y = x;
				x = spriteId;
				spriteId = null;
			}

			x = x || 0;
			y = y || 0;
			z = z || 0;
			width = width || 0;
			height = height || 0;

			//validate the arguments
			if(typeof id !== 'string') { throw new Error('Cannot create element. The id must be a string.'); }
			if(spriteId && typeof spriteId !== 'string') { throw new Error('Cannot create element. If given the spriteId must be a string.'); }
			if(typeof x !== 'number') { throw new Error('Cannot create element. The x position must be a number.'); }
			if(typeof y !== 'number') { throw new Error('Cannot create element. The y position must be a number.'); }
			if(typeof z !== 'number') { throw new Error('Cannot create element. The z position must be a number.'); }
			if(typeof width !== 'number') { throw new Error('Cannot create element. The width must be a number.'); }
			if(typeof height !== 'number') { throw new Error('Cannot create element. The height must be a number.'); }

			//create the element
			element = {
				"id": id,
				"x": x,
				"y": y,
				"z": z,
				"width": width,
				"height": height,
				"spriteId": spriteId,
				"parentId": null,
				"lastState": {
					"id": id,
					"x": x,
					"y": y,
					"z": z,
					"width": width,
					"height": height,
					"spriteId": spriteId,
					"parentId": null
				}
			};

			//add the element to the elements object
			elements.push(element);

			//wrap the element
			return wrap(element);
		}

		function wrap(element) {
			var api, emitter, canvas, context;

			/*
			If the element was imported via json it will not have an emitter
			or canvas. It such a case they will need to be created.
			 */
			if(!element.emitter) {
				emitter = element.emitter = engine.emitter();
			} else {
				emitter = element.emitter;
			}
			if(!element.canvas) {
				canvas = element.canvas = document.createElement('canvas');
				context = element.context = canvas.getContext('2d');
				render();
			} else {
				canvas = element.canvas;
				context = element.context;
			}

			//create the api
			api = {};
			api.position = elementPosition;
			api.position.along = elementVector;
			api.rotation = elementRotation;
			api.x = elementX;
			api.y = elementY;
			api.z = elementZ;
			api.width = elementWidth;
			api.height = elementHeight;
			api.sprite = elementSpriteId;
			api.property = elementProperty;
			api.element = elementChild;
			api.on = emitter.on;
			api.data = elementData;

			//return the api
			return api;

			/**
			 * Sets/gets proerties
			 * @param key
			 * @param value
			 * @param callback
			 */
			function elementProperty(key, value) {
				if(typeof key !== 'string') { throw new Error('Cannot update element. The key must be a string.'); }
				if(key === 'lastState') { throw new Error('Cannot update element. The key may not be "lastState"'); }
				if(key === 'id') { throw new Error('Cannot update element. The key may not be "id"'); }
				if(value) {
					if(element[key]) {
						element.lastState[key] = element[key];
					}
					element[key] = value;
					render();
				}
				return element[key];
			}

			/**
			 * Moves the element to a new set of position
			 * @param x
			 * @param y
			 * @param z
			 */
			function elementPosition(x, y, z) {
				if(x && typeof x !== 'number') { throw new Error('Cannot update element. The x position must be a number.'); }
				if(y && typeof y !== 'number') { throw new Error('Cannot update element. The y position must be a number.'); }
				if(z && typeof z !== 'number') { throw new Error('Cannot update element. The z position must be a number.'); }
				return {
					"x": elementProperty('x', x),
					"y": elementProperty('y', y),
					"z": elementProperty('z', z)
				};
			}

			function elementRotation() {

			}

			/**
			 * Moves the element to the end of a vector
			 * @param degree
			 * @param distance
			 * @param z
			 */
			function elementVector(degree, distance, z) {
				var coordinates;
				if(typeof degree !== 'number') { throw new Error('Cannot update element. The degree must be a number.'); }
				if(typeof distance !== 'number') { throw new Error('Cannot update element. The distance must be a number.'); }
				if(z && typeof z !== 'number') { throw new Error('Cannot update element. The z position must be a number.'); }
				coordinates = engine.coordinates(degree, distance);
				return {
					"x": elementProperty('x', coordinates.x),
					"y": elementProperty('y', coordinates.y),
					"z": elementProperty('z', z)
				};
			}

			//property setters/getters
			function elementX(x) { return elementProperty('x', x); }
			function elementY(y) { return elementProperty('y', y); }
			function elementZ(z) { return elementProperty('x', z); }
			function elementWidth(width) { return elementProperty('x', width); }
			function elementHeight(height) { return elementProperty('x', height); }
			function elementSpriteId(spriteId) { return elementProperty('spriteId', spriteId); }

			/**
			 * Creates a child element
			 */
			function elementChild(   ) {
				var args, childElement;
				args = Array.prototype.slice.apply(arguments);

				childElement = Element.apply(this, args);
				childElement.property('parentId', element.id);
				childElement.on('update', render);

				return childElement;
			}

			/**
			 * Render the element canvas
			 */
			function render() {
				context.fillStyle = '#000';
				context.fillRect(0, 0, canvas.width, canvas.height);

				//once done filtering fire the update event
				emitter.trigger('update', element);
				elementsEmitter.trigger('update', element);
				console.log('update', element);
			}

			/**
			 * Returns the element data
			 */
			function elementData() {
				var data;

				data = engine.clone(element);

				delete data.canvas;
				delete data.context;
				delete data.emitter;

				return data;
			}
		}
	}
});
