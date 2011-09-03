RedLocomotive({

	//Configuration
	"baseUrl": "../../",
	"spriteSheets": [
		["test", "sprites/test.png", 100, 100]
	]

}, function(engine) {
	engine.start();


	//Create the main viewport
	var mainView = engine.viewport.create('main', 'canvas', 800, 600);


	alert('done');

});