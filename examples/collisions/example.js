RedLocomotive({

	//Configuration
	"baseUrl": "../../",
	"spriteSheets": [
		["player", "sprites/player.png", 30, 30],
		["map", "sprites/map.png", 800, 600]
	]

}, function(engine) {
	engine.start();

	//Create the main viewport
	engine.viewport.create('main', 'canvas', 800, 600);

	//create a map
	engine.element.create('map', 'map', 0, 0, 2);

	//create the player
	var player = engine.element.create('player', 'player', 10, 10, 1);

	engine.bind.key('ctrl + q', function(keys, combo){
		//console.log('quit?');
	});

	engine.bind.key('ctrl + shift + q', function(keys, combo){
		//console.log('seriously quit?');
	});

	engine.bind.key('left', function(keys, combo){
		console.log('left mannnnn!');
	});

	engine.bind.axis('up', 'down', 'left', 'right', 5, function(coords){
		console.log(coords);
	});

});