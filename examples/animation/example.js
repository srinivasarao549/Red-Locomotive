//Start Red Locomotive
window.onload = function(){
	RedLocomotive({


		//Configuration
		"baseUrl": "../../",
		"fps": 30,
		"showFPS": true,
		"pauseOnBlur": true


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
					engine.animate.move(flashyBlock, 270, 200, 25, function () {
						engine.animate.move(flashyBlock, 180, 200, 25, function () {
							engine.animate.move(flashyBlock, 90, 200, 25, function () {
								engine.animate.move(flashyBlock, 0, 200, 25);
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

	});
}