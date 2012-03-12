(function(context, factory) {

	if(typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		context.RedLocomotive = factory();
	}

})(this, function () {

	//return RedLocomotive
	return RedLocomotive;

	function RedLocomotive(config) {
		var coreModules, emitter, api, returned;

		//Validate
		if(typeof require === 'undefined') { throw new Error('Cannot initialize Red Locomotive. RequireJS is required.'); }
		if(config && typeof config !== 'object') { throw new Error('Cannot initialize Red Locomotive. If given, the config must be an object.'); }

		emitter = EventEmitter();
		returned = false;
		api = {
			"on": emitter.on
		};
		coreModules = [
			'pollyFills',
			'core',
			//'audio',
			//'viewports',
			//'bitmaps',
			//'sprites',
			'elements'
			//'animations',
			//'paths',
			//'collisions'
		];

		//config
		config = extend({
			"baseUrl": "",
			"fps": 60
		}, config || {});

		//require config
		require.config({
			"baseUrl": config.baseUrl + 'red-locomotive/'
		});

		//Load & Exec
		require(coreModules, function(    ) {
			var modules, engineData, mI, module, moduleApi, namespace;

			//get the modules
			modules = Array.prototype.slice.apply(arguments),

			//create the vars
			engineData = {
				"config": config,
				"elements": [],
				"viewports": [],
				"emitter": emitter
			};
			merge(api, {
				"extend": extend,
				"clone": clone,
				"compare": compare,
				"merge": merge,
				"reduce": reduce,
				"mirror": mirror,
				"watch": watch,
				"funnel": Funnel,
				"emitter": EventEmitter,
				"distance": distance,
				"degree": degree,
				"vector": vector,
				"coordinates": coordinates,
				"tan": tan,
				"sin": sin,
				"cos": cos,
				"atan": atan,
				"asin": asin,
				"acos": acos
			});

			//execute the callback passing it the engine's api and fire the loaded event
			emitter.set('init', api);

			//loop through the core modules
			for(mI = 0; mI < modules.length; mI += 1) {
				module = modules[mI];
				moduleApi = {};
				namespace = '';

				//validate module
				if (typeof module !== 'function') {
					throw new Error('Cannot initialize Red Locomotive. Tried to load an invalid module. Modules must be functions.');
				}

				//get the module namespace
				namespace = typeof module.namespace !== 'string' && module.name || module.namespace;

				//execute the module
				moduleApi = module(api, engineData);

				//validate the module api
				if (moduleApi && typeof moduleApi !== 'object') {
					throw new Error('Cannot initialize Red Locomotive. Encountered a broken module that failed to return a valid api object. If modules return an api, the api must be an object.');
				}

				//merge its api into the engine api
				if (moduleApi && namespace !== '') {

					//add the module api to its namespace
					api[namespace] = moduleApi;
				} else if(moduleApi) {

					//add the module api to root
					merge(api, moduleApi);
				}

			}

			//signal ready next tick
			emitter.set('ready', api);
		});

		returned = true;
		return api;
	}

	///////////////////////////////////
	//    OBJECT MODIFIER METHODS    //
	//////////////////////////////////

	/**
	 * Merges any number of passed objects into a single object.
	 * If any objects passed are arrays the merged object will be
	 * an array too.
	 */
	function extend(    ) {
		var args, merged, aI, object, key;

		//grab the args
		args = Array.prototype.slice.call(arguments);

		//look for arrays
		merged = {};
		for(aI = 0; aI < args.length; aI += 1) {
			object = args[aI];

			//throw an error if an item is an invalid type
			if(typeof object !== 'object') { throw new Error('Cannot extend objects. All arguments must be objects.'); }

			//if we find an array then the merged object will be an array
			if(typeof object.push === 'function') {
				merged = [];
				break;
			}
		}

		//add the data to the merged object
		for(aI = 0; aI < args.length; aI += 1) {
			object = args[aI];

			if(typeof object !== 'object') { continue; }

			//loop through the object's properties
			for(key in object) {

				//the property must not be from a prototype
				if(!object.hasOwnProperty(key)) { continue; }

				//copy the property
				if(typeof object[key] === 'object' && typeof merged[key] === 'object') {
					merged[key] = extend(merged[key], object[key]);
				} else if(typeof object[key] === 'object') {
					merged[key] = clone(object[key]);
				} else if(typeof merged.push === 'function') {
					merged.push(object[key]);
				} else {
					merged[key] = object[key];
				}
			}
		}

		return merged;
	}

	/**
	 * Clones an object
	 * @param object
	 */
	function clone(object) {
		var cloned;
		if(typeof object !== 'object') { return false; }

		//create the empty clone
		cloned = typeof object.push === 'function' && [] || {};

		//loop through the object's properties
		for(var key in object) {

			//the property must not be from a prototype
			if(!object.hasOwnProperty(key)) { continue; }

			//clone sub objects
			if(typeof object[key] === 'object') {
				cloned[key] = clone(object[key]);
			} else {
				cloned[key] = object[key];
			}
		}

		return cloned;
	}

	/**
	 * Compares to variables or objects and returns true if they are the same. if they are not it will return false
	 * @param a
	 * @param b
	 */
	function compare(a, b) {
		var equivalent, key;

		//assume a and b match
		equivalent = true;

		//compare objects
		if(typeof a === 'object' && typeof b === 'object')  {

			//check for additions or modifications
			for(key in a) {
				if(!a.hasOwnProperty(key)) { continue; }
				if(!compare(a[key], b[key])) {
					equivalent = false;
				}
			}

			//check for deletions
			for(key in b) {
				if(!b.hasOwnProperty(key)) { continue; }
				if(!compare(a[key], b[key])) {
					equivalent = false;
				}
			}
		}

		//compare values
		else if(typeof a === typeof b && typeof a !== 'object' && typeof a !== 'function') {
			return a === b;
		}

		//return false on unknown
		else {
			return false;
		}

		return equivalent;
	}

	/**
	 * Takes a subject object and merges the secondary object into it.
	 */
	function merge(    ) {
		var objects, merged, oI, object, key;

		//get an array of arguments
		objects = Array.prototype.slice.apply(arguments);

		//shift off the target object
		merged = objects.shift();

		//loop through the objects and merge each into the target
		for(oI = 0; oI < objects.length; oI += 1) {
			object = objects[oI];

			//validate
			if(typeof object !== 'object') { throw new Error('Cannot merge objects. All arguments must be objects.'); }

			for(key in object) {
				//the property must not be from a prototype
				if(!object.hasOwnProperty(key)) { continue; }

				//copy the property
				if(typeof object[key] === 'object' && typeof merged[key] === 'object') {
					merge(merged[key], object[key]);
				} else if(typeof object[key] === 'object') {
					merged[key] = clone(object[key]);
				} else if(typeof merged.push === 'function') {
					merged.push(object[key]);
				} else {
					merged[key] = object[key];
				}
			}
		}

	}

	/**
	 * Trims the subject object down so it only contains the properties of the model object
	 * @param subjectObject
	 * @param modelObject
	 */
	function reduce(subjectObject, modelObject) {
		var sI, key;

		if(typeof subjectObject !== 'object' || typeof modelObject !== 'object') {
			throw new Error("UnityJS: While trying to reduce an object I realized that the application passed me a non object. Both the subject object and the model object must be real objects for me to preform a reduce.");
		}

		//if the subject is an array
		if(typeof subjectObject.push === 'function') {
			for(sI = 0; sI < subjectObject.length; sI += 1) {

				if(typeof subjectObject[sI] === 'object' && typeof modelObject[sI] === 'object') {
					reduce(subjectObject[sI], modelObject[sI]);
				} else {
					//check to see if the model has the same value
					modelObject.indexOf(subjectObject[sI]);
					if(modelObject.indexOf(subjectObject[sI]) < 0) {
						subjectObject.splice(sI, 1);
						sI -= 1;
					}
				}
			}
		} else {
			//loop through the model
			for(key in subjectObject) {
				if(!subjectObject.hasOwnProperty(key)) { continue; }

				if(typeof subjectObject[key] === 'object' && typeof modelObject[key] === 'object') {
					reduce(subjectObject[key], modelObject[key]);
				} else {

					//check to see if the model has the same value
					if(modelObject[key] !== subjectObject[key]) {
						delete subjectObject[key];
					}
				}
			}
		}
	}

	/**
	 * Takes a model object and a mirror that will assume the models structure and values. This method is similar
	 * to clone accept it mutates the mirror object to resemble the model instead of producing a replacement.
	 * @param subjectObject
	 * @param modelObject
	 */
	function mirror(subjectObject, modelObject) {

		//merge the model into the subject
		merge(subjectObject, modelObject);

		//delete properties from the subject the model does not have
		reduce(subjectObject, modelObject);
	}


	/**
	 * Watches a data structure and fires a callback when it changes
	 * @param data
	 */
	function watch(data) {
		var mirrorObj, emitter, api, running;

		if(!typeof onChange === 'function') { throw new Error('UnityJS: I tried to watch a data object for changes but the application gave me a invalid function as a handler.'); }

		//TODO use proxies once implemented

		emitter = EventEmitter();
		running = true;
		api = {
			"on": emitter.on,
			"clear": clear
		};

		//create the mirror object and populate it with data
		mirrorObj = {};
		mirror(mirrorObj, data);

		//register a function to compare the object to its last state every cycle
		(function exec(){
			if(!running) { return; }

			//if the mirror doesn't match the data object then mirror it again and fire draw
			if(!compare(mirrorObj, data)) {
				mirror(mirrorObj, data);
				emitter.trigger('update', data);
			}

			//self invoke
			setTimeout(exec, 0);
		})();

		return api;

		function clear() {
			running = false;
		}
	}

	////////////////////////
	//    FLOW CONTROL    //
	////////////////////////

	/**
	 * Creates an execution counter object
	 */
	function Funnel() {
		var funnelData, funnelCallbacks, executionsToGo, totalExections, deployedCatchers;

		//set the instance data
		funnelData = [];
		funnelCallbacks = [];
		executionsToGo = 0;
		totalExections = 0;
		deployedCatchers = 0;

		//return the funnel
		return funnel;

		/**
		 * Set the callback and iterates the expected executing callbacks. This is the funnel instance.
		 * @param arg1
		 */
		function funnel(arg1, arg2) {
			var catcherKey, expectedCatcherExecutions, catcherExecutions;

			expectedCatcherExecutions = 1;
			catcherExecutions = 0;

			if(typeof arg1 === 'string' || typeof arg1 === 'number' || typeof arg1 === 'undefined') {

				if(typeof arg1 === 'string') {
					//if the callback is actually a string then assume it is a catcherKey
					catcherKey = arg1;

					if(typeof arg2 === 'number') {
						expectedCatcherExecutions = arg2;
					}
				} else if(typeof arg1 === 'number') {
					expectedCatcherExecutions = arg1;
				}

				//iterate the expected and deployed catchers iterations
				executionsToGo += expectedCatcherExecutions;
				deployedCatchers += 1;

				return execCatcher;

			} else if(typeof arg1 === 'function') {

				//make sure at least one execution catcher was passed
				if(deployedCatchers > 0) {

					//save the callback as a funnel callback
					funnelCallbacks.push(arg1);
				} else {
					throw new Error('Cannot execute funnel, no entry point. Funnel callback was passed before any execution catchers were deployed.')
				}
			}

			return true;

			/**
			 * Creates an execution catcher
			 */
			function execCatcher(    ) {
				var args;

				catcherExecutions += 1;
				totalExections += 1;

				if(executionsToGo >= 0) {
					args = Array.prototype.slice.apply(arguments);

					if(catcherKey) {
						funnelData[catcherKey] = args;
					} else {
						funnelData.push(args);
					}

					executionsToGo -= 1;

					if(executionsToGo === 0) {
						exec(null, funnelData);
					}

				} else {
					exec(new Error('Funnel overrun. Execution catcher was expecting "' + expectedCatcherExecutions + '" executions. Executed "' + catcherExecutions + '" times so far.'));
				}

				function exec(    ) {
					var args, i;

					args = Array.prototype.slice.apply(arguments);

					if(funnelCallbacks.length < 1) {
						setTimeout(exec, 0);
					} else {
						for(i = 0; i < funnelCallbacks.length; i += 1) {
							funnelCallbacks[i].apply(this, args);
						}
					}
				}
			}
		}
	}

	/**
	 * Creates a event emitter
	 */
	function EventEmitter() {
		var api, callbacks, pipedEmitters, setCallbacks;

		//vars
		api = {
			"on": on,
			"trigger": trigger,
			"set": set,
			"pipe": pipe
		};
		callbacks = {};
		pipedEmitters = [];
		setCallbacks = [];

		//return the api
		return api;

		/**
		 * Binds functions to events
		 * @param event
		 * @param callback
		 */
		function on(event, callback) {
			var api, pEI, sEI;

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

			//bind to piped emitters
			for(pEI = 0; pEI < pipedEmitters.length; pEI += 1) {
				pipedEmitters[pEI].add(event);
			}

			//trigger set events
			for(event in setCallbacks) {
				if(!setCallbacks.hasOwnProperty(event)) { continue; }

				//execute each argument set
				for(sEI = 0; sEI < setCallbacks[event].length; sEI += 1) {
					(function(event, sEI){
						//trigger the set event
						setTimeout(function() {
							trigger.apply(this, setCallbacks[event][sEI]);
						});
					})(event, sEI);
				}
			}

			//return the api
			return api;

			/**
			 * Unbinds the handler
			 */
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
			var args, cI, eI, blockEventBubble;

			//validate the event
			if(typeof event !== 'string' && !Array.isArray(event)) { throw new Error('Cannot trigger event. The passed event is not a string or an array.'); }

			//get the arguments
			args = Array.prototype.slice.apply(arguments).splice(1);

			//handle event arrays
			if(typeof event === 'object' && typeof event.push === 'function') {

				//for each event in the event array self invoke passing the arguments array
				for(eI = 0; eI < event.length; eI += 1) {

					//add the event name to the begining of the arguments array
					args.unshift(event[eI]);

					//trigger the event
					if(trigger.apply(this, args) === false) {
						blockEventBubble = true;
					}

					//shift off the event name
					args.shift();
				}

				return !blockEventBubble;
			}

			//if the event has callbacks then execute them
			if(callbacks[event]) {

				//fire the callbacks
				for(cI = 0; cI < callbacks[event].length; cI += 1) {
					if(callbacks[event][cI].apply(this, args) === false) {
						blockEventBubble = true;
					}
				}
			}

			return !blockEventBubble;
		}

		function set(event    ) {
			var args;

			//validate
			if(typeof event !== 'string') { throw new Error('Cannot set event. the event must be a string.')}

			//get the arguments
			args = Array.prototype.slice.apply(arguments);

			//trigger the event
			trigger.apply(this, args);

			//trigger all future binds
			if(!setCallbacks[event]) { setCallbacks[event] = []; }
			setCallbacks[event].push(args);
		}

		/**
		 * Pipes in the events from another emitter including DOM objects
		 * @param emitter
		 */
		function pipe(emitter) {
			var pipe, pipeBindings, event, eI, pipedEmitter, pipedEvents;

			//validate the element
			if(!emitter || typeof emitter !== 'object' || typeof emitter.on !== 'function' && typeof emitter.addEventListener !== 'function' && typeof emitter.attachEvent !== 'function') {
				throw new Error('Cannot pipe events. A vaild DOM object must be provided.');
			}

			pipeBindings = [];
			pipedEvents = [];

			//check to make sure were not pipeing the same emitter twice
			for(eI = 0; eI < pipedEmitters.length; eI += 1) {
				pipedEmitter = pipedEmitters[eI];

				if(pipedEmitter.emitter === emitter) {
					return true;
				}
			}

			//create the pipe
			pipe = {
				"emitter": emitter,
				"add": addEventToPipe
			};

			//add the emitter to the piped array
			pipedEmitters.push(pipe);

			//bind existing events
			for(event in callbacks) {
				if(!callbacks.hasOwnProperty(event)) { continue; }
				addEventToPipe(event);
			}

			return {
				"clear": clear
			};

			/**
			 * Takes an event type and binds to that event (if possible) on the piped emitter
			 * If the event fires it will be piped to this emitter.
			 * @param event
			 */
			function addEventToPipe(event) {
				var pipeBinding = {};

				//check to make sure the event has not been added
				if(pipedEvents.indexOf(event) >= 0) { return; }

				try {
					if(emitter.on) {
						pipeBinding = emitter.on(event, handler);

						//fix for jquery
						if(emitter.jquery && emitter.off) {
							pipeBinding.clear = function() {
								emitter.off(event, handler);
							};
						}
					} else if(emitter.addEventListener) {
						emitter.addEventListener(event, handler, true);

						pipeBinding.clear = function() {
							emitter.removeEventListener(event, handler, true);
						};
					} else if(emitter.attachEvent){
						emitter.attachEvent('on' + event, handler);

						pipeBinding.clear = function() {
							emitter.detachEvent('on' + event, handler);
						};
					}
				} catch(e) {}

				pipeBindings.push(pipeBinding);
				pipedEvents.push(event);

				/**
				 * A universal hander to capure an event and relay it to the emitter
				 */
				function handler(    ) {
					var args;

					args = Array.prototype.slice.call(arguments);
					args.unshift(event);

					return trigger.apply(this, args);
				}
			}

			/**
			 * Clears the pipe so the emitter is no longer captured
			 */
			function clear() {
				pipedEmitters.splice(pipedEmitters.indexOf(emitter), 1);

				pipeBindings.forEach(function(pipeBinding) {
					pipeBinding.clear();
				});
			}
		}
	}

	///////////////////////////////
	//    MATHIMATICS METHODS    //
	///////////////////////////////


	/**
	 * Returns the distance from zero zero to any given x and y
	 * @param x
	 * @param y
	 */
	function distance(x, y) {
		x = x < 0 ? -x : x;
		y = y < 0 ? -y : y;

		//use pythagoras theorem to find the distance.
		return Math.sqrt(Math.pow(y, 2) + Math.pow(x, 2));
	}

	/**
	 * Returns the mathematical quadrant as well as the opposite
	 * and adjacent side of right angle triangle
	 * @param x
	 * @param y
	 */
	function quad(x, y) {
		if(x > -1) {
			if(y < 0) {
				//q0
				return {
					'q': 0,
					'o': x,
					'a': -y
				}
			}
			else{
				//q1
				return {
					'q': 1,
					'o': y,
					'a': x
				}
			}
		} else {
			if(y > -1) {
				//q2
				return {
					'q': 2,
					'o': -x,
					'a': y
				}
			}
			else{
				//q3
				return {
					'q': 3,
					'o': y,
					'a': -x
				}
			}
		}
	}

	/**
	 * Returns x and y coordinates calculated from a degree,
	 * and the opposite and adjacent side of right angle
	 * triangle
	 * @param degree
	 * @param o
	 * @param a
	 */
	function aquad(q, o, a) {
		if(q === 0) {
			return {
				'x': o,
				'y': -a
			}
		} else if (q === 1) {
			return {
				'x': a,
				'y': o
			}
		} else if (q === 2) {
			return {
				'x': -o,
				'y': a
			}
		} else if(q === 3) {
			return {
				'x': -a,
				'y': -o
			}
		}
	}

	/**
	 * Returns the degree of a right angle triangle along its
	 * hypotenuse extending from zero zero.
	 * @param a
	 * @param b
	 */
	function degree90(a, b) {
		//rectify a and b
		a = a < 0 ? -a : a;
		b = b < 0 ? -b : b;
		return atan(a / b);
	}

	/**
	 * Returns degree of an x and y offset.
	 * @param x
	 * @param y
	 */
	function degree(x, y) {
		var t;
		t = quad(x, y);
		return degree90(t.o, t.a) + (90 * t.q);

	}

	/**
	 * Returns an object with both the degree and distance from zero zero
	 * @param x
	 * @param y
	 */
	function vector(x, y) {
		return {
			"degree": degree(x, y),
			"distance": distance(x, y)
		};
	}

	/**
	 * Returns the end coordinates of a vector starting at 0, 0.
	 * @param degree
	 * @param distance
	 */
	function coordinates(degree, distance) {
		var degree90, o, a, q;

		//if the distance is less than one whole pixel then return 0 x 0 y;
		if(distance < 1) { return {'x': 0, 'y': 0} }

		degree90 = degree % 90;
		q = Math.floor(degree / 90);

		//get the opposite and adjacent
		o = Math.round(sin(degree90) * distance);
		a = Math.round(cos(degree90) * distance);

		//inverse quadrify
		return aquad(q, o, a);
	}

	function tan(input) {
		if (!tanMap[input]) {
			tanMap[input] = Math.tan(input * Math.PI / 180);
		}
		return tanMap[input];
	}

	function sin(input) {
		if (!sinMap[input]) {
			sinMap[input] = Math.sin(input * Math.PI / 180);
		}
		return sinMap[input];
	}

	function cos(input) {
		if (!cosMap[input]) {
			cosMap[input] = Math.cos(input * Math.PI / 180);
		}
		return cosMap[input];
	}

	function atan(input) {
		if (!atanMap[input]) {
			atanMap[input] = Math.atan(input) / Math.PI * 180;
		}
		return atanMap[input];
	}

	function asin(input) {
		if (!asinMap[input]) {
			asinMap[input] = Math.asin(input) / Math.PI * 180;
		}
		return asinMap[input];
	}

	function acos(input) {
		if (!acosMap[input]) {
			acosMap[input] = Math.acos(input) / Math.PI * 180;
		}
		return acosMap[input];
	}
});
