RedLocomotive("elements", function(options, engine) {

    var elements = {};

    function newElement(elementName, spriteUrl, x, y, w, h) {
        elements[elementName] = {
            "spriteSheet": engine.spriteSheet.get(spriteUrl),
            "x": x,
            "y": y,
            "width": w,
            "height": h,
			"sequence": [[0, 0]],
			"frame": 0
        };
		return elements[elementName];
    }

	function getElement(elementName) {

		if (elements[elementName]) {
			return elements[elementName];
		}

		return false;
	}

	function removeElement(elementName) {
		if (elements[elementName]) {
			delete elements[elementName];
			return true;
		}
		return false
	}

    return {
        "element": {
            "create": newElement,
            "get": getElement,
			"remove": removeElement
        },
        "DATA": {
            "ELEMENTS": elements
        }
    }
});