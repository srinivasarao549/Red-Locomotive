RedLocomotive({
	"baseUrl": '../'
}, function (engine) {

	engine.viewport.create('mainView', 'canvas');

	engine.spriteSheet.create([
		{ "name": "testSheet", "url": "basic/sprites/test.png", "spriteWidth": 100, "spriteHeight": 100 }
	], function() {
		
		engine.start();

		(function() {
			var element = engine.element.create('testElement' + engine.idGen(), 'testSheet', 0, 0);

			engine.animate.move(element, 400, 200, 10000);
		})();
	});

});