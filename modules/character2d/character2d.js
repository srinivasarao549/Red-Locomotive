RedLocomotive('character2d', function(options, engine) {

	function newCharacter(elementName, spriteUrl, x, y, w, h) {

		//create an element
		var character = engine.element.create(elementName, spriteUrl, x, y, w, h),
			moveLoop,
			aniBindings = {
				"still": {},
				"up": {},
				"down": {},
				"right": {},
				"left": {}
			},
			binding,
			state = 'still',
			lastState = '',
			c = 0,
			f = 0,
			sequence;


		engine.every(function(){

			//get the current binding
			binding = aniBindings[state];

			//exit on bad binding
			if(!binding) {
				return false;
			}

			//reset counters on state change
			if(lastState !== state) {
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

				console.log(f, sequence.length);

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

			lastState = state;

		});

		/**
		 * Binds the arrow keys to a character
		 * @param pixelTravel
		 */
		function bindToArrowKeys(pixelTravel) {

			//set the default pixel travel
			var pixelTravel = pixelTravel || 5;

			//move loop
			//Defines what the state of the object is and weather or not its moving
			moveLoop = engine.every(function () {

				var keyboard = engine.keyboard(),
					moving = false;

				//if up
				if(keyboard.up && !keyboard.down) {
					character.y -= pixelTravel;
					state = 'up';
					moving = true;
				}

				//if down
				if(keyboard.down && !keyboard.up) {
					character.y += pixelTravel;
					state = 'down';
					moving = true;
				}

				//if right
				if(keyboard.right && !keyboard.left) {
					character.x += pixelTravel;
					state = 'right';
					moving = true;
				}

				//if left
				if(keyboard.left && !keyboard.right) {
					character.x -= pixelTravel;
					state = 'left';
					moving = true;
				}

				//If still
				if (!moving) {
					state = 'still';
				}
			});
		}

		/**
		 * Defines a sequence of movement for a specific direction
		 * @param direction
		 * @param startSequence
		 * @param runningSequence
		 * @param frames
		 */
		function animateMovement(direction, startSequence, runningSequence, frames) {

			var startSequence = startSequence || [],
				runningSequence = runningSequence || [];

			//bind the new animation set
			if(direction === 'still' || direction === 'up' || direction === 'down' || direction === 'right' || direction === 'left'){
				aniBindings[direction] = {
					"startSequence": startSequence,
					"runningSequence": runningSequence,
					"frames": frames
				}
			}
		}

		function onStill(startSequence, runningSequence, frames) {
			animateMovement('still', startSequence, runningSequence, frames);
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

		/**
		 * Unbinds all user control of an element
		 */
		function unbind() {
			moveLoop.clear();
		}

		return {
			"bindToArrowKeys": bindToArrowKeys,
			"unbind": unbind,
			"sequence": {
				"still": onStill,
				"up": onUp,
				"down": onDown,
				"right": onRight,
				"left": onLeft
			}
		}

	}


	return {
		"create": newCharacter
	}
});