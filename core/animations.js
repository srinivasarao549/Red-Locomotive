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

				element.x += Math.round(distanceX / counter);
				element.y += Math.round(distanceY / counter);

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

	return {
		"animate": {
			"move": move
		}
	}

});