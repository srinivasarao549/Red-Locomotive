define(function() {

	//TODO create tests

	init.namespace = '';

	return init;

	function init(engine, data) {
		var api, elements;

		var api = {
			"element": Element
		};

		//create the elements array
		elements = [];

		//save the elements object to the data object
		data.elements = elements;

		return api;

		function Element(id, sprites, x, y, z, sC, sR) {
			var visible, element, api;

			//set defaults
			sprites = sprites || false;
			x = x || 0;
			y = y || 0;
			z = z || 0;
			sC = sC || 0;
			sR = sR || 0;

			//validate the arguments
			if(typeof id !== 'string') { throw new Error('Element id must be a string.'); }
			if(typeof sprites !== 'string' && typeof sprites !== 'object') { throw new Error('Element sprites must be a string or an object.'); }
			if(typeof x !== 'number') { throw new Error('Element x must be a number.'); }
			if(typeof y !== 'number') { throw new Error('Element y must be a number.'); }
			if(typeof z !== 'number') { throw new Error('Element z must be a number.'); }
			if(typeof sC !== 'number') { throw new Error('Element sC must be a number.'); }
			if(typeof sR !== 'number') { throw new Error('Element sR must be a number.'); }

			visible = false;
			api = {
				"move": move,
				"x": posX,
				"y": posY,
				"z": posZ,
				"hide": hide,
				"show": show,
				"sprite": currentSprite,
				"data": elementData
			};

			//figure out if the element should be visible
			if(sprites) { visible = true; }

			//create the element object and its api
			element = {
				"type": "element",
				"id": id,
				"coords": {"x": x, "y": y, "z": z},
				"sprites": sprites,
				"sprite": { "column": sC, "row": sR },
				"parentId": false,
				"visible": visible,
				"data": {}
			};

			//add the element to the elements object
			data.elements.push(element);

			//return the api
			return api;

			/**
			 * Moves the element to a new set of coords
			 * @param x
			 * @param y
			 * @param z
			 */
			function move(x, y, z) {

				//validate
				if(typeof x !== 'number') { throw new Error('Element x must be a number.'); }
				if(typeof y !== 'number') { throw new Error('Element y must be a number.'); }
				if(typeof z !== 'number') { throw new Error('Element z must be a number.'); }

				//update the coords
				element.coords = {"x": x, "y": y, "z": z}
			}

			/**
			 * Moves the element on the x axis
			 * @param x
			 */
			function posX(x) {

				if(x) {

					//validate
					if(typeof x !== 'number') { throw new Error('Element x must be a number.'); }

					//update the x coord
					element.coords.x = x;

					return true;

				} else {

					return element.coords.x;

				}
			}

			/**
			 * Moves the element on the y axis
			 * @param y
			 */
			function posY(y) {

				if(y) {

					//validate
					if(typeof y !== 'number') { throw new Error('Element y must be a number.'); }

					//update the y coord
					element.coords.y = y;

					return true;

				} else {

					return element.coords.y;

				}
			}

			/**
			 * Moves the element on the z axis
			 * @param z
			 */
			function posZ(z) {

				if(z) {
					
					//validate
					if(typeof z !== 'number') { throw new Error('Element z must be a number.'); }

					//update the z coord
					element.coords.z = z;

					return true;

				} else {

					return element.coords.z;

				}
			}
			
			function currentSprite(sC, sR) {
				
				if(sC && sR) {
					
					if(typeof sC !== 'number') { throw new Error('Element sC must be a number.'); }
					if(typeof sR !== 'number') { throw new Error('Element sR must be a number.'); }
					
					element.sprite.column = sC;
					element.sprite.row = sR;
					
					return true;
					
				} else {

					return {"column": element.sprite.column, "row": element.sprite.row };

				}
				
			}

			function elementData(key, value) {

				if(typeof key !== 'string') { throw new Error('Cannot read/write data to element. The data key must be a string.'); }

				//read
				if(typeof value === 'undefined') {

					//read the data from the key
					return typeof element.data[key] === 'undefined' && false || element.data[key];


				//write
				} else {

					//write the data to the key
					element.data[key] = value;

					return true;
				}
			}

			/**
			 * hides the element
			 */
			function hide() {
				element.visible = false;
			}

			/**
			 * shows the element
			 */
			function show() {
				element.visible = true;
			}
		}
	}

});