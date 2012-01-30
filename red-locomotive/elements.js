define(function() {

	//TODO create tests

	init.namespace = '';

	return init;

	function init(engine, db, config) {

		var api = {
			"element": Element
		};

		return api;

		function Element(id, sprites, x, y, z, sC, sR) {

			//set defaults
			sprites = sprites || false;
			x = x || 0;
			y = y || 0;
			z = z || 0;
			sC = sC || false;
			sR = sR || false;

			//validate the arguments
			if(typeof id !== 'string') { throw new Error('Element id must be a string.'); }
			if(typeof sprites !== 'string' && typeof sprites !== 'object') { throw new Error('Element sprites must be a string or an object.'); }
			if(typeof x !== 'number') { throw new Error('Element x must be a number.'); }
			if(typeof y !== 'number') { throw new Error('Element y must be a number.'); }
			if(typeof z !== 'number') { throw new Error('Element z must be a number.'); }
			if(typeof sC !== 'number') { throw new Error('Element sC must be a number.'); }
			if(typeof sR !== 'number') { throw new Error('Element sR must be a number.'); }

			var visible = false,
				element,
				api = {
					"move": move,
					"x": x,
					"y": y,
					"z": z,
					"hide": hide,
					"show": show
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
			db.set('elements', [element], 'merge');

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
			function x(x) {

				//validate
				if(typeof x !== 'number') { throw new Error('Element x must be a number.'); }

				//update the x coord
				element.coords.x = x;
			}

			/**
			 * Moves the element on the y axis
			 * @param y
			 */
			function y(y) {

				//validate
				if(typeof y !== 'number') { throw new Error('Element y must be a number.'); }

				//update the y coord
				element.coords.y = y;
			}

			/**
			 * Moves the element on the z axis
			 * @param z
			 */
			function z(z) {

				//validate
				if(typeof z !== 'number') { throw new Error('Element z must be a number.'); }

				//update the z coord
				element.coords.z = z;
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