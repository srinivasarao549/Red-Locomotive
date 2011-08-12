//Start Red Locomotive
RedLocomotive({
	
	//Configuration
	"baseUrl": "../../",
	"showFPS": true

}, function(engine) {

	//Create the main viewport
	var mainView = engine.viewport.create('main', 'canvas', 800, 600);

	//create a test sprite sheet
	engine.spriteSheet.create([
		{ "name": 'test', "url": "sprites/test.png", "spriteWidth": 100, "spriteHeight": 100 }
	], createElements);

	//create the main elements
	function createElements() {

		//create a test elements
		var testElement1 = engine.element.create('test1', 'test', 300, 200);

		//make the test object follow a path
		engine.path.patrol(testElement1, [[0, 100], [100, 200], [200, 100], [100, 0]], 60, 'absolute');

	}
});