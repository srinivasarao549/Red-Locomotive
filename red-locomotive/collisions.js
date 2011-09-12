/*!
 * Red Locomotive Collisions Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */
RedLocomotive('collisions', function(engine, options) {

	var collisions = {};

	function setCollisionMask(element, spriteCol, spriteRow) {
		collisions[element.name] = [spriteCol, spriteRow];
	}

	function checkForCollision(element) {
		var elements = element && [element] || Array.prototype.splice.call(arguments),
			activeCollisions = false;

		//get the location of each sprite
		for (var i = 0; i < elements.length; i += 1) {
			var element = elements[i];

			for(var ii = 0; elements.length; ii += 1) {
				var otherElement = elements[ii];

				//if the element and the other element are the same skip to the next other element
				if(element.name === otherElement.name) {
					continue;
				}

				//check x
				var xC = (
					(element.x >= otherElement.x && element.x <= otherElement.x + otherElement.width) ||
					(element.x + element.width <= otherElement.x + otherElement.width && element.x + element.width >= otherElement.x)
				);

				//check x
				var yC = (
					(element.y >= otherElement.y && element.y <= otherElement.y + otherElement.height) ||
					(element.y + element.height <= otherElement.y + otherElement.height && element.y + element.height >= otherElement.x)
				);

				//if the element's bounding box overlaps the other element's bounding box
				if(xC || yC) {

					//get the other elements collision mask
					var oECC = collisions[otherElement.name][0] || 0,
						oECR = collisions[otherElement.name][1] || 0;

					var eCC = collisions[element.name][0] || 0,
						eCR = collisions[element.name][1] || 0;

					//draw the each element's collision mask to a canvas and check for remaining pixels
					var collision = engine.bitmap.create(element.width, element.height, otherElement.sprites[oECC, oECR]);
					collision.context.globalCompositeOperation = 'source-in';
					collision.context.drawImage(element.sprites[eCC, eCR], element.x + otherElement.x, element.y + otherElement.y);

					//check to see if the canvas is blank
					if(!engine.bitmap.isBlank(collision)) {
						if(!activeCollisions) {
							activeCollisions = {};
						}
						if(!activeCollisions[element.name]) {
							activeCollisions[element.name] = [];
						}
						activeCollisions[element.name].push([otherElement, element]);
					}
				}
			}
		}

		return activeCollisions;
	}

	//return the api
	return {
		"collision": {
			"setMask": setCollisionMask,
			"check": checkForCollision
		}
	}

});