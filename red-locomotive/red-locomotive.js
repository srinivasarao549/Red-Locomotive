(function(context, factory) {

	if(typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		context.RedLocomotive = factory();
	}

})(window, function () {

	//return RedLocomotive factory
	return RedLocomotive;

	/**
	 * Creates a Red Locomotive instance
	 * @param config
	 * @param callback
	 */
	function RedLocomotive(config, callback) {
		var coreModules;

		//Validate
		if(typeof require === 'undefined') { throw new Error('Red Locomotive requires an amd loader to run.'); }

		//Vars
		coreModules = [
			'pollyFills',
			'core',
			'elements'
		];

		//config
		config.baseUrl = config.baseUrl || '/';

		//require config
		require.config({
			"baseUrl": config.baseUrl + 'red-locomotive/'
		});

		//Load & Exec
		require(coreModules, function(    ) {
			var modules, coreEmitter, db, api;

			//get the modules
			modules = Array.prototype.slice.apply(arguments);

			//create the core event emitter
			coreEmitter = EventEmitter();

			//create the vars
			db = {};

			//create the instance API
			api = {
				"on": coreEmitter.on,
				"trigger": coreEmitter.trigger,
				"event": {
					"emitter": EventEmitter
				},
				"extend": extend,
				"merge": merge
			};

			//execute the callback passing it the engine's api and fire the loaded event
			callback(api);
			coreEmitter.trigger('init');

			//add the config to the engine data store
			db.config = config;

			//loop through the core modules
			modules.forEach(function(module, mI) {
				var moduleApi, namespace;

				moduleApi = {};

				if(typeof module !== 'function') { throw new Error('Cannot execute module "' + coreModules[mI] + '" because it did not return a valid function on init.'); }

				//get the namespace
				namespace = typeof module.namespace !== 'string' && module.name || module.namespace;

				//execute the module
				if(namespace === '') {
					merge(api, module(api, db));
				} else {
					moduleApi[namespace] = module(api, db);
					merge(api, moduleApi);
				}

			});

			//fire the ready event
			coreEmitter.trigger('ready');

		});
	}

	/**
	 * Creates a event emitter
	 */
	function EventEmitter() {
		var api, callbacks;

		//vars
		api = {
			"on": on,
			"trigger": trigger
		};
		callbacks = {};

		//return the api
		return api;

		/**
		 * Binds functions to events
		 * @param event
		 * @param callback
		 */
		function on(event, callback) {
			var api;

			if(typeof event !== 'string') { throw new Error('Cannot bind to event emitter. The passed event is not a string.'); }
			if(typeof callback !== 'function') { throw new Error('Cannot bind to event emitter. The passed callback is not a function.'); }

			//return the api
			api = {
				"clear": clear
			};

			//create the event namespace if it doesn't exist
			if(!callbacks[event]) { callbacks[event] = []; }

			//save the callback
			callbacks[event].push(callback);

			//return the api
			return api;

			function clear() {
				var i;
				if(callbacks[event]) {
					i = callbacks[event].indexOf(callback);
					callbacks[event].splice(i, 1);

					if(callbacks[event].length < 1) {
						delete callbacks[event];
					}

					return true;
				}
				return false;
			}
		}

		/**
		 * Triggers a given event and optionally passes its handlers all additional parameters
		 * @param event
		 */
		function trigger(event    ) {
			var args;

			if(typeof event !== 'string' && !Array.isArray(event)) { throw new Error('Cannot bind to event emitter. The passed event is not a string or an array.'); }

			//get the arguments
			args = Array.prototype.slice.apply(arguments).splice(1);

			//handle event arrays
			if(Array.isArray(event)) {

				//for each event in the event array self invoke passing the arguments array
				event.forEach(function(event) {

					//add the event name to the begining of the arguments array
					args.unshift(event);

					//trigger the event
					trigger.apply(this, args);

					//shift off the event name
					args.shift();

				});

				return;
			}

			//if the event has callbacks then execute them
			if(callbacks[event]) {

				//fire the callbacks
				callbacks[event].forEach(function(callback) { callback.apply(this, args); });
			}

		}
	}


	/**
	 * Creates an object containing all properties of passed objects.
	 * Note: Merges left to right.
	 */
	function extend(    ) {
		var objects, base;

		objects = Array.prototype.slice.apply(arguments);

		//make sure the objects are all objects or arrays
		if(!objects.every(function(object) { return typeof object === 'object'})) { throw new Error('extend() only accepts object and array types.'); }

		//check for arrays
		if(objects.some(Array.isArray)) {
			base = [];
		} else {
			base = {};
		}

		//merge each object or array into the base
		objects.forEach(function(object) {
			var keys;

			keys = Object.keys(object);

			keys.forEach(function(key) {
				if('object' === typeof base[key] && 'object' === typeof object[key]) {
					base[key] = extend(base[key], object[key]);
				} else {
					base[key] = object[key];
				}
			});
		});

		return base;
	}


	/**
	 * Merges all the properties of passed objects into the first object passed.
	 * Note: Merges left to right.
	 */
	function merge(    ) {
		var objects, base;

		objects = Array.prototype.slice.apply(arguments);
		base = objects.shift();

		//make sure the objects are all objects or arrays
		if(!objects.every(function(object) { return typeof object === 'object'})) { throw new Error('extend() only accepts object and array types.'); }

		//merge each object or array into the base
		objects.forEach(function(object) {
			var keys;

			keys = Object.keys(object);

			keys.forEach(function(key) {
				if('object' === typeof base[key] && 'object' === typeof object[key]) {
					merge(base[key], object[key]);
				} else {
					base[key] = object[key];
				}
			});
		});
	}
});