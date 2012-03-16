(function() {

	var RL = RedLocomotive({
		"baseUrl": '../',
		"fps": 240
	});

	RL.on('ready', function() {
		var req;

		//config
		req = RL.fetch.json('config.json');

		req.on('success', function(config) {
			Ascend(config);
		});

	});

	function Ascend(C) {
		var V, element, subelement;

		//log the config
		C.dev && console.log('Config', C);

		//setup the viewport
		V = RL.view('main', 0, 0, 0, 1, innerWidth, innerHeight);
		window.onresize = function() { V.width(innerWidth); V.height(innerHeight); }
		document.body.appendChild(V.element);
		
		//create an element
		window.e = element = RL.element('test', 12, 34, 0, 440, 340);
		subelement = element.element('test2', 17, 24, 0, 80, 120);

		var x = element.x(), y = element.y(), diffX = 10, diffY = 10;
		var sx = subelement.x(), sy = subelement.y(), sdiffX = 5, sdiffY = 5;
		RL.every(function() {
			if(x + element.width() > innerWidth) { diffX = -10 }
			if(x < 0) { diffX = 10 }
			x += diffX;
			if(y + element.height() > innerHeight) { diffY = -10 }
			if(y < 0) { diffY = 10 }
			y += diffY;

			element.move(x, y);


			if(sx + subelement.width() > element.width()) { sdiffX = -5 }
			if(sx < 0) { sdiffX = 5 }
			sx += sdiffX;
			if(sy + subelement.height() > element.height()) { sdiffY = -5 }
			if(sy < 0) { sdiffY = 5 }
			sy += sdiffY;

			subelement.move(sx, sy);


		});
	}
})();