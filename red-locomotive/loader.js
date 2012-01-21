(function(context, factory) {

	if(typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		context.RedLocomotive = factory();
	}

})(this, function () {
	function RedLocomotive(config, callback) {

		//Validate
		if(typeof require === 'undefined') { throw new Error('Red Locomotive requires an amd loader to run.'); }

		//Vars
		var coreModules = [
				'core',
				'audio',
				'viewports',
				'bitmaps',
				'sprites',
				'elements',
				'animations',
				'paths',
				'collisions'
			],
			eventCallbacks = {
				"loaded": []
			};

		//Load & Exec
		require(coreModules, function() {

			//get the modules
			var modules = Array.prototype.splice.call(arguments);

			//create the vars
			var engineData = {};
			var api = {
				"loader": {
					"on": onEvent
				},
				"eventEmitter": {
					"create": EventEmitter
				}
			};

			//loop through the core modules
			modules.foreach(function(module, mI) {
				var moduleName = coreModules[mI];

				//Execute the module's init function
				api[moduleName] = module(api, engineData, config);
			});

			//fire the loaded event
			eventCallbacks['loaded'].forEach(function(callback) { callback(); });
		});

		//Functions
		function onEvent(event, callback) {
			if(typeof callback !== 'function') { return false; }

			if(event === 'loaded') {
				eventCallbacks['loaded'].push(callback);
			}

			return true;
		}
	}

	/**
	 * Creates a event emitter
	 * @param events
	 */
	function EventEmitter(events) {
		var api = {
			"on": on,
			"trigger": {}
		};
		var callbacks = {};

		//create each callback stack
		events.forEach(function(event) {
			if(typeof event !== 'string') { throw new Error('Cannot create event emitter. An invalid event was passed. Events must be strings.'); }
			if(event === 'on') { throw new Error('Cannot create event emitter. An event cannot be named "on". "on" is reserved for the event emitter API.'); }

			//create the callback stack
			callbacks[event] = [];

			//create the execute function
			api.trigger[event] = function(data) {

				//fire the callbacks
				callbacks[event].forEach(function(callback) { callback(data); });
			}
		});

		/**
		 * Binds functions to events
		 * @param event
		 * @param callback
		 */
		function on(event, callback) {
			if(typeof event !== 'string') { throw new Error('Cannot bind to event emitter. The passed event is not a string.') }
			if(typeof callback !== 'function') { throw new Error('Cannot bind to event emitter. The passed callback is not a function.') }

			//save the callback
			callbacks[event] = callback;
		}

		return api;
	}

	return RedLocomotive;
});