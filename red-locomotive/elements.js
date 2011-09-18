/*!
 * Red Locomotive Elements Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */
RedLocomotive("elements", function(engine, options) {

    var elements = {},
		textElements = {};

	/**
	 * New Element
	 * @param elementName
	 * @param spriteSheet
	 * @param x
	 * @param y
	 * @param z
	 * @param sPC
	 * @param sPR
	 * @param cMC
	 * @param cMR
	 */
    function newElement(elementName, spriteSheet, x, y, z, sPC, sPR, cMC, cMR) {
		
		if(elementName !== 'all') {

			if(spriteSheet && typeof spriteSheet === 'string') {
				spriteSheet = engine.spriteSheet.get(spriteSheet);
			}

			var element = {
				"name": elementName,
				"spriteSheet": spriteSheet,
				"x": x || 0,
				"y": y || 0,
				"z": z || 0,
				"width": spriteSheet.sprites[0][0].canvas[0].width,
				"height": spriteSheet.sprites[0][0].canvas[0].height,
				"spritePos": [sPC || 0, sPR || 0],
				"colMaskPos": [cMC || sPC || 0, cMR || sPR || 0]
			};

			//save the element
			elements[elementName] = element;
			return element;
		}

		return false;
    }

	/**
	 * Get Element or Elements
	 * @param elementName
	 */
	function getElement(elementName) {

		if (elementName === "all") {
			return elements;
		} else if (elements[elementName]) {
			return elements[elementName];
		}

		return false;
	}

	/**
	 * Remove Element
	 * @param elementName
	 */
	function removeElement(elementName) {

		if(elementName.name){
			elementName = elementName.name;
		}

		if(elementName === 'all') {
			elements = {};
		}

		if (elements[elementName]) {
			delete elements[elementName];
			return true;
		}

		return false
	}

	function setCollisionMask(element, x, y) {
		element.colMaskPos = [x, y];
	}

	/**
	 * Takes an element and a vector, then moves the element to the vector's end point
	 * @param element
	 * @param x
	 * @param y
	 */
	function move(element, x, y) {

		var cleared = false;

		function clear() {
			cleared = true;
		}

		var api = {
			"clear": clear
		};

		//fire an event for movement
		engine.event('move', api, x - element.x, y - element.y);
		engine.event('move-' + element.name, api, x - element.x, y - element.y);

		//if an element is returned by the collision check then
		// try to place the element as close to the blocking element
		// as possible
		if(!cleared){

			//apply the element position
			element.x = x;
			element.y = y;
			return true;

		} else {
			return false;
		}
	}

	function keepIn(element, viewport, marginX, marginY) {

		//set the default margins
        marginX = marginX || 0;
        marginY = marginY || marginX;

		if(
			typeof element.x !== "undefined" ||
			typeof element.y !== "undefined" ||
			typeof element.height !== "undefined" ||
			typeof element.width !== "undefined" ||
			
			typeof viewport.x !== "undefined" ||
			typeof viewport.y !== "undefined"

		) {

			var bindingAction = engine.when('move-' + element.name, function(){

                //figure out limits
                var viewportLimits = {
                        "top": viewport.y,
                        "bottom": viewport.y + viewport.node[0].height,
                        "left": viewport.x,
                        "right": viewport.x + viewport.width,
                        "centerX": (viewport.x + (viewport.width / 2)),
                        "centerY": (viewport.y + (viewport.height / 2))
                    },
                    elementLimits = {
                        "top": element.y - marginY,
                        "bottom": element.y + element.height + marginY,
                        "left": element.x - marginX,
                        "right": element.x + element.width + marginX,
                        "centerX": (element.x + (element.width / 2)),
                        "centerY": (element.y + (element.height / 2))
                    };

                //if element height is greater than viewport height
                if(marginX === -1 || elementLimits.bottom - elementLimits.top > viewportLimits.bottom - viewportLimits.top){

                    viewport.x += elementLimits.centerX - viewportLimits.centerX;

                } else {

                    //scroll Y on limits
                    if (elementLimits.top < viewportLimits.top) {
                        viewport.y = elementLimits.top;
                    }
                    if (elementLimits.bottom > viewportLimits.bottom) {
                        viewport.y = elementLimits.bottom - (viewportLimits.bottom - viewportLimits.top);
                    }
                }

                //if element width is greater than viewport width
                if(marginY === -1 || elementLimits.right - elementLimits.left > viewportLimits.right - viewportLimits.left){

                    viewport.y += elementLimits.centerY - viewportLimits.centerY;

                } else {

                    //scroll X on limits
                    if (elementLimits.left < viewportLimits.left) {
                        viewport.x = elementLimits.left;
                    }
                    if (elementLimits.right > viewportLimits.right) {
                        viewport.x = elementLimits.right - (viewportLimits.right - viewportLimits.left);
                    }
                }

			});
			engine.event('move-' + element.name);

			return {
				"clear": bindingAction.clear
			}

		}

		return false;
	}

	function newCharacter(elementName, spriteUrl, x, y, z, w, h) {

		//create an element
		var character = engine.element.create(elementName, spriteUrl, x, y, z, w, h),
			binding,
			lastState = '',
			c = 0,
			f = 0,
			sequence;

		character.movement = 'idle';
		character.sequenceBindings = {
			"idle": false,
			"up": false,
			"down": false,
			"right": false,
			"left": false
		};


		engine.every(function(){

			//get the current binding
			binding = character.sequenceBindings[character.movement];

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

					// there is a running sequence use it from now on
					if(binding.runningSequence.length) {
						sequence = binding.runningSequence;
					}
				}

			}

			lastState = character.movement;

		});

		var idleTimer;

		//bind to the move function
		engine.when('move-' + elementName, function(api, x, y) {

			if(idleTimer) {
				idleTimer.clear();
			}

			var _x = x < 0 ? -x : x,
				_y = y < 0 ? -y : y,
				mH = _x >= _y;

			if(mH) {
				if(x < 0) {
					character.movement = 'left';
				} else {
					character.movement = 'right';
				}
			} else {
				if(y < 0) {
					character.movement = 'up';
				} else {
					character.movement = 'down';
				}
			}

			//setup a timer to idle the sprite movement
			idleTimer = engine.after(function(){
				character.movement = 'idle';
			}, 2);

		});

		return character;
	}

	/**
	 * Defines a sequence of movement for a specific motion
	 * @param character
	 * @param movement
	 * @param startSequence
	 * @param runningSequence
	 * @param frames
	 */
	function onMovement(character, movement, startSequence, runningSequence, frames) {

		if(typeof runningSequence === 'number' && !frames) {
			frames = runningSequence;
			runningSequence = false;
		}

		//bind the new animation set
		if(movement === 'idle' || movement === 'up' || movement === 'down' || movement === 'right' || movement === 'left'){
			character.sequenceBindings[movement] = {
				"startSequence": startSequence,
				"runningSequence": runningSequence,
				"frames": frames
			}
		}
	}

	/**
	 * Sets a pair of sequences to play when the character is idle
	 * @param character
	 * @param startSequence
	 * @param runningSequence
	 * @param frames
	 */
	function onIdle(character, startSequence, runningSequence, frames) {
		onMovement(character, 'idle', startSequence, runningSequence, frames);
	}

	/**
	 * Sets a pair of sequences to play when the character is moving up
	 * @param character
	 * @param startSequence
	 * @param runningSequence
	 * @param frames
	 */
	function onUp(character, startSequence, runningSequence, frames) {
		onMovement(character, 'up', startSequence, runningSequence, frames);
	}

	/**
	 * Sets a pair of sequences to play when the character is moving down
	 * @param character
	 * @param startSequence
	 * @param runningSequence
	 * @param frames
	 */
	function onDown(character, startSequence, runningSequence, frames) {
		onMovement(character, 'down', startSequence, runningSequence, frames);
	}

	/**
	 * Sets a pair of sequences to play when the character is moving right
	 * @param character
	 * @param startSequence
	 * @param runningSequence
	 * @param frames
	 */
	function onRight(character, startSequence, runningSequence, frames) {
		onMovement(character, 'right', startSequence, runningSequence, frames);
	}

	/**
	 * Sets a pair of sequences to play when the character is moving left
	 * @param character
	 * @param startSequence
	 * @param runningSequence
	 * @param frames
	 */
	function onLeft(character, startSequence, runningSequence, frames) {
		onMovement(character, 'left', startSequence, runningSequence, frames);
	}

	/**
	 * Binds the arrow keys to an element
	 * @param character
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

    return {
        "element": {
            "create": newElement,
            "get": getElement,
			"remove": removeElement,
			"move": move,
			"keepIn": keepIn,
	        "collisionMask": setCollisionMask
        },
	    "character": {
			"create": newCharacter,
			"onIdle": onIdle,
			"onUp": onUp,
			"onDown": onDown,
			"onLeft": onLeft,
			"onRight": onRight,
			"bindToArrowKeys": bindToArrowKeys
	    }
    }
});