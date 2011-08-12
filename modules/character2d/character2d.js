RedLocomotive('character2d', function(engine, options) {

	var idleTimer;

	function newCharacter(elementName, spriteUrl, x, y, z, w, h) {

		//create an element
		var character = engine.element.create(elementName, spriteUrl, x, y, z, w, h),
			aniBindings = {
				"idle": false,
				"up": false,
				"down": false,
				"right": false,
				"left": false
			},
			binding,
			lastState = '',
			c = 0,
			f = 0,
			sequence;

		character.movement = 'idle';


		engine.every(function(){

			//get the current binding
			binding = aniBindings[character.movement];

			//exit on bad binding
			if(!binding) {
				return false;
			}

			//reset counters on state change
			if(lastState !== character.movement) {
				c = binding.frames;
				f = 0;
				sequence = binding.startSequence;
			}

			//skip frames
			if(c < binding.frames) {
				
				c += 1;

			//load frame
			} else {
				c = 0;

				character.spritePos = sequence[f];

				//advance the frame
				if(f < sequence.length - 1) {
					f += 1;
				} else {
					f = 0;
					if(binding.runningSequence.length) {
						sequence = binding.runningSequence;
					}
				}

			}

			lastState = character.movement;

		});

		/**
		 * Defines a sequence of movement for a specific motion
		 * @param movement
		 * @param startSequence
		 * @param runningSequence
		 * @param frames
		 */
		function animateMovement(movement, startSequence, runningSequence, frames) {

			//bind the new animation set
			if(movement === 'idle' || movement === 'up' || movement === 'down' || movement === 'right' || movement === 'left'){
				aniBindings[movement] = {
					"startSequence": startSequence || runningSequence,
					"runningSequence": runningSequence,
					"frames": frames
				}
			}
		}


		function onIdle(startSequence, runningSequence, frames) {
			animateMovement('idle', startSequence, runningSequence, frames);
		}
		function onUp(startSequence, runningSequence, frames) {
			animateMovement('up', startSequence, runningSequence, frames);
		}
		function onDown(startSequence, runningSequence, frames) {
			animateMovement('down', startSequence, runningSequence, frames);
		}
		function onRight(startSequence, runningSequence, frames) {
			animateMovement('right', startSequence, runningSequence, frames);
		}
		function onLeft(startSequence, runningSequence, frames) {
			animateMovement('left', startSequence, runningSequence, frames);
		}

		return jQuery.extend(character, {
			"sequence": {
				"idle": onIdle,
				"up": onUp,
				"down": onDown,
				"right": onRight,
				"left": onLeft
			}
		});
	}

	/**
	 * Binds the arrow keys to a character
	 * @param distance
	 */
	function bindToArrowKeys(character, distance) {

		//set the default pixel travel
		distance = distance || 1;

		//move loop
		//Defines what the state of the object is and weather or not its moving
		var arrowKeysLoop = engine.every(function () {

			//get the input.
			var keyboard = engine.keyboard();

			//none
			if(keyboard.axisCode === 0) {
				return false;

			//up
			} else if (keyboard.axisCode === 1) {
				move(character, character.x, character.y - distance);

			// up + right
			} else if (keyboard.axisCode === 11) {
				var coords = engine.coords(45, distance);
				move(character, coords.x + character.x, coords.y + character.y);

			// right
			} else if (keyboard.axisCode === 10) {
				move(character, character.x + distance, character.y);

			//down + right
			} else if (keyboard.axisCode === 110) {
				var coords = engine.coords(135, distance);
				move(character, character.x + coords.x, character.y + coords.y);

			//down
			} else if (keyboard.axisCode === 100) {
				move(character, character.x, character.y + distance);

			//down + left
			} else if (keyboard.axisCode === 1100) {
				var coords = engine.coords(225, distance);
				move(character, character.x + coords.x, character.y + coords.y);

			//left
			} else if (keyboard.axisCode === 1000) {
				move(character, character.x - distance, character.y);

			//left + up
			} else if (keyboard.axisCode === 1001) {
				var coords = engine.coords(315, distance);
				move(character, character.x + coords.x, character.y + coords.y);
			}

		});

		return {
			"clear": arrowKeysLoop.clear
		}
	}

	function setMovement(character, degree, framesToHoldFor) {

		var framesToHoldFor = (framesToHoldFor || 0) + 1,
		degree = degree + 45;
		degree = degree < 360 ? degree : 0;

		//prevent the sprite from returning to idle
		if(character.idleTimer) { character.idleTimer.clear(); delete character.idleTimer; }

		//find out the state based on direction
		if(degree > 0 && degree < 90) {
			character.movement = 'up';
		} else if (degree >= 90 && degree <= 180){
			character.movement = 'right';
		} else if (degree > 180 && degree < 270){
			character.movement = 'down';
		} else if (degree >= 270 || degree === 0){
			character.movement = 'left';
		}

		//setup a timer to idle the sprite movement
		character.idleTimer = engine.after(function(){
			character.movement = 'idle';
		}, framesToHoldFor);

	}

	function move(character, x, y) {
		setMovement(character, engine.angle(x - character.x, y - character.y));
		engine.element.move(character, x, y);
	}

	function animateMove(character, x, y, frames, callback) {
		setMovement(character, engine.angle(x - character.x, y - character.y), frames);
		engine.animate.move(character, x, y, frames, callback);
	}

	return {
		"create": newCharacter,
		"move": move,
		"animate": {
			"move": animateMove
		},
		"bindToArrowKeys": bindToArrowKeys,
		"setMovement": setMovement
	}
});