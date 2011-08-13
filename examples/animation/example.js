RedLocomotive({

	//Configuration
	"baseUrl": "../../",
	"showFPS": true

}, function(engine) {


	//Create the main viewport
	var mainView = engine.viewport.create('main', 'canvas', 800, 600);


	//create a test sprite sheet
	engine.spriteSheet.create([
		{ "name": "test", "url": "sprites/test.png", "spriteWidth": 100, "spriteHeight": 100 }
	], function(){

		function renderFlashyBlock(id, x, y) {

			//create the flashy block
			var flashyBlock = engine.element.create(id, 'test', x + 200, y, 100, 100);

			engine.every(function () {
				var start = new Date();
				engine.animate.move(flashyBlock, 0 + x, 0 + y, 300, function () {
					console.log(new Date - start);
					engine.animate.move(flashyBlock, 0 + x, 200 + y, 300, function () {
						engine.animate.move(flashyBlock, 200 + x, 200 + y, 300, function () {
							engine.animate.move(flashyBlock, 200 + x, 0 + y, 300);
						});
					});
				});
			}, 1200, true);

			engine.animate.sequence(flashyBlock, [
				[0, 0], [1, 0], [2, 0],
				[3, 0], [4, 0], [3, 0],
				[2, 0], [1, 0]
			], 100).loop();

		}

		function renderFlashyBlockDance(id, x, y) {

			renderFlashyBlock(id + '-1', x, y);

			engine.after(function(){
				renderFlashyBlock(id + '-2', x + 100, y);
			}, 300);

			engine.after(function(){
				renderFlashyBlock(id + '-3', x + 100, y + 100);
			}, 600);

			engine.after(function(){
				renderFlashyBlock(id + '-4', x, y + 100);
			}, 900);

		}

		renderFlashyBlockDance('1', 100, 100);
		//renderFlashyBlock('one', 100, 100);

		engine.after(function(){
			//renderFlashyBlockDance('2', 100, 100);
		}, 150);

		engine.after(function(){
			//renderFlashyBlockDance('3', 100, 100);
		}, 300);

		engine.after(function(){
			//renderFlashyBlockDance('4', 100, 100);
		}, 450);

		engine.start();

	});

});