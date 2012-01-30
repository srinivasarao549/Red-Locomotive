define(function(engine, data, config) {

	//set the namespace to the root
	init.namespace = '';

	//return the core
	return init;

	/**
	 * Initialises the core module
	 * @param engine
	 */
	function init(engine) {

		var api = {
			"event": {
				"loop": EventLoop
			},
			"every": every,
			"after": after
		};

		//set the fpms
		var fpms = Math.round(1000 / config.fps);

		//create the core loop
		data.coreLoop = EventLoop(fpms);

		//run the loop once all the modules have loaded
		engine.on('ready', data.coreLoop.start);

		//bind the core loop events to the core emitter
		data.coreLoop.on('cycle', function(     ) {
			var args = Array.prototype.slice.apply(arguments);
			args.unshift('cycle');

			engine.trigger.apply(this, args);
		});
		data.coreLoop.on('every', function(    ) {
			var args = Array.prototype.slice.apply(arguments);
			args.unshift('every');

			engine.trigger.apply(this, args);
		});

		//return the api
		return api;

		/**
		 * Creates an event loop
		 * @param interval
		 */
		function EventLoop(interval) {

			//set defaults
			interval = interval || 1;

			//validate arguments
			if(typeof interval !== 'number') { throw new Error('Event loop interval must be a number.'); }

			var emitter = engine.event.emitter(),
				active = false,
				lastTime = false,
				scheduledCycles = 0,

				api = {
					"on": emitter.on,
					"start": start,
					"stop": stop,
					"setInterval": setInterval
				};

			//execute the loop
			loop(Date.now());

			return api;

			/**
			 * Self executing event loop runtime (only execute once)
			 * @param time
			 */
			function loop(time) {
				if(active) {

					//on first cycle set the last cycle time to the current cycle time
					if(!lastTime) { lastTime = time; }

					//add additional scheduled cycles if the expected frames is below ten
					if (scheduledCycles < 10) {
						scheduledCycles += (time - lastTime) / interval;
					}

					//get the number of expected cycles
					var batchedCycles = Math.floor(scheduledCycles);

					//if there are cycles to be executed
					if(batchedCycles > 0) {

						//emit the "single" event for each expected cycle
						for(var i = 0; i < batchedCycles; i += 1) {
							emitter.trigger('every', time, batchedCycles);
						}

						//remove the batched cycles from the scheduled cycles
						scheduledCycles -= batchedCycles;

						//emit the "batch" event
						emitter.trigger('cycle', time, batchedCycles);
					}
				}

				//save the last cycle time
				lastTime = time;

				//schedule the next cycle
				requestAnimationFrame(loop);

			}

			/**
			 * Start the loop
			 */
			function start() {
				active = true;
			}

			/**
			 * Stop the loop
			 */
			function stop() {
				active = false;
			}

			/**
			 * Set the loop interval
			 * @param _interval
			 */
			function setInterval(_interval) {
				if(typeof _interval !== 'number') { throw new Error('Event loop interval must be a number.'); }
				interval = _interval;
			}
		}

		/**
		 * Executes a callback every frame
		 */
		function every(callback, interval) {

			interval = interval || 1;

			if(typeof callback !== 'function') { throw new Error('Callback must be a function.'); }
			if(typeof interval !== 'number') { throw new Error('every interval must be a number.'); }

			var i = 0,
				bind,
				api;

			bind = engine.on('every', function(    ) {
				var args = Array.prototype.slice.apply(arguments);

				if(i < interval) {
					i += 1;
				} else {
					callback.apply(this, args);
					i = 0;
				}
			});

			api = {
				"clear": bind.clear,
				"setInterval": setInterval
			};

			return api;

			/**
			 * changes the interval for the callback execution
			 * @param _interval
			 */
			function setInterval(_interval) {
				interval = _interval;
			}

		}

		/**
		 * Fires a callback after a given number of core loop cycles
		 */
		function after(callback, timeout) {

			timeout = timeout || 1;

			if(typeof callback !== 'function') { throw new Error('Callback must be a function.'); }
			if(typeof timeout !== 'number') { throw new Error('after timeout must be a number.'); }

			var i = 0,
				bind,
				api;

			bind = engine.on('every', function(    ) {
				var args = Array.prototype.slice.apply(arguments);

				if(i < timeout) {
					i += 1;
				} else {
					callback.apply(this, args);
					bind.clear();
				}
			});

			api = {
				"clear": bind.clear,
				"setTimeout": setTimeout
			};

			return api;

			/**
			 * changes the timeout for the callback execution
			 * @param _timeout
			 */
			function setTimeout(_timeout) {
				if(typeof _timeout !== 'number') { throw new Error('after timeout must be a number.'); }
				timeout = _timeout;
			}
		}
	}
});