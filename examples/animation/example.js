//Start Red Locomotive
window.onload = function(){
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
			{ "url": "sprites/test.png", "spriteWidth": 100, "spriteHeight": 100 }
		], function(){


			//create the main elements
			var testElement = engine.element.create('test', 'sprites/test.png', 300, 100, 100, 100);

			engine.every(function () {
				engine.animate.move(testElement, 100, 100, 25, function () {
					engine.animate.move(testElement, 100, 300, 25, function () {
						engine.animate.move(testElement, 300, 300, 25, function () {
							engine.animate.move(testElement, 300, 100, 25);
						});
					});
				});
			}, 100, true);

		});

	});
}