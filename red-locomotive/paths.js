RedLocomotive('paths', function (engine, options) {

	function followPath(element, pathArray, milliseconds, PositioningMethod, callback) {

		function clear() {
			if(pathTimer) { pathTimer.clear(); }
			if(moveAni) { moveAni.clear(); }
		}

		var i = 0,
			coords = {},
			vector,
			moveAni,
			pathTimer;

		//preform the move
		pathTimer = engine.every(function () {

			switch (PositioningMethod) {
				case 'relative':
					coords['x'] = element.x + pathArray[i][0];
					coords['y'] = element.y + pathArray[i][1];
				break;
				case 'absolute':
					coords['x'] = pathArray[i][0];
					coords['y'] = pathArray[i][1];
				break;
				case 'vectors':
					coords = engine.coords(pathArray[i][0], pathArray[i][1]);
					coords['x'] += element.x;
					coords['y'] += element.y;
				break;
			}

			pathTimer.reset(milliseconds);
			moveAni = engine.animate.move(element, coords['x'], coords['y'], milliseconds);


			if (i < pathArray.length - 1) {
				i += 1;
			} else {
				moveAni.setCallback(callback);
				pathTimer.clear();
			}

		});

		return {
			"clear": clear
		}
	}

	function patrolPath(element, pathArray, milliseconds, PositioningMethod, linear) {

		var pathTimer = followPath(element, pathArray, milliseconds, PositioningMethod, function () {
			pathArray = linear ? pathArray.reverse() : pathArray;
			patrolPath(element, pathArray, milliseconds, PositioningMethod, linear);
		});

		return {
			"clear": pathTimer.clear
		}
	}

	return {
		"path": {
			"follow": followPath,
			"patrol": patrolPath
		}
	}

});