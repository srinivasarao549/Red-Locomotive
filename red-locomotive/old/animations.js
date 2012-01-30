RedLocomotive('animations', function(engine, options) {
    "use strict"

	/**
	 * Move any object that contains X and Y coordinates
	 * @param element
	 * @param endX
	 * @param endY
	 * @param frames
	 * @param callback
	 */
	function move(element, endX, endY, pixelsPerFrame, callback) {
		var iF = 0;

		function clear() {
			if(clearAni) { clearAni(); }
			if(typeof callback === 'function') { callback(); }
		}

		function setCallback(newCallback) {
			callback = newCallback;
		}

		//get the distance
		var distance = engine.distance(endX - element.x, endY - element.y),
			frames = (distance / pixelsPerFrame) || 1;

		//for each frame move the element
		var clearAni = engine.every(function(){
			
			if(iF < frames) {
				iF += 1;

				//calculate the distance to our goal
				var vector = engine.vector(endX - element.x, endY - element.y);

				//calculate the distance to move this frame
				var move = vector[1] / (frames - iF);

				//calculate the new coords
				var coords = engine.coords(vector[0], move);

				//apply the new coords
				element.x += coords.x;
				element.y += coords.y;

			} else {
				clear();
			}
		}).clear;

		return {
			'clear': clear,
			'setCallback': setCallback
		}
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
			"sequence": sequence
		}
	}

});