RedLocomotive('collisions', function(engine, options) {


	function setCollisionMask(element, spriteCol, spriteRow) {
		element.collisionMask = [spriteCol, spriteRow];
	}

	function checkForCollision() {
		var elements = Array.prototype.splice.call(arguments),
			collisions = false;

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
					var oECC = otherElement.collisionMask[0] || 0,
						oECR = otherElement.collisionMask[1] || 0;

					var eCC = otherElement.collisionMask[0] || 0,
						eCR = otherElement.collisionMask[1] || 0;

					//draw the each element's collision mask to a canvas and check for remaining pixels
					var collision = engine.canvas.create(element.width, element.height, otherElement.sprites[oECC, oECR]);
					collision.context.globalCompositeOperation = 'source-in';
					collision.context.drawImage(element.sprites[eCC, eCR], element.x + otherElement.x, element.y + otherElement.y);

					//check to see if the canvas is blank
					if(!engine.canvas.isBlank(collision)) {
						if(!collisions) {
							collisions = {};
						}
						if(!collisions[element.name]) {
							collisions[element.name] = [];
						}
						collisions[element.name].push(otherElement);
					}
				}
			}
		}

		return collisions;
	}
});