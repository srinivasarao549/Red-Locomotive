(function(context, factory) {

	if(typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		context.RedLocomotive = factory();
	}

})(this, function () {

	//return RedLocomotive
	return RedLocomotive;

	function RedLocomotive(config, callback) {

		//Validate
		if(typeof require === 'undefined') { throw new Error('Red Locomotive requires an amd loader to run.'); }

		//Vars
		var coreModules = [
				'pollyFills',
				'core',
				//'audio',
				//'viewports',
				//'bitmaps',
				//'sprites',
				'elements',
				//'animations',
				//'paths',
				//'collisions'
			],
			eventCallbacks = {
				"loaded": []
			};

		//config
		config.baseUrl = config.baseUrl || '/';

		//require config
		require.config({
			"baseUrl": config.baseUrl + 'red-locomotive/'
		});

		//Load & Exec
		require(coreModules, function(    ) {

			//get the modules
			var modules = Array.prototype.slice.apply(arguments),

			//create the core event emitter
				coreEmitter = EventEmitter(),

			//create the vars
				engineDataStore = DataStore(),
				api = {
					"on": coreEmitter.on,
					"trigger": coreEmitter.trigger,
					"event": {
						"emitter": EventEmitter
					},
					"dataStore": DataStore,
					"extend": extend,
					"merge": merge
				};

			//execute the callback passing it the engine's api and fire the loaded event
			callback(api);
			coreEmitter.trigger('init');

			//add the config to the engine data store
			engineDataStore.set('config', config);

			//loop through the core modules
			modules.forEach(function(module, mI) {
				var moduleApi = {};
				var namespace = '';

				if(typeof module !== 'function') { throw new Error('Cannot execute module "' + coreModules[mI] + '" because it did not return a valid function on init.'); }

				//get the namespace
				namespace = typeof module.namespace !== 'string' && module.name || module.namespace;

				//execute the module
				if(namespace === '') {
					merge(api, module(api, engineDataStore));
				} else {
					moduleApi[namespace] = module(api, engineDataStore);
					merge(api, moduleApi);
				}

			});

			coreEmitter.trigger('ready');

		});
	}

	/**
	 * Creates a event emitter
	 * @param events
	 */
	function EventEmitter() {

		//vars
		var api = {
				"on": on,
				"trigger": trigger
			},
			callbacks = {};

		//return the api
		return api;

		/**
		 * Binds functions to events
		 * @param event
		 * @param callback
		 */
		function on(event, callback) {
			if(typeof event !== 'string') { throw new Error('Cannot bind to event emitter. The passed event is not a string.'); }
			if(typeof callback !== 'function') { throw new Error('Cannot bind to event emitter. The passed callback is not a function.'); }

			//return the api
			var api = {
					"clear": clear
				};

			//create the event namespace if it doesn't exist
			if(!callbacks[event]) { callbacks[event] = []; }

			//save the callback
			callbacks[event].push(callback);

			//return the api
			return api;

			function clear() {
				if(callbacks[event]) {
					var i = callbacks[event].indexOf(callback);
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
			if(typeof event !== 'string' && !Array.isArray(event)) { throw new Error('Cannot bind to event emitter. The passed event is not a string or an array.'); }

			//get the arguments
			var args = Array.prototype.slice.apply(arguments).splice(1);

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
	 * Creates a hook-able data storage class
	 */
	function DataStore() {

		//TODO Create tests

		var emitter = EventEmitter(),
			dataStore = {},
			api = {
				"set": setDataSet,
				"get": getDataSet,
				"clear": clearDataSet,
				"on": emitter.on,
				"dump": dump
			};

		//return the api
		return api;

		/**
		 * Saves data in a namespace
		 * @param namespace
		 * @param data
		 * @param strategy
		 */
		function setDataSet(namespace, data, strategy) {
			var result;

			//defaults
			strategy = strategy || 'replace';

			//validate
			if(typeof namespace !== 'string') { throw new Error('Cannot set data. The passed namespace is not a string.'); }
			if(typeof strategy !== 'string' && typeof strategy !== 'function') { throw new Error('Cannot set data. The passed strategy is not a string or a function.'); }
			if(typeof strategy !== 'function' && strategy !== 'replace' && strategy !== 'merge' && strategy !== 'extend') { throw new Error('Cannot set data. The passed strategy is unknown.'); }

			//rules
			if(typeof dataStore !== 'object') {
				strategy = 'replace';
			}

			//create the namespace if it doesn't exist
			if(typeof data === 'object' && !dataStore[namespace]) { dataStore[namespace] = {}; }

			//trigger the beforeSet event
			emitter.trigger('beforeSet', namespace, data);

			//save
			if(strategy === 'replace') {
				dataStore[namespace] = data;
			}
			else if(strategy === 'merge') {
				merge(dataStore[namespace], data);
			}
			else if(strategy === 'extend') {
				dataStore[namespace] = extend(dataStore[namespace], data);
			}
			else if(typeof strategy === 'function') {
				result = strategy(dataStore[namespace], data);

				if(result) { dataStore[namespace] = result; }
			}

			//trigger the afterSet and set event
			emitter.trigger(['afterSet', 'set'], namespace, dataStore[namespace]);

			//return the new namespace
			return dataStore[namespace];
		}

		/**
		 * Retrieves data from a namespace
		 * @param namespace
		 */
		function getDataSet(namespace) {
			var data = false;

			//validate
			if(typeof namespace !== 'string') { throw new Error('Cannot get data. The passed namespace is not a string.'); }

			//trigger the beforeGet event
			emitter.trigger('beforeGet', namespace, dataStore[namespace]);

			if(dataStore[namespace]) { data = dataStore[namespace]; }

			//trigger the afterGet and get event
			emitter.trigger('afterGet', 'get', namespace, data);

			return data;
		}

		/**
		 * Clears a namespace and its data
		 * @param namespace
		 */
		function clearDataSet(namespace) {
			var bool = false;

			//validate
			if(typeof namespace !== 'string') { throw new Error('Cannot get data. The passed namespace is not a string.'); }

			//trigger the beforeGet event
			emitter.trigger('beforeClear', namespace, dataStore[namespace]);

			//delete
			if(dataStore[namespace]) { delete dataStore[namespace]; bool = true; }

			//trigger the beforeGet event
			emitter.trigger('afterClear', namespace, bool);

			return bool;
		}

		/**
		 * Dumps the entire data store object for synchronization purposes
		 */
		function dump() {
			return dataStore;
		}
	}


	/**
	 * Creates an object containing all properties of passed objects.
	 * Note: Merges left to right.
	 */
	function extend(    ) {
		var objects = Array.prototype.slice.apply(arguments),
			base;

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
			var keys = Object.keys(object);

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
		var objects = Array.prototype.slice.apply(arguments);
		var base = objects.shift();

		//make sure the objects are all objects or arrays
		if(!objects.every(function(object) { return typeof object === 'object'})) { throw new Error('extend() only accepts object and array types.'); }

		//merge each object or array into the base
		objects.forEach(function(object) {
			var keys = Object.keys(object);

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