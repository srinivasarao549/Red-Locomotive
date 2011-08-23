//Start Red Locomotive
RedLocomotive({

	//Configuration
	"baseUrl": "../../"

}, function(engine) {
	engine.start();

	engine.require('character2d', run);

	function run() {

		//Create the main viewport
		var mainView = engine.viewport.create('main', 'canvas', 800, 600);

		//create a test sprite sheet
		engine.spriteSheet.create([
		["test", "sprites/test.png", 100, 100]
		], createChar);

	}

	//create the main elements
	function createChar() {

		var test = engine.character2d.create('test', "test", 100, 100);

		test.sequence.idle([[0, 0], [1, 0]], [], 5);
		test.sequence.up([[0, 1], [1, 1]], [], 5);
		test.sequence.down([[0, 2], [1, 2]], [], 5);
		test.sequence.right([[0, 3], [1, 3]], [], 5);
		test.sequence.left([[0, 4], [1, 4]], [], 5);

		engine.character2d.bindToArrowKeys(test, 6);

	}
});