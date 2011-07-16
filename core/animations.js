RedLocomotive('animations', function (options, engine) {

	/**
	 * Move any object that contains X and Y coordinates
	 * @param element
	 * @param endX
	 * @param endY
	 * @param frames
	 */
	function move(element, endX, endY, frames, callback) {

		//if the element has x and y values, and they are int values.
		if (element.x && element.y) {

			var moveTimer,
				counter = frames || 1;


			moveTimer = engine.every(function(){

				//calculate the distance
				var distanceX = endX - element.x,
					distanceY = endY - element.y;

				element.x += Math.round((distanceX / counter) * 10) / 10;
				element.y += Math.round((distanceY / counter) * 10) / 10;

				counter -= 1;

				if(!counter) {

					//kill the timer
					moveTimer.clear();

					if (typeof callback === 'function') {
						callback();
					}
				}
			});
		}
	}

	/**
	 * Animate any element with a spritesheet.
	 * @param element
	 * @param sequence
	 */
	function sequence(element, sequence, frames, callback) {
		
		var frame = 0;

		if (element.spriteSheet && element.spritePos && typeof sequence === 'object') {
			var aniTimer = engine.every(function () {

				element.spritePos = sequence[frame];

				frame += 1;

				if (frame >= sequence.length) {
					aniTimer.clear();
				}
				
			}, frames, true);
		}
	}

	return {
		"animate": {
			"move": move,
			"sequence": sequence
		}
	}

});