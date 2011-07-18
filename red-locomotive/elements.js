RedLocomotive("elements", function(options, engine) {

    var elements = {},
		textElements = {};

	/**
	 * New Element
	 * @param elementName
	 * @param spriteUrl
	 * @param x
	 * @param y
	 * @param w
	 * @param h
	 * @param sX
	 * @param sY
	 */
    function newElement(elementName, spriteUrl, x, y, w, h, sX, sY) {
		
		if(elementName !== 'all') {
			elements[elementName] = {
				"spriteSheet": engine.spriteSheet.get(spriteUrl),
				"x": x,
				"y": y,
				"width": w,
				"height": h,
				"spritePos": [sX || 0, sY || 0]
			};
			return elements[elementName];
		}

		return false;
    }

	/**
	 * Get Element or Elements
	 * @param elementName
	 */
	function getElement(elementName) {

		if (elementName === "all") {
			return elements;
		} else if (elements[elementName]) {
			return elements[elementName];
		}

		return false;
	}

	/**
	 * Remove Element
	 * @param elementName
	 */
	function removeElement(elementName) {

		if (elements[elementName]) {
			delete elements[elementName];
			return true;
		}

		return false
	}

	/**
	 * New Text Element
	 * @param textElementName
	 * @param text
	 * @param size
	 * @param x
	 * @param y
	 * @param w
	 */
	function newTextElement(textElementName, text, size, x, y, w) {

		if(textElementName !== 'all') {
			textElements[textElementName] = {
				"x": x,
				"y": y,
				"width": w || 0,
				"text": text || '',
				"size": size || 16,
				"font": '' || 'Arial, Helvetica'
			};
			return textElements[textElementName];
		}

		return false;
	}

	/**
	 * Get Text Element or Text Elements
	 * @param textElementName
	 */
	function getTextElement(textElementName) {

		if (textElementName === "all") {
			return textElements;
		} else if (textElements[textElementName]) {
			return textElements[textElementName];
		}

		return false;
	}

	/**
	 * Remove Text Element
	 * @param textElementName
	 */
	function removeTextElement(textElementName) {

		if (textElements[textElementName]) {
			delete textElements[textElementName];
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
		"text": {
			"create": newTextElement,
			"get": getTextElement,
			"remove": removeTextElement
		}
    }
});