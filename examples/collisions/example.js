RedLocomotive({

	//Configuration
	"baseUrl": "../../",
	"spriteSheets": [
		["box", "sprites/box.png", 100, 100]
	]

}, function(engine) {
	engine.start();

	//Create the main viewport
	var mainView = engine.viewport.create('main', 'canvas', 800, 600);

	//create a box
	var box = engine.element.create('box', 'test', 100, 100, 1);
	engine.animate.sequence(box, [[0, 0]]);

	//create a number of random circles to
	for (var i = 0; i < 100; i += 1) {
		var circle = engine.element.create('circle' + engine.idGen(), 'test', engine.random(500), engine.random(350), 1);
		engine.animate.sequence(circle, [[0, 0]]);
	}

});