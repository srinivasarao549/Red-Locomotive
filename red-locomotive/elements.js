RedLocomotive("elements", function(engine, options) {

    var elements = {},
		textElements = {};

	/**
	 * New Element
	 * @param elementName
	 * @param spriteName
	 * @param x
	 * @param y
	 * @param z
	 */
    function newElement(elementName, spriteName, x, y, z) {
		
		if(elementName !== 'all') {

			var spriteSheet = engine.spriteSheet.get(spriteName);

			if(spriteSheet) {

				var element = {
					"name": elementName,
					"spriteSheet": spriteSheet,
					"x": x,
					"y": y,
					"z": z,
					"width": spriteSheet.spriteWidth,
					"height": spriteSheet.spriteHeight,
					"spritePos": [0, 0]
				};

				//save the element
				elements[elementName] = element;

				return element;
			} else {
				throw new ReferenceError('Spritesheet "' + spriteName + '" does not exist. Cannot create element "' + elementName + '"');
			}
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

		if(elementName.name){
			elementName = elementName.name;
		}

		if (elements[elementName]) {
			delete elements[elementName];
			return true;
		}

		return false
	}

	/**
	 * Takes an element and a vector, then moves the element to the vector's end point
	 * @param element
	 * @param degree
	 * @param distance
	 */
	function move(element, degree, distance, preventSlide) {

		preventSlide = preventSlide || false;

		var newPos = engine.coords(degree, distance);

		//find the x and y distance via sine and cosine
		element.x += newPos.x;
		element.y += newPos.y;

		if(engine.collisions.check(element)){

			element.x -= newPos.x;
			element.y -= newPos.y;

			//if(preventSlide) {
				return false;
			//}

			//if(!move(element, degree + 45, distance, true)) {
				//if(!move(element, degree - 45, distance, true)) {
					//return false;
				//}
			//}
		}

		return true;
	}

	function keepIn(element, viewport, marginX, marginY) {

        marginX = marginX || 0;
        marginY = marginY || marginX;

		function clear() {
			bindingTimer.clear();
		}

		if(
			typeof element.x !== "undefined" ||
			typeof element.y !== "undefined" ||
			typeof element.height !== "undefined" ||
			typeof element.width !== "undefined" ||
			
			typeof viewport.x !== "undefined" ||
			typeof viewport.y !== "undefined"

		) {

			var bindingTimer = engine.every(function(){

                //figure out limits
                var viewportLimits = {
                        "top": viewport.y,
                        "bottom": viewport.y + viewport.node[0].height,
                        "left": viewport.x,
                        "right": viewport.x + viewport.node[0].width,
                        "centerX": (viewport.x + (viewport.node[0].width / 2)),
                        "centerY": (viewport.y + (viewport.node[0].height / 2))
                    },
                    elementLimits = {
                        "top": element.y - marginY,
                        "bottom": element.y + element.height + marginY,
                        "left": element.x - marginX,
                        "right": element.x + element.width + marginX,
                        "centerX": (element.x + (element.width / 2)),
                        "centerY": (element.y + (element.height / 2))
                    };

                //if element height is greater than viewport height
                if(marginX === -1 || elementLimits.bottom - elementLimits.top > viewportLimits.bottom - viewportLimits.top){

                    viewport.x += elementLimits.centerX - viewportLimits.centerX;

                } else {

                    //scroll Y on limits
                    if (elementLimits.top < viewportLimits.top) {
                        viewport.y = elementLimits.top;
                    }
                    if (elementLimits.bottom > viewportLimits.bottom) {
                        viewport.y = elementLimits.bottom - (viewportLimits.bottom - viewportLimits.top);
                    }
                }

                //if element width is greater than viewport width
                if(marginY === -1 || elementLimits.right - elementLimits.left > viewportLimits.right - viewportLimits.left){

                    viewport.y += elementLimits.centerY - viewportLimits.centerY;

                } else {

                    //scroll X on limits
                    if (elementLimits.left < viewportLimits.left) {
                        viewport.x = elementLimits.left;
                    }
                    if (elementLimits.right > viewportLimits.right) {
                        viewport.x = elementLimits.right - (viewportLimits.right - viewportLimits.left);
                    }
                }

			});

			return {
				"clear": clear
			}

		}

		return false;
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
			"remove": removeElement,
			"move": move,
			"keepIn": keepIn
        },
		"text": {
			"create": newTextElement,
			"get": getTextElement,
			"remove": removeTextElement
		}
    }
});