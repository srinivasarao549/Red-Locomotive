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

	function renderFlashyBlock(id, x, y) {

		//create the flashy block
		var flashyBlock = engine.element.create(id, 'test', x + 200, y, 100, 100);

		engine.every(function () {
			engine.animate.move(flashyBlock, 0 + x, 0 + y, 25, function () {
				engine.animate.move(flashyBlock, 0 + x, 200 + y, 25, function () {
					engine.animate.move(flashyBlock, 200 + x, 200 + y, 25, function () {
						engine.animate.move(flashyBlock, 200 + x, 0 + y, 25);
					});
				});
			});
		}, 100, true);

		engine.every(function () {
			engine.animate.sequence(flashyBlock, [
				[0, 0], [1, 0], [2, 0],
				[3, 0], [4, 0], [3, 0],
				[2, 0], [1, 0]
			]);
		}, 8, true);

	}

	function renderFlashyBlockDance(id, x, y) {

		renderFlashyBlock(id + '-1', x, y);

		engine.after(function(){
			renderFlashyBlock(id + '-2', x + 100, y);
		}, 25);

		engine.after(function(){
			renderFlashyBlock(id + '-3', x + 100, y + 100);
		}, 50);

		engine.after(function(){
			renderFlashyBlock(id + '-4', x, y + 100);
		}, 75);

	}

	renderFlashyBlockDance('1', 100, 100);

	engine.after(function(){
		renderFlashyBlockDance('2', 100, 100);
	}, 12);

	engine.after(function(){
		renderFlashyBlockDance('3', 100, 100);
	}, 24);

	engine.after(function(){
		renderFlashyBlockDance('4', 100, 100);
	}, 36);

});