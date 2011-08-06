RedLocomotive('collisions', function(engine, options) {

    var collisions = {},
		canvas = jQuery('<canvas></canvas>'),
        context = canvas[0].getContext('2d');


	function bindElements(element, obstacles, elementSpriteCol, elementSpriteRow) {

		//if a single element is given wrap it so it can be processed as a group.
		if(typeof obstacles === 'string' || typeof obstacles.name === 'string') {
			obstacles = [obstacles];
		}

		//replace element name references with their corresponding element
		for(var i; i < obstacles.length; i += 1) {
			if(typeof obstacles[i] === "string") {
				obstacles[i] = engine.element.get(obstacles[i]);
			}
		}

		//create the collision data if it does not exist
		if (!collisions[element.name]) {
			collisions[element.name] = {
				"name": element.name,
				"element": element,
				"elementSpriteCol": elementSpriteCol,
				"elementSpriteRow": elementSpriteRow,
				"obstacles": obstacles,
				"last": false
			};

		//if the collision data already exists merge in the new elements
		} else {
			collisions[element.name].obstacles = jQuery.extend(collisions[CollisionLayerName].obstacles, obstacles);
		}

	}

	function collisionCheck(element, posX, posY) {
		
		if(!collisions[element.name]) {
			return false;
		}

		var result = false,
			element,
			obstacles,
			oI,
			obstacle,
			oX,
			oY,
			pixelData,
			p,
			pA,
			x = posX || element.x,
			y = posY || element.y;

		//prepare the canvas
		canvas[0].width = element.width;
		canvas[0].height = element.height;
		canvas.width(element.width);
		canvas.height(element.height);

		//get the obstacles
		obstacles = collisions[element.name].obstacles;

		//loop through the obstacles
		for (oI = 0; oI < obstacles.length; oI += 1) {
			obstacle = obstacles[oI];

			if (element.name !== obstacle.name) {

				//check the y
				if (
					(x < obstacle.x + obstacle.width && x + element.width > obstacle.x) &&
					(y < obstacle.y + obstacle.height && y + element.height > obstacle.y)
				) {

					oX = obstacle.x - x;
					oY = obstacle.y - y;

					engine.canvas.applyElement(obstacle, context, oX, oY);

					if(collisions[element.name].elementSpriteCol && collisions[element.name].elementSpriteRow) {
						context.globalCompositeOperation = 'source-in';
						engine.canvas.applyElement(element, context, 0, 0, elementSpriteCol, elementSpriteRow);
					}

					pixelData = context.getImageData(0, 0, element.width, element.height).data;

					for (p = 0; p < pixelData.length; p += 4) {
						pA = pixelData[p + 3];
						if(pA === 255) {
							if(!result) { result = [] }
							result.push(obstacle);
							break;
						}
					}
				}
			}
		}

		collisions[element.name].last = result;
		return result;
	}

	function getLastCollision(element) {
		if(collisions[element.name]) {
			return collisions[element.name].last;
		}
		return false;
	}

	return {
		"collisions": {
			"bindElements": bindElements,
			"check": collisionCheck,
			"getLastCollision": getLastCollision
		}
	}

});