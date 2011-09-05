/*!
 * Red Locomotive Controls Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */

RedLocomotive('controls', function () {

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
		mouse = {
			"x": -1,
			"y": -1,
			"leftButton": {
				"pressed": false,
				"x": -1,
				"y": -1
			},
			"rightButton": {
				"pressed": false,
				"x": -1,
				"y": -1
			}
		},
		activeKeys = [],
		spentKeys = [],
		keyBindings = [];

	jQuery(document).keydown('*', function(event) {

		for (var key in keys) {
			if(keys.hasOwnProperty(key) && event.keyCode === keys[key]) {
				if(activeKeys.indexOf(key) < 0) {
					activeKeys.push(key);
				}
			}
		}

		checkBindedKeys();

	});

	jQuery(document).keyup('*', function (event) {

		for(var key in keys) {
			if(keys.hasOwnProperty(key) && event.keyCode === keys[key]) {

				var iAK = activeKeys.indexOf(key),
					iSK = spentKeys.indexOf(key);

				if(iAK > -1) {
					activeKeys.splice(iAK, 1);
				}

				if(iSK > -1) {
					spentKeys.splice(iSK, 1);
				}

			}
		}

	});

	jQuery(document).mousedown(function(){

	});

	jQuery(document).mouseup(function(){

	});

	function checkBindedKeys() {

		//loop through the key bindings.
		for(var iB = 0; iB < keyBindings.length; iB += 1) {
			var KeyBinding = keyBindings[iB],
				keyBindingActive = true;

			//loop through the current key binding keys.
			for(var iKB = 0; iKB < KeyBinding.keys.length;  iKB += 1) {
				var key = KeyBinding.keys[iKB],
					keyActive = false,
					keySpent = false;

				//loop through the spent keys and findout if the current key is usable.
				for(var iSK = 0; iSK < spentKeys.length; iSK += 1) {
					if(key === spentKeys[iSK]) {
						keySpent = true;
					}
				}

				//if the key has not been spent in a binding execution.
				if(!keySpent) {

					//loop through the active keys and findout if the current key is pressed.
					for(var iAK = 0; iAK < activeKeys.length; iAK += 1) {
						if(key === activeKeys[iAK]) {
							keyActive = true;
							break;
						}
					}
				}

				//if the key is not pressed break out of the current binding.
				if(!keyActive) {
					keyBindingActive = false;
				}
			}

			if(keyBindingActive) {
				//fire the callback
				KeyBinding.callback(KeyBinding.keys, KeyBinding.keyCombo);

				for(var iKB = 0; iKB < KeyBinding.keys.length;  iKB += 1) {
					spentKeys.push(KeyBinding.keys[iKB]);
				}
			}
		}


	}

	function bindKey(keyCombo, callback) {

		var bindSets = keyCombo.toLowerCase().replace(/\s/g, '').split(',');

		for(var i = 0; i < bindSets.length; i += 1) {

			var keys = bindSets[i].split('+');

			if(keys.length) {
				keyBindings.push({
					"callback": callback,
					"keyCombo": bindSets[i],
					"keys": keys,
					"spent": false
				});
			}

		}
	}

	function bindAxis(up, down, left, right, callback) {


	}

	return {
		"bind": {
			"key": bindKey
		}
	}

});