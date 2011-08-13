RedLocomotive('animations', function(engine, options) {

	/**
	 * Move any object that contains X and Y coordinates
	 * @param element
	 * @param degree
	 * @param distance
	 * @param frames
	 */
	function move(element, endX, endY, frames, callback) {

		function setCallback(newCallback) {
			callback = newCallback;
		}

		//if the element has x and y values, and they are int values.
		if (typeof element.x === 'number' && typeof element.y === 'number') {

			var moveTimer,
				counter = frames || 1;

			moveTimer = engine.every(function(){

				//calculate the distance
				var distanceX = endX - element.x,
					distanceY = endY - element.y,
					moveX = Math.round((distanceX / counter) * 100) / 100,
					moveY = Math.round((distanceY / counter) * 100) / 100;

				element.direction = engine.angle(moveX, moveY),
				element.distance = engine.distance(moveX, moveY);

				element.x += moveX;
				element.y += moveY;

				counter -= 1;

				if(!counter) {

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
	function sequence(element, sequence, frames, callback) {

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
				
			}, frames, true);
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