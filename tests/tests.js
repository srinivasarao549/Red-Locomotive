require(['../red-locomotive/red-locomotive'], function(RedLocomotive) {
	var testConfig = {
		"baseUrl": "../",
		"fps": 1
	};

	module('Kernel (red-locomotive)');

	test("engine", function() {
		var engine;

		engine = RedLocomotive(testConfig);
		engine.on('ready', function() {
			start();

			ok(true, 'The engine object should emit a ready event once all modules have loaded.');
		});

		ok(engine, "RedLocomotive() should return an engine object.");
		equal(typeof engine.on, 'function', "The engine object should have an .on() method.");

		stop();
	});

	test("engine.extend()", function() {
		var engine;

		engine = RedLocomotive(testConfig);
		engine.on('ready', function() {
			var object1, object2, object3;
			start();

			console.log(2);

			object1 = {
				"a": "x",
				"b": {
					"a": "a"
				},
				"c": ['a']
			};

			object2 = {
				"a": "a",
				"b": {},
				"c": ['a']
			};

			equal(typeof engine.extend, 'function', 'The engine object should have a method called extend.');

			object3 = engine.extend(object1, object2);

			equal(object3.a, 'a');
			equal(object3.b.a, 'a');
			equal(object3.c[0], 'a');
		});

		console.log(1);
		stop();
	});


});

/*
	{
		"a": "a",
		"b": {
			"a": "a"
		},
		"c": ['a']
	}

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
 */