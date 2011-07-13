jQuery(function () {
    "use strict"
    RedLocomotive({
        "baseUrl": "../../",
		"fps": 60,
		"showFPS": true
    }, function(engine) {

		window.engine = engine;

		var mainView = engine.viewport.create('main', 'canvas', 800, 600);

		//create a test sprite sheet
        engine.spriteSheet.create([
            {
                "url": "sprites/test.png",
                "spriteWidth": 100,
                "spriteHeight": 100
            }
        ], function() {

        	//create a test element
        	var testElement = engine.element.create('test', 'sprites/test.png', 100, 100, 100, 100);

			var testTextElement = engine.text.create('test', 'test element', 48, 10, 100);

			engine.every(function () {

				if ((testTextElement.x + 400) < mainView.node[0].width) {

					testTextElement.x = testTextElement.x + 1;

				} else {
					testTextElement.x = 0;
				}

			});

			engine.after(function () {

				testElement.y = 200;

			}, 100);

    	});
    });
});