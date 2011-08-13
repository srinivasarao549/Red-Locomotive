RedLocomotive('animations', function(engine, options) {

	/**
	 * Move any object that contains X and Y coordinates
	 * @param element
	 * @param degree
	 * @param distance
	 * @param milliseconds
	 */
	function move(element, endX, endY, milliseconds, callback) {

		function setCallback(newCallback) {
			callback = newCallback;
		}

		//if the element has x and y values, and they are int values.
		if (typeof element.x === 'number' && typeof element.y === 'number') {

			milliseconds = milliseconds || 1;
			
			var moveTimer,
				startX = element.x,
				startY = element.y,
				distanceX = endX - startX,
				distanceY = endY - startY,
				startTime = engine.getTime();

			moveTimer = engine.every(function(sysTime){

				//calculate the time elapsed and the distance from the endpoint
				var elapsedTime = sysTime - startTime || 1,

					//calculate the distance travelled
					// move = distanceLeft * sysTime / timeLeft
					moveX = Math.floor(distanceX * elapsedTime / milliseconds),
					moveY = Math.floor(distanceY * elapsedTime / milliseconds);

				//add the moved pixels to the element's position
				element.x = startX + moveX;
				element.y = startY + moveY;

				//calculate the element's velocity and direction
				element.direction = engine.angle(moveX, moveY),
				element.distance = engine.distance(moveX, moveY);

				//if the animation is over
				if(elapsedTime >= milliseconds) {

					//force the element's end position
					element.x = endX;
					element.y = endY;

					//kill the timer
					moveTimer.clear();

					if (typeof callback === 'function') {
						callback();
					}
				}
			});

			return {
				"clear": moveTimer.clear,
				"setCallback": setCallback
			}
		}
		return false;
	}

	/**
	 * Animate any element with a spritesheet.
	 * @param element
	 * @param sequence
	 */
	function sequence(element, sequence, milliseconds, callback) {

		function setCallback(newCallback) {
			callback = newCallback;
		}
		
		var frame = 0, useloop = false;

		if (element.spriteSheet && element.spritePos && typeof sequence === 'object') {
			var aniTimer = engine.every(function () {

				element.spritePos = sequence[frame];

				frame += 1;

				if (frame >= sequence.length) {
					if(!useloop){
						aniTimer.clear();
					} else {
						frame = 0;
					}
					if(typeof callback == 'function') {
						callback();
					}
				}

				console.log('frame', milliseconds);
				
			}, milliseconds, true);
		}

		function loop() {
			useloop = true;
		}

		function clear() {
			aniTimer.clear();
			if(typeof callback == 'function') {
				callback();
			}
		}

		return {
			"loop": loop,
			"clear": clear,
			"setCallback": setCallback
		}
	}

	return {
		"animate": {
			"move": move,
			"sequence": sequence,
			"stop": stop
		}
	}

});