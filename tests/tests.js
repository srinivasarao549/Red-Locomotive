require(['../red-locomotive/red-locomotive'], function(RedLocomotive) {

	RedLocomotive({
		"baseUrl": "../"
	}, function(engine) {

		module('Kernel (red-locomotive)');

		test("Engine instance", 3, function() {

			ok(engine, "RedLocomotive()'s callback should be passed an engine instance object.");
			equals(typeof engine.on, 'function', "Engine should have an .on() method for binding to engine events.");
			equals(typeof engine.trigger, 'function', "Engine should have an .trigger() method for triggering new engine events.");
		});

		test("extend", 12, function() {
			var object1, object2, result;

			object1 = {
				"armOne": {
					"one": "blue",
					"two": "green",
					"five": {
						"cake": "is a lie"
					}
				},
				"secondary": {}
			};

			object2 = {
				"armOne": {
					"five": [1, 2, 3, 4, 5]
				},
				"armTwo": {
					"one": 1
				},
				"secondary": "49th and Second St."
			};

			equals(typeof engine.extend, 'function', "Engine should have an .extend() method for creating merged objects.");

			result = engine.extend(object1, object2);

			equals(result.armOne.one, "blue", "result.armOne.one.");
			equals(result.armOne.two, "green", "result.armOne.two.");
			equals(result.armOne.five[0], 1, "result.armOne.five[0].");
			equals(result.armOne.five[1], 2, "result.armOne.five[1].");
			equals(result.armOne.five[2], 3, "result.armOne.five[2].");
			equals(result.armOne.five[3], 4, "result.armOne.five[3].");
			equals(result.armOne.five[4], 5, "result.armOne.five[4].");
			equals(result.armOne.five.cake, "is a lie", "result.armOne.five.cake.");
			equals(result.armOne.five.length, 5, "result.armOne.five.length.");
			equals(result.armTwo.one, 1, "result.armTwo.one.");
			equals(result.secondary, "49th and Second St.", "result.secondary.");

		});

		test("merge", 12, function() {
			var object1, object2;

			object1 = {
				"armOne": {
					"one": "blue",
					"two": "green",
					"five": {
						"cake": "is a lie"
					}
				},
				"secondary": {}
			};

			object2 = {
				"armOne": {
					"five": [1, 2, 3, 4, 5]
				},
				"armTwo": {
					"one": 1
				},
				"secondary": "49th and Second St."
			};

			equals(typeof engine.merge, 'function', "Engine should have a .merge() method for merging existing objects.");

			engine.merge(object1, object2);

			equals(object1.armOne.one, "blue", "object1.armOne.one.");
			equals(object1.armOne.two, "green", "object1.armOne.two.");
			equals(object1.armOne.five[0], 1, "object1.armOne.five[0].");
			equals(object1.armOne.five[1], 2, "object1.armOne.five[1].");
			equals(object1.armOne.five[2], 3, "object1.armOne.five[2].");
			equals(object1.armOne.five[3], 4, "object1.armOne.five[3].");
			equals(object1.armOne.five[4], 5, "object1.armOne.five[4].");
			equals(object1.armOne.five.cake, "is a lie", "object1.armOne.five.cake.");
			equals(typeof object1.armOne.five.length, "undefined", "object1.armOne.five.length.");
			equals(object1.armTwo.one, 1, "object1.armTwo.one.");
			equals(object1.secondary, "49th and Second St.", "object1.secondary.");

		});

		test(".event.emitter()", 6, function() {
			var emitter, sum, cleared;

			equals(typeof engine.event.emitter, 'function', "Engine should have an .event.emitter() method for creating event emitters.");

			emitter = engine.event.emitter();
			sum = 0;
			cleared = true;

			equals(typeof emitter.on, 'function', "Emitter should have .on() method for binding to emitter events.");
			equals(typeof emitter.trigger, 'function', "Emitter should have .trigger() method for binding to emitter events.");

			emitter.on('test', function() {
				ok(true, "emitters should be \"triggerable\".");
			});
			emitter.on('test2', function() {
				sum += 1;
			});
			emitter.on('test2', function() {
				sum += 2;
			});
			emitter.on('test2', function() {
				equals(sum, 3, 'Emitter should execute all callbacks when an event is triggered.');
			});
			emitter.on('test3', function() {
				cleared = false;
			}).clear();
			emitter.on('test3', function() {
				equals(cleared, true, 'on() should return a handler with a .clear() method to unbind an event listener.');
			});

			emitter.trigger('test');
			emitter.trigger(['test2', 'test3']);
		});



		module('Core');

		asyncTest(".event.loop()", 7, function() {
			var loop1, loop2, cycles1, cycles2;

			equals(typeof engine.event.loop, 'function', "Engine should have an .event.loop() method for creating event loops.");

			loop1 = engine.event.loop(100);
			loop2 = engine.event.loop(100);
			cycles1 = 0;
			cycles2 = 0;

			equals(typeof loop1.on, 'function', "Loop should have an .on() method for binding to loop events.");
			equals(typeof loop1.start, 'function', "Loop should have a .start() method for starting the loop.");
			equals(typeof loop1.stop, 'function', "Loop should have a .stop() method for stopping the loop.");
			equals(typeof loop1.setInterval, 'function', "Loop should have a .setInterval() method for changing the loop cycle interval.");

			loop1.start();
			loop1.on('every', function() {
				cycles1 += 1;
			});
			setTimeout(function() {
				loop1.stop();
				ok(cycles1 >= 9 && cycles1 <= 10, 'A loop at an interval of 100ms should execute 9 or 10 times in 1005ms.');
			}, 1010);

			loop2.start();
			loop2.on('every', function() {
				cycles2 += 1;
			});
			setTimeout(function() {
				loop2.setInterval(200);
			}, 501);
			setTimeout(function() {
				loop2.stop();
				equals(cycles2, 7, 'A loop at an interval of 100ms for 501ms then an interval of 200ms for 500ms should execute 7 times.');
			}, 1010);

			setTimeout(start, 1002);
		});

		asyncTest(".after", 4, function() {
			var cycles;

			equals(typeof engine.after, 'function', "Engine should have an .after() method for binding a callback to execute after a set number of cycles.");

			cycles = 0;

			engine.after(function(date) {
				ok(true, 'Engine should have a .after() method to schedule a callback after a set number of frames.');
				equals(typeof date, 'number', '.after() should pass its callback an execution date.');
			}, 1);

			engine.after(function() { cycles += 1 }, 1);
			engine.after(function() { cycles += 1 }, 2);
			engine.after(function() {
				equals(cycles, 2);
			}, 3);

			engine.after(start, 4);

		});

		asyncTest(".every", 3, function() {
			var cycles1, every1, every2;

			equals(typeof engine.every, 'function', "Engine should have an .every() method for binding a callback to execute every cycle.");

			cycles1 = 0;

			every1 = engine.every(function() {
				cycles1 += 1;
			}, 10);

			every2 = engine.every(function(date) {
				equals(typeof date, 'number', '.every() should pass its callback an execution date.');
				every2.clear();
			}, 10);

			engine.after(function() {
				every1.clear();
			}, 55);
			
			engine.after(function() {
				equals(cycles1, 5);
			}, 105);

			engine.after(start, 110);
		});



		module("Elements");

		test(".element", 12, function() {
			var element;

			equals(typeof engine.element, 'function', "Engine should have an .element() method for creating new elements.");

			element = engine.element('testElement', {}, 34, 12, 0, 1, 3);

			equals(typeof element.move, 'function', "Elements should have a .move() method for moving the element.");
			equals(typeof element.x, 'function', "Elements should have an .x() method for getting/setting the element's x axis.");
			equals(typeof element.y, 'function', "Elements should have a .y() method for getting/setting the element's y axis.");
			equals(typeof element.z, 'function', "Elements should have a .z() method for getting/setting the element's z axis.");
			equals(typeof element.hide, 'function', "Elements should have an .hide() method for hiding the element.");
			equals(typeof element.show, 'function', "Elements should have an .show() method for showing the element.");
			equals(typeof element.data, 'function', "Elements should have an .data() method for getting/setting data attached to the element.");
			equals(typeof element.sprite, 'function', "Elements should have a .sprite() method for getting/setting the current sprite.");


			equals(element.x(), 34, "Test element x should equal 34.");
			equals(element.y(), 12, "Test element y should equal 12.");
			equals(element.z(), 0, "Test element z should equal 0.");

		});

	});
});