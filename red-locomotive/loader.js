(function(){
	/**
	 * RED LOCOMOTIVE LOADER
	 *
	 * This script contains Red Locomotive's loader object and its boot script.
	 *
	 * !!! DO NOT TOUCH !!! If this is broken NOTHING WILL EVER WORK!
	 */

	var Engine = {},
		modules = {},
		kernel = function() {},
		options,
		state;

	/**
	 * loadScript - Load one or more scripts then fire a callback
	 * @author <a href="mailto:robert@thinktankdesign.ca">Robert Hurst</a>
	 * @param url {string} A string containing a script url.
	 * @param callback {function} [optional] A function to be executed after the requested script has been loaded.
	 */
	function loadScript(url, callback) {

		//if a single script is requested then load it
		if (typeof url === 'string') {

			//load the script via ajax
			jQuery.ajax({
				url: options.baseUrl + url || 'Red-Locomotive/',
				dataType: 'script',
				complete: function() {
					callback();
				}
			});
		}
	}

	/**
	 * require - Load a module for use
	 * @author <a href="mailto:robert@thinktankdesign.ca">Robert Hurst</a>
	 * @param moduleName {string} A string containing a name of a module. See README of a list of modules.
	 */
	function require(moduleName, callback, inCore) {

		//if a list of modules is given
		if(typeof moduleName === 'object') {
			var reqModules = moduleName,
				i = 0;

			function loadCounter () {

				if (i < reqModules.length) {
					i += 1;
				} else if (typeof callback === 'function') {
					callback();
				}

			}

			//load each module
			for(var moduleName in reqModules) {
				//load the current module
				require(moduleName, loadCounter);
			}

		//if a single module is given
		} else {

			//define the module path
			var modulePath = 'red-locomotive/';

			//if not loading from the core use the modules folder
			if(!inCore) {
				modulePath = 'modules/' + moduleName + '/';
			}

			//load the module
			loadScript(modulePath + moduleName + '.js', function () {

				if (typeof modules[moduleName] === "function") {
					if(!inCore) {
						Engine[moduleName] = modules[moduleName](Engine, options);
					} else {
						Engine = jQuery.extend(true, Engine, modules[moduleName](Engine, options));
					}
				}

				if (typeof callback === "function") {

					callback();
				}
			});
		}
	}

	/**
	 * RedLocomotive - Creates and returns an engine, or takes a module and extends Red Locomotive
	 * @author <a href="mailto:robert@thinktankdesign.ca">Robert Hurst</a>
	 * @param input {object|string} A module name, or a set of options.
	 * @param callback {object} A module or the kernel script.
	 */
	function RedLocomotive(input, callback) {
		var coreModules = [
				"core",
				"viewports",
				"elements",
				"sprites",
				"paths",
				"animations",
                "collisions",
				"audio"
			],
			i = 1;

		//a callback must be given
		if (typeof callback === "function") {

			//expect a module if a string is given as the first argument
			if (typeof input === "string") {
				modules[input] = callback;

			//expect an initialization if the first argument is an object
			} else if(typeof input === "object") {

				//set the engine options
				options = input;

				//set the kernel
				kernel = callback;

				//set the state
				state = 2;

				//function that executes the kernel after loading all the modules
				function count() {

					//if all the modules are loaded
					if (i >= coreModules.length) {

						//execute the kernel
						kernel(Engine);

					//if still loading some modules count and wait
					} else {
						i += 1;
					}
				}

				//loop through each of the modules and load them with require
				for (var ii = 0; ii < coreModules.length; ii += 1) {
					require(coreModules[ii], count, true);
				}
			}
		}

	}

	//add require and load to red loco
	Engine = jQuery.extend(true, Engine, {
		//strip the 'core' flag so that the end user cannot reload core modules
		"require": function(moduleName, callback) {
			require(moduleName, callback);
		},
		"loader": {
			"loadScript": loadScript
		}
	});

	//globalize Red Locomotive's constructor
	window.RedLocomotive = RedLocomotive;
})();