(function() {
	var testConfig, engine;
	
	testConfig = {
		"baseUrl": "../",
		"fps": 1
	};

	module('RedLocomotive');

	test("", function() {
		var engine;

		engine = RedLocomotive(testConfig);

		ok(engine, "RedLocomotive() should return an engine object.");
		equal(typeof engine.on, 'function', "The engine object should have an .on() method.");

		stop();
		engine.on('ready', function() {
			start();

			ok(true, 'The engine object should emit a ready event once all modules have loaded.');
		});
	});

	module('engine');
	
	window.e = engine = RedLocomotive(testConfig);

	stop();
	engine.on('ready', function() {
		start();

		test('.extend', function() {
			var object1, object2, extendedObject;
	
			equal(typeof engine.extend, 'function', 'engine.extend should be defined.');

			object1 = {
				"cake": "is a lie",
				"colors": [
					"red"
				],
				"crew": {
					"admiral": "anderson"
				}
			};

			object2 = {
				"cake": "is a lie",
				"colors": [
					"blue",
					"yellow"
				],
				"crew": {
					"commander": "shepard",
					"lutenant": "williams"
				}
			};

			extendedObject = engine.extend(object1, object2);

			equal(typeof extendedObject, 'object', 'Correct data on extended object.');

			equal(extendedObject.cake, 'is a lie', 'Correct data on extended object.');
			equal(extendedObject.colors[0], 'red', 'Correct data on extended object.');
			equal(extendedObject.colors[1], 'blue', 'Correct data on extended object.');
			equal(extendedObject.colors[2], 'yellow', 'Correct data on extended object.');
			equal(extendedObject.crew.admiral, 'anderson', 'Correct data on extended object.');
			equal(extendedObject.crew.commander, 'shepard', 'Correct data on extended object.');
			equal(extendedObject.crew.lutenant, 'williams', 'Correct data on extended object.');
		});
	
		test('.clone', function() {
			var clone, object;
	
			engine = RedLocomotive(testConfig);
	
			equal(typeof engine.clone, 'function', 'engine.clone should be defined.');

			object = {
				"cake": "is a lie",
				"colors": [
					"red",
					"blue",
					"yellow"
				],
				"crew": {
					"admiral": "anderson",
					"commander": "shepard",
					"lutenant": "williams"
				}
			};

			clone = engine.clone(object);

			equal(clone.cake, 'is a lie', 'Correct data on clone object.');
			equal(clone.colors[0], 'red', 'Correct data on clone object.');
			equal(clone.colors[1], 'blue', 'Correct data on clone object.');
			equal(clone.colors[2], 'yellow', 'Correct data on clone object.');
			equal(clone.crew.admiral, 'anderson', 'Correct data on clone object.');
			equal(clone.crew.commander, 'shepard', 'Correct data on clone object.');
			equal(clone.crew.lutenant, 'williams', 'Correct data on clone object.');

			notEqual(clone, object, 'The cloned object should not be a reference to the original object');
		});
	
		test('.compare', function() {
			var object1, object2, object3;
			
			equal(typeof engine.compare, 'function', 'engine.compare should be defined.');

			object1 = object2 = {
				"cake": "is a lie",
				"colors": [
					"red",
					"blue",
					"yellow"
				],
				"crew": {
					"admiral": "anderson",
					"commander": "shepard",
					"lutenant": "williams"
				}
			};
			object3 = {
				"key": "value"
			};

			ok(engine.compare(object1, object2), 'Compare should return true when two different objects with the same keys and values are passed in to it.');
			ok(!engine.compare(object1, object3), 'Compare should return false when two different objects with the different keys and values are passed in to it.');
		});
	
	
		test('.merge', function() {
			var object1, object2;
	
			equal(typeof engine.merge, 'function', 'engine.merge should be defined.');

			object1 = {
				"cake": "is a lie",
				"colors": [
					"red"
				],
				"crew": {
					"admiral": "anderson"
				}
			};

			object2 = {
				"cake": "is a lie",
				"colors": [
					"blue",
					"yellow"
				],
				"crew": {
					"commander": "shepard",
					"lutenant": "williams"
				}
			};

			engine.merge(object1, object2);

			equal(object1.cake, 'is a lie');
			equal(object1.colors[0], 'red');
			equal(object1.colors[1], 'blue');
			equal(object1.colors[2], 'yellow');
			equal(object1.crew.admiral, 'anderson');
			equal(object1.crew.commander, 'shepard');
			equal(object1.crew.lutenant, 'williams');
		});
	
		test('.reduce', function() {
			var object1, object2;
	
			equal(typeof engine.reduce, 'function', 'engine.reduce should be defined.');

			object1 = {
				"cake": "is a lie",
				"colors": [
					"red",
					"blue",
					"yellow"
				],
				"crew": {
					"admiral": "anderson",
					"commander": "shepard",
					"lutenant": "williams"
				}
			};

			object2 = {
				"cake": "is a lie",
				"colors": [
					"blue"
				],
				"crew": {
					"admiral": "anderson"
				}
			};

			engine.reduce(object1, object2);

			equal(object1.cake, 'is a lie');
			equal(object1.colors[0], 'blue');
			equal(object1.colors[1], undefined);
			equal(object1.colors[2], undefined);
			equal(object1.crew.admiral, 'anderson');
			equal(object1.crew.commander, undefined);
			equal(object1.crew.lutenant, undefined);
		});
	
		test('.mirror', function() {
			var object1, object2;
	
			equal(typeof engine.mirror, 'function', 'engine.mirror should be defined.');
	
			object1 = {
				"cake": "is a lie",
				"colors": [
					"blue",
					"yellow"
				],
				"crew": {
					"commander": "shepard",
					"lutenant": "williams"
				}
			};

			object2 = {
				"cake": "is a lie",
				"colors": [
					"red"
				],
				"crew": {
					"admiral": "anderson"
				}
			};

			engine.mirror(object1, object2);

			equal(object1.cake, 'is a lie');
			equal(object1.colors[0], 'red');
			equal(object1.colors[1], undefined);
			equal(object1.colors[2], undefined);
			equal(object1.crew.admiral, 'anderson');
			equal(object1.crew.commander, undefined);
			equal(object1.crew.lutenant, undefined);
		});
	
		test('.watch', function() {
			var object, watcher, test;
	
			equal(typeof engine.watch, 'function', 'engine.watch should be defined.');

			object = {
				"cake": "is a lie",
				"colors": [
					"red",
					"blue",
					"yellow"
				],
				"crew": {
					"admiral": "anderson",
					"commander": "shepard",
					"lutenant": "williams"
				}
			};
			test = false;

			watcher = engine.watch(object);

			equal(typeof watcher, 'object', 'engine.watch should return a watcher object.');
			equal(typeof watcher.on, 'function', 'watcher.on should be defined.');
			equal(typeof watcher.clear, 'function', 'watcher.clear should be defined.');

			watcher.on('update', function() {
				start();
				ok(true, 'The watcher object should emitt a update event when the watched object is modified.');
				watcher.clear();
			});

			object.cake = '';
		});
	
		test('.funnel', function() {
			var funnel;
	
			equal(typeof engine.funnel, 'function', 'engine.funnel should be defined.');
	
			funnel = engine.funnel();
	
			equal(typeof funnel, 'function', 'engine.funnel should return a funnel function.');
	
			equal(typeof funnel(), 'function', 'The funnel function should return a catcher function.');
	
			funnel(function() {
				ok(true, 'The funnel should take a callback and fire it once all of the deployed catchers are executed.');
			});
		});
	
		test('.emitter', function() {
			var emitter, emitter1, emitter2, emitter3, DOMnode, test1, test2, test3;
	
			equal(typeof engine.emitter, 'function', 'engine.emitter should be defined.');
	
			emitter = engine.emitter();
	
			equal(typeof emitter.on, 'function', 'emitter.on should be a function.');
			equal(typeof emitter.trigger, 'function', 'emitter.trigger should be a function.');
			equal(typeof emitter.pipe, 'function', 'emitter.pipe should be a function.');
	
			raises(function() {
				emitter.on();
			}, 'Executing on with no arguments should throw an error.');
	
			raises(function() {
				emitter.trigger();
			}, 'Executing trigger with no arguments should throw an error.');
	
			emitter.on('testEvent1', function() {
				test1 = true;
			});
	
			emitter.trigger('testEvent1');
	
			ok(test1 === true, 'on method should catch triggered events.');
	
			emitter.on('testEvent2', function() {
				test2 = true;
			}).clear();
	
			ok(test2 !== true, 'Calling the clear method returned by on should unbind the callback.');
	
			emitter.set('testEvent3');
	
			emitter.on('testEvent3', function() {
				test3 = true;
			});
	
			ok(test3 === true, 'on method should catch set events even if the handler is set after the event is set.');
	
			DOMnode = document.createElement('div');
	
			raises(function() {
				emitter1.pipe();
			}, 'Executing pipe with no arguments should throw an error.');
	
	
			emitter1 = engine.emitter();
			emitter2 = engine.emitter();
			emitter1.pipe(emitter2);
			emitter1.on('testEvent1', function() {
				test1 = true;
			});
			emitter2.trigger('testEvent1');
	
			ok(test1 === true, 'Events triggered on emitter2 should be piped to emtter1.');
	
	
			emitter1.on('testEvent2', function() {
				test2 = true;
			});
			emitter1.pipe(DOMnode);
			trigger('testEvent2', DOMnode);
	
			ok(test2 === true, 'Events triggered on the DOM node should be piped to emtter1.');
	
			test3 = false;
			emitter3 = engine.emitter();
			emitter1.on('testEvent3', function() {
				test3 = true;
			});
			emitter1.pipe(emitter3).clear();
			emitter3.trigger('testEvent3');
	
			ok(test3 !== true, 'Calling the clear method returned by pipe should unbind the event pipe.');
	
			//event triggering pollyfill
			function trigger(eventName, element) {var a;if(document.createEvent){a=document.createEvent("HTMLEvents");a.initEvent(eventName,true,true);}else{if(element===window){element=document.body;}a=document.createEventObject();a.eventType='on'+eventName;}if(element.dispatchEvent){element.dispatchEvent(a);}else{element.fireEvent(a.eventType,a);}}
		});

		test('.distance', function() {
			var distance;

			equal(typeof engine.distance, 'function', 'engine.distance should be defined.');

			distance = engine.distance(25, 25);

			equal(distance, 35.35533905932738);

		});
	});
})();