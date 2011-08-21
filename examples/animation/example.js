RedLocomotive({

	//Configuration
	"baseUrl": "../../",
	"showFPS": true

}, function(engine) {


	//Create the main viewport
	var mainView = engine.viewport.create('main', 'canvas', 800, 600);

	//create a test sprite sheet
	engine.spriteSheet.create([
		["test", "sprites/test.png", 100, 100]
	], function(){

		function renderFlashyBlock(id, x, y) {

			//create the flashy block
			var flashyBlock = engine.element.create(id, 'test', x + 200, y, 100, 100);
			/*var body = jQuery('body');

			body.append('<h1>SpriteSheet</h1>');
			body.append(flashyBlock.spriteSheet.canvas.canvas);

			var sprites = flashyBlock.spriteSheet.sprites;
			for (var rI = 0; rI < sprites.length; rI += 1) {
				for (var cI = 0; cI < sprites[rI].length; cI += 1) {

					var sprite = sprites[rI][cI];

					body.append('<h1>Sprite ' + cI + 'x' + rI + '</h1>');
					body.append(sprite.canvas);

				}
			}*/

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

		engine.start();

	});

});