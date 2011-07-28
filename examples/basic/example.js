//Start Red Locomotive
RedLocomotive({

		
	//Configuration
	"baseUrl": "../../",
	"fps": 30,
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
		var testElement = engine.element.create('test', 'test', 300, 125, 100, 100),
			testTextElement = engine.text.create('test', 'Red Locomotive!', 48, -800, 100),
			testTextElement2 = engine.text.create('test2', 'Giving your games Tractive Effort', 48, mainView.node[0].width, 300),
			b = false;



		//Move the test element back and forth every 5 frames
		engine.every(function () {
			if(b) { b = false; testElement.x = 300; } else { b = true; testElement.x = 400; }
		}, 5);


		//Move the two text elements across the screen marque style
		engine.every(function () {
			if (testTextElement.x < mainView.node[0].width) { testTextElement.x += 5; } else { testTextElement.x = -800; }
			if (testTextElement2.x > -800) { testTextElement2.x -= 5; } else { testTextElement2.x = mainView.node[0].width; }
		});



	}
});