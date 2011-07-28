RedLocomotive('collisions', function(engine, options) {

    var collisions = {},
		canvas = jQuery('<canvas></canvas>'),
        context = canvas[0].getContext('2d');


	function bindElements(element, obstacles, dualPixelCollisionCheck) {

		dualPixelCollisionCheck = dualPixelCollisionCheck || false;

		//if a single element is given wrap it so it can be processed as a group.
		if(typeof obstacles === 'string' || typeof obstacles.name === 'string') {
			obstacles = [obstacles];
		}

		if(typeof element === "string") {
			element = engine.element.get(element);
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
				"obstacles": obstacles,
				"dualPixelCollisionCheck": dualPixelCollisionCheck
			};

		//if the collision data already exists merge in the new elements
		} else {
			collisions[element.name].obstacles = jQuery.extend(collisions[CollisionLayerName].obstacles, obstacles);
		}

	}

	function collisionCheck(element) {

		if(typeof element === "string") {
			element = engine.element.get(element);
		}
		
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
			pA;

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
					(element.x < obstacle.x + obstacle.width && element.x + element.width > obstacle.x) &&
					(element.y < obstacle.y + obstacle.height && element.y + element.height > obstacle.y)
				) {

					oX = obstacle.x - element.x;
					oY = obstacle.y - element.y;

					engine.canvas.applyElement(obstacle, context, oX, oY);

					if(collisions[element.name].dualPixelCollisionCheck) {
						context.globalCompositeOperation = 'source-in';
						engine.canvas.applyElement(element, context, 0, 0);
					}

					//context.scale(0.16, 0.16);
					pixelData = context.getImageData(0, 0, element.width, element.height).data;
					//context.clearRect(0, 0, element.width, element.height);

					for (p = 0; p < pixelData.length; p += 4) {
						pA = pixelData[p + 3];
						if(pA === 255) {
							if(!result) { result = [] }
							console.log(obstacle.name);
							result.push(obstacle);
							break;
						}
					}
				}
			}
		}

		return result;
	};

	return {
		"collisions": {
			"bindElements": bindElements,
			"check": collisionCheck
		}
	}

});