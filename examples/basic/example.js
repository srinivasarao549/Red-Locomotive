jQuery(function () {
    "use strict"
    RedLocomotive({
        "baseUrl": "../../"
    }, function(engine) {

		engine.viewport.create('main', 'canvas', 1);

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

        	console.log(testElement);
    	});
    });
});