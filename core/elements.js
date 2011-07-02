RedLocomotive("elements", function(options, engine) {

    var elements = {};

    function newElement(elementName, spriteSheetName, x, y, w, h) {
        elements[elementName] = {
            "spriteSheet": engine.sprite.get(spriteSheetName),
            "x": x,
            "y": y,
            "width": w,
            "height": h
        }
    }

    return {
        "element": {
            "create": newElement
        },
        "DATA": {
            "ELEMENTS": elements
        }
    }
});