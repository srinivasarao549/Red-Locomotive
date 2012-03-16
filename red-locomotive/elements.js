define(function() {

	//TODO create tests

	init.namespace = '';

	return init;

	function init(engine, data) {
		var api, elements, elementsEmitter;

		//create the elements array and elements emitter
		elementsEmitter = engine.emitter();
		elements = data.elements = {};
		elements.on = elementsEmitter.on;

		data.coreLoop.on('cycle', function() {
			elementsEmitter.trigger('render');
		});

		//create the elements api tree
		api = {
			"element": Element
		};

		return api;

		function Element(id, spriteId, x, y, z, width, height) {
			var element;

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
				"parentId": null
			};

			//add the element to the elements object
			elements[id] = element;

			//wrap the element
			return wrap(element);
		}

		function wrap(element) {
			var api, emitter, canvas, context, regionData;

			/*
			If the element was imported via json it will not have an emitter
			or canvas. It such a case they will need to be created.
			 */
			emitter = element.emitter = element.emitter || engine.emitter();
			canvas = element.canvas = element.canvas || document.createElement('canvas');
			context = element.context = element.context || canvas.getContext('2d');

			//create the region object
			regionData  = {};

			//create the api
			api = {};
			api.move = elementPosition;
			api.move.vector = elementVector;
			api.move.relative = elementPositionRelative;
			api.rotation = elementRotation;
			api.x = elementX;
			api.y = elementY;
			api.z = elementZ;
			api.width = elementWidth;
			api.height = elementHeight;
			api.sprite = elementSpriteId;
			api.property = elementProperty;
			api.element = SubElement;
			api.on = emitter.on;
			api.data = elementData;

			elementsEmitter.on('render', render);

			//return the api
			return api;

			/**
			 * Sets/gets proerties
			 * @param key
			 * @param value
			 */
			function elementProperty(key, value) {
				if(typeof key !== 'string') { throw new Error('Cannot update element. The key must be a string.'); }
				if(value) {
					if(key === 'id') { throw new Error('Cannot update element. The key may not be "id"'); }
					element[key] = value;
					updated = true;
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

			function elementPositionRelative(x, y, z) {
				x = x || 0;
				y = y || 0;
				z = z || 0;
				return elementPosition(element.x + x, element.y + y, element.y + z);
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
					"x": elementProperty('x', element.x + coordinates.x),
					"y": elementProperty('y', element.y + coordinates.y),
					"z": elementProperty('z', z)
				};
			}

			//property setters/getters
			function elementX(x) { return elementProperty('x', x); }
			function elementY(y) { return elementProperty('y', y); }
			function elementZ(z) { return elementProperty('z', z); }
			function elementWidth(width) { return elementProperty('width', width); }
			function elementHeight(height) { return elementProperty('height', height); }
			function elementSpriteId(spriteId) { return elementProperty('spriteId', spriteId); }

			/**
			 * Creates a child element
			 */
			function SubElement(   ) {
				var args, childElement;
				args = Array.prototype.slice.apply(arguments);

				childElement = Element.apply(this, args);
				childElement.property('parentId', element.id);
				childElement.on('update', function() {
					updated = true;
				});

				return childElement;
			}

			function render() {
				var subElement, subElements, id;

				//get the subElement within the element
				subElements = {};
				for(id in elements) {
					if(!elements.hasOwnProperty(id)) { continue; }

					subElement = elements[id];

					if(subElement.x + subElement.width < element.x) { continue; }
					if(subElement.x > element.x + element.width) { continue; }
					if(subElement.y + subElement.height < element.y) { continue; }
					if(subElement.y > element.y + element.height) { continue; }

					subElements[id] = subElement;
				}

				//extend each element's region
				for(id in subElements) {
					if(!elements.hasOwnProperty(id)) { continue; }

					subElement = subElements[id];

					if(!regionData[id]) {
						regionData[id] = Region(subElement.x, subElement.y, subElement.width, subElement.height);
					} else {
						regionData[id] = regionData[id].extend(subElement.x, subElement.y, subElement.width, subElement.height);
					}


				}

				//create composite regions
				for(id in subElements) {
					if(!elements.hasOwnProperty(id)) { continue; }
					regionData[id]
				}


				//set each element's new region
				for(id in subElements) {
					if(!elements.hasOwnProperty(id)) { continue; }

					subElement = subElements[id];

					regionData[id](subElement.x, subElement.y, subElement.width, subElement.height);
				}
			}

			/**
			 * Returns the element data
			 */
			function elementData() {
				var data;

				data = engine.clone(id);

				delete data.canvas;
				delete data.context;
				delete data.emitter;

				return data;
			}
		}

		var region = Region(100, 100, 100, 100);

		console.log(region());

		console.log(region.extend(50, 150, 50, 50)())

		function Region(x, y, width, height) {
		    var region = { "x": x, "y": y, "width": width, "height": height };

		    function extend(x, y, width, height) {
		        var newX, newY, newWidth, newHeight;

		        if(x < region.x) { newX = x; } else { newX = region.x; }
		        if(y < region.y) { newY = y; } else { newY = region.y; }

		        if(width + x > region.width + region.x) {
		            newWidth = width + x - region.x;
		        } else {
		            newWidth = width + x - region.x;
		        }
				sdfasdfasfasfas fasf adf asdf asfa a///////////////

		        return Region();
		    }

		    function contains(x, y, width, height) {
		        if(x < region.x) { return false; }
		        if(x + width > region.x + region.width) { return false; }
		        if(y < region.y) { return false; }
		        if(y + height > region.y + region.height) { return false; }
		        return true;
		    }

		    function overlaps(x, y, width, height) {
		        if(x + width < region.x) { return false; }
		        if(x > region.x + region.width) { return false; }
		        if(y + height < region.y) { return false; }
		        if(y > region.y + region.height) { return false; }
		        return true;
		    }

		    function setGetRegion(x, y, width, height) {
		        if(x && y && width && height) {
		            region = { "x": x, "y": y, "width": width, "height": height };
		        } else if(x || y || width || height) {
		            throw new Error('Cannot get region. The x, y, width, and height are required.')
		        } else {
		            return region;
		        }
		    }

		    setGetRegion.extend = extend;
		    setGetRegion.overlaps = overlaps;
		    setGetRegion.contains = contains;
		    return setGetRegion;
		}​

		function simplifyRegions() {

		}



	}
});
