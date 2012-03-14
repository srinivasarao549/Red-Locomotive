(function() {

	var RL = RedLocomotive({
		"baseUrl": '../'
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
		var V, element;

		//log the config
		C.dev && console.log('Config', C);

		//setup the viewport
		V = RL.view('main', 0, 0, 0, 1, innerWidth, innerHeight);
		window.onresize = function() { V.width(innerWidth); V.height(innerHeight); }
		document.body.appendChild(V.element);
		
		//create an element
		window.element = RL.element('test', 40, 40, 0, 100, 100);
	}
})();