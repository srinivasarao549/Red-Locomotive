//Start Red Locomotive
RedLocomotive({

	//Configuration
	"baseUrl": "../../"

}, function(engine) {
	engine.start();

		//Create the main viewport
		engine.viewport.create('main', 'canvas', 800, 600);

		//create a test sprite sheet
		engine.spriteSheet.create([
		["test", "sprites/test.png", 100, 100]
		], function() {

		var test = engine.character.create('test', "test", 100, 100);

		engine.character.onIdle(test, [[0, 0], [1, 0]], [], 5);
		engine.character.onUp(test, [[0, 1], [1, 1]], [], 5);
		engine.character.onDown(test, [[0, 2], [1, 2]], [], 5);
		engine.character.onRight(test, [[0, 3], [1, 3]], [], 5);
		engine.character.onLeft(test, [[0, 4], [1, 4]], [], 5);

		engine.character.bindToArrowKeys(test, 6);
	});

});