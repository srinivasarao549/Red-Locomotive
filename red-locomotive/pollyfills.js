define(function() {

	pollyfill.namespace = "pollyfills";

	function pollyfill() {

		var activePollyFills = {};

		pollyRequestAnimationFrame(activePollyFills);

		return activePollyFills;
	}

	function pollyRequestAnimationFrame(activePollyFills) {

		if(window.requestAnimationFrame !== 'function') {
			activePollyFills.requestAnimationFrame = true;

			window.requestAnimationFrame =
				window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					setTimeout(function() {
						callback(Date.now());
					}, 0);
				}
		}

	}

	return pollyfill;

});