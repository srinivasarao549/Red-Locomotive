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
		var testElement1 = engine.element.create('test1', 'test', 100, 0);
		var testElement2 = engine.element.create('test2', 'test', 200, 100);
		var testElement3 = engine.element.create('test3', 'test', 300, 200);

		//make the test object follow a path
		engine.path.patrol(testElement1, [[0, 100], [100, 200], [200, 100], [100, 0]], 60, 'absolute');
		engine.path.patrol(testElement2, [[-100, 100], [100, 100], [100, -100], [-100, -100]], 60, 'relative');
		var distance = engine.distance(100, 100);
		engine.path.patrol(testElement3, [[225, distance], [135, distance], [45, distance], [315, distance]], 60, 'vectors');

	}
});