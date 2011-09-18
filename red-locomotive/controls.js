/*!
 * Red Locomotive Controls Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */

RedLocomotive('controls', function (engine, options) {

	var keys = {
			"backspace": 8,
			"tab": 9,
			"enter": 13,
			"shift": 16,
			"ctrl": 17,
			"alt": 18,
			"pause": 19, "break": 19,
			"capslock": 20,
			"escape": 27, "esc": 27,
			"space": 32, "spacebar": 32,
			"pageup": 33,
			"pagedown": 34,
			"end": 35,
			"home": 36,
			"left": 37,
			"up": 38,
			"right": 39,
			"down": 40,
			"insert": 45,
			"delete": 46,
			"0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57,
			"a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71, "h": 72, "i": 73, "j": 74, "k": 75, "l": 76, "m": 77, "n": 78, "o": 79, "p": 80, "q": 81, "r": 82, "s": 83, "t": 84, "u": 85, "v": 86, "w": 87, "x": 88, "y": 89, "z": 90,
			"meta": 91, "command": 91, "windows": 91, "win": 91,
			"_91": 92,
			"select": 93,
			"num0": 96, "num1": 97, "num2": 98, "num3": 99, "num4": 100, "num5": 101, "num6": 102, "num7": 103, "num8": 104, "num9": 105,
			"multiply": 106,
			"add": 107,
			"subtract": 109,
			"decimal": 110,
			"divide": 111,
			"f1": 112, "f2": 113, "f3": 114, "f4": 115, "f5": 116, "f6": 117, "f7": 118, "f8": 119, "f9": 120, "f10": 121, "f11": 122, "f12": 123,
			"numlock": 144, "num": 144,
			"scrolllock": 145, "scroll": 145,
			"semicolon": 186,
			"equal": 187, "equalsign": 187,
			"comma": 188,
			"dash": 189,
			"period": 190,
			"slash": 191, "forwardslash": 191,
			"graveaccent": 192,
			"openbracket": 219,
			"backslash": 220,
			"closebracket": 221,
			"singlequote": 222
		},
		activeKeys = [],
		keyBindings = [];

	
	jQuery(document).keydown(function(event) {

		for (var key in keys) {
			if(keys.hasOwnProperty(key) && event.keyCode === keys[key]) {
				if(activeKeys.indexOf(key) < 0) {
					activeKeys.push(key);
				}
			}
		}

		return checkBindedKeys();
		
	});

	jQuery(document).keyup(function (event) {

		for(var key in keys) {
			if(keys.hasOwnProperty(key) && event.keyCode === keys[key]) {

				var iAK = activeKeys.indexOf(key);

				if(iAK > -1) {
					activeKeys.splice(iAK, 1);
				}
			}
		}
	});

	function checkBindedKeys() {

		if(activeKeys < 1) {
			return true;
		}

		var activeKeyBindings = [],
			spentKeys = [];

		//loop through the key binding groups.
		for(var iKCL = keyBindings.length; iKCL > -1; iKCL -= 1) {
			if(keyBindings[iKCL]) {
				var KeyBindingGroup = keyBindings[iKCL];

				//loop through the key bindings.
				for(var iB = 0; iB < KeyBindingGroup.length; iB += 1) {
					var KeyBinding = KeyBindingGroup[iB],
						keyBindingActive = true;

					//loop through the current key binding keys.
					for(var iKB = 0; iKB < KeyBinding.keys.length;  iKB += 1) {
						var key = KeyBinding.keys[iKB];

						//loop through the active keys and findout if the current key is pressed.
						if(activeKeys.indexOf(key) < 0) {
							keyBindingActive = false;
						}
					}

					if(keyBindingActive) {
						activeKeyBindings.push(KeyBinding);
					}
				}
			}
		}

		for (var iAKB = 0; iAKB < activeKeyBindings.length; iAKB += 1) {
			var activeKeyBinding = activeKeyBindings[iAKB],
				keySpent = false;

			for(var iK = 0; iK < activeKeyBinding.keys.length; iK += 1) {
				if(spentKeys.indexOf(key) > -1) {
					keySpent = true;
					break;
				}
			}

			if(!keySpent) {
				//fire the callback
				activeKeyBinding.callback(activeKeyBinding.keys, activeKeyBinding.keyCombo);

				for(var iK = 0; iK < activeKeyBinding.keys.length; iK += 1) {
					if(spentKeys.indexOf(key) < 0) {
						spentKeys.push(key);
					}
				}
			}
		}

		if(spentKeys.length) {
			return false;
		}

		return true;
	}

	function bindKey(keyCombo, callback) {

		//create an array of combos from the first argument
		var bindSets = keyCombo.toLowerCase().replace(/\s/g, '').split(',');

		//create a binding for each key combo
		for(var i = 0; i < bindSets.length; i += 1) {

			//split up the keys
			var keys = bindSets[i].split('+');

			//if there are keys in the current combo
			if(keys.length) {
				if(!keyBindings[keys.length]) { keyBindings[keys.length] = []; }

				//save the binding sorted by length
				keyBindings[keys.length].push({
					"callback": callback,
					"keyCombo": bindSets[i],
					"keys": keys
				});
			}

		}
	}

	function bindAxis(up, down, left, right, distance, callback) {
		var axis = [0, 0],
			lastAxis = [false, false];

		if(typeof callback !== 'function') {
			return;
		}

		//up
		bindKey(up, function () {
			axis[1] = -1;
		});

		//down
		bindKey(down, function () {
			axis[1] = 1;
		});

		//left
		bindKey(left, function () {
			axis[0] = -1;
		});

		//right
		bindKey(right, function () {
			axis[0] = 1;
		});

		engine.every(function(){
			var degree;

			if (
				(axis[0] !== lastAxis[0]) || (axis[1] !== lastAxis[1])
			) {

				//up
				if(axis[0] === 0 && axis[1] === -1) {
					degree = 0;
				}

				//up left
				else if(axis[0] === 1 && axis[1] === -1) {
					degree = 45;
				}

				//left
				else if(axis[0] === 1 && axis[1] === 0) {
					degree = 90;
				}

				//left down
				else if(axis[0] === 1 && axis[1] === 1) {
					degree = 135;
				}

				//down
				else if(axis[0] === 0 && axis[1] === 1) {
					degree = 180;
				}

				//down right
				else if(axis[0] === -1 && axis[1] === 1) {
					degree = 225;
				}

				//right
				else if(axis[0] === -1 && axis[1] === 0) {
					degree = 270;
				}

				//run the callback
				callback(engine.coords(degree, distance));
			}
		});
	}

	function getActiveKeys() {
		return activeKeys;
	}

	function cursorIsInElement(element, x, y, minAlpha) {

		if(
			(x >= element.x && x < element.x + element.width) &&
			(y >= element.y && y < element.y + element.height)
		) {
			var bitmap = element.spriteSheet.sprites[element.colMaskPos[0]][element.colMaskPos[1]];

			if(typeof minAlpha === 'number') {

				if(engine.bitmap.pointData(bitmap, x - element.x, y - element.y)[3] >= minAlpha) {
					return true;
				} else {
					return false;
				}

			} else {
				return true;
			}
		}
		
		return false;
	}

	function onHoverBase(element, viewport, callback, endCallback, minAlpha) {
		var isIn = false;

		if(typeof callback === 'function') {

			viewport.node.mousemove(function(event){
				//run the callback if all event requirements have been met
				if(cursorIsInElement(element, viewport.cursor.x, viewport.cursor.y, minAlpha)) {
					isIn = true;
					callback(event);
				}
				if(isIn && !cursorIsInElement(element, viewport.cursor.x, viewport.cursor.y, minAlpha)) {
					isIn = false;

					if(typeof endCallback === 'function') {
						endCallback(event);
					}
				}
			});
		}
	}

	function onHover(element, viewport, callback, endCallback) {
		onHoverBase(element, viewport, callback, endCallback, false);
	}

	function onAlphaHover(element, viewport, alpha, callback, endCallback) {
		onHoverBase(element, viewport, callback, endCallback, alpha);
	}

	function onClickBase(element, viewport, callback, endCallback, button, minAlpha) {
		var isIn = false;

		if(typeof callback === 'function' && (!button || button === event.which)) {

			//ON MOUSE IN
			viewport.node.mousedown(function(event){
				//run the callback if all event requirements have been met
				if(cursorIsInElement(element, viewport.cursor.x, viewport.cursor.y, minAlpha)) {
					isIn = true;
					callback(event);
				}
			});

			//ON MOUSE OUT
			viewport.node.mouseup(function (event) {
				if(isIn && cursorIsInElement(element, viewport.cursor.x, viewport.cursor.y, minAlpha)) {
					isIn = false;

					if(typeof endCallback === 'function') {
						endCallback(event);
					}
				}
			});
		}
	}

	function onClick(element, viewport, callback, endCallback) {
		onClickBase(element, viewport, callback, endCallback, false, false);
	}

	function onLeftClick(element, viewport, callback, endCallback) {
		onClickBase(element, viewport, callback, endCallback, 1, false);
	}

	function onMiddleClick(element, viewport, callback, endCallback) {
		onClickBase(element, viewport, callback, endCallback, 2, false);
	}

	function onRightClick(element, viewport, callback, endCallback) {
		onClickBase(element, viewport, callback, endCallback, 3, false);
	}

	function onAlphaClick(element, viewport, alpha, callback, endCallback) {
		onClickBase(element, viewport, callback, endCallback, false, alpha);
	}

	function onAlphaLeftClick(element, viewport, alpha, callback, endCallback) {
		onClickBase(element, viewport, callback, endCallback, 1, alpha);
	}

	function onAlphaMiddleClick(element, viewport, alpha, callback, endCallback) {
		onClickBase(element, viewport, callback, endCallback, 2, alpha);
	}

	function onAlphaRightClick(element, viewport, alpha, callback, endCallback) {
		onClickBase(element, viewport, callback, endCallback, 3, alpha);
	}

	return {
		"bind": {
			"key": bindKey,
			"axis": bindAxis,
			"click": onClick,
			"leftClick": onLeftClick,
			"middleClick": onMiddleClick,
			"rightClick": onRightClick,
			"hover": onHover,
			"alpha": {
				"click": onAlphaClick,
				"leftClick": onAlphaLeftClick,
				"middleClick": onAlphaMiddleClick,
				"rightClick": onAlphaRightClick,
				"hover": onAlphaHover
			}
		},
		"activeKeys": getActiveKeys
	}

});