/*!
 * Red Locomotive Paths Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */
RedLocomotive('paths', function (engine, options) {
    "use strict"

	function followPath(element, pathArray, pixelsPerFrame, callback) {

		var i = 0,
			clearAni = function(){};

		//preform the move
		(function move() {

			if(i < pathArray.length) {

				var x = pathArray[i][0],
					y = pathArray[i][1];

				clearAni = engine.animate.move(element, x, y, pixelsPerFrame, move).clear;

				i += 1;

			} else if(typeof callback == 'function') {
				callback();
			}

		})();

		return {
			"clear": clearAni
		}
	}

	function patrolPath(element, pathArray, pixelsPerFrame, linear) {

		var clearPathTimer = followPath(element, pathArray, pixelsPerFrame, function () {

			//if linear is true then when the element gets to the end of the path it will move
			// back down the path in the opposite direction instead of jumping to the start of
			// the path.
			pathArray = linear ? pathArray.reverse() : pathArray;
			patrolPath(element, pathArray, pixelsPerFrame, linear);
		}).clear;

		return {
			"clear": clearPathTimer
		}
	}

	return {
		"path": {
			"follow": followPath,
			"patrol": patrolPath
		}
	}

});