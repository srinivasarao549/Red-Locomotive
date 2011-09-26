/*!
 * Red Locomotive Audio Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 *
 */
RedLocomotive('audio', function(){
    "use strict"

	function sound(url, args){

		var canPlay = false,
			elements = [],
			options = jQuery.extend({
				"callback": false,
				"formats": []
			}, args);

		//create the first element
		createAudioElement(function(){ canPlay = true; });

		//creates a new audio element
		function createAudioElement(callback) {

			//create the element
			var element = jQuery('<audio preload="audio"></audio>');

			//save the element
			elements.push(element);

			//add the source tags
			if(options.formats.length > 1) {
				var sourceUrl = '';
				for(var i = 0; i < options.formats.length; i += 1) {
					sourceUrl = url + '.' + options.formats[i];
					element.append('<source src="' + sourceUrl + '" type="audio/' + options.formats[i] + '">');
				}
			}

			//add a src attribute
			else {
				element.attr('src', url);
			}

			//bind a callback for when the element is ready
			if(typeof callback === 'function') {
				element.bind('canplay', function(){
					if(typeof callback === 'function'){ callback(element); }
				});
			}

			//bind an error to sound that will not load
			element.bind('error', function(){
				throw Error('Audio media at could not be found "' + url + '".');
			});
		}

		//plays a sound, add more audio elements when playing the same sound overlapping
		function play() {
			if(canPlay) {
				//create the element
				createAudioElement(function(element) {

					//play the sound
					element[0].play();

					//if a callback has been defined then use it
					element.bind('ended', function(){

						//delete the element
						elements.splice(elements.indexOf(element), 1);

						if(typeof options.callback === 'function') {
							//fire the callback
							options.callback();
						}
					});
				});
			}
		}

		function stop() {
			for(var i = 0; i < elements.length; i += 1) {
				var element = elements[i];

				//stop the element
				element[0].stop();

				//delete the element
				elements.splice(i, 1);
			}
		}

		function loop() {
			for(var i = 0; i < elements.length; i += 1) {
				var element = elements[i];

				//stop the element
				element.attr('loop', true);
			}
		}

		function once() {
			for(var i = 0; i < elements.length; i += 1) {
				var element = elements[i];

				//stop the element
				element.attr('loop', false);
			}
		}

		function isPlaying() {
			return (elements.length > 0);
		}

		return {
			"play": play,
			"stop": stop,
			"loop": loop,
			"once": once
		}
	}

	return {
		"audio": {
			"sound": sound
		}
	}
});