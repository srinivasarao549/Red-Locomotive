RedLocomotive('sprites', function(options, engine){
    "use strict"

    var sprites = {},
        images = {},
        canvas = jQuery('<canvas></canvas>'),
        canvasContext = canvas[0].getContext('2d');

    /**
     * newSprite - Makes a new sprite for use with elements
     * @param url {string} The url to the sprite sheet image
     * @param col {int} The sprite column
     * @param row {int} The sprite row
     * @param w {int} The sprite width
     * @param h {int} The sprite height
     * @param skipAlphaMap {boolean} [optional] If true, A alpha map will not be created. Defaults to false
     */
    function newSprite(url, col, row, w, h, skipAlphaMap) {
        sprites[url] = {
            "spriteColumn": col,
            "spriteRow": row,
            "spriteWidth": w,
            "spriteHeight": h,
            "imageData": [],
            "skipAlphaMap": skipAlphaMap
        };
        updateSprite(url);
    }

    /**
     * getImage - Downloads the image and caches it, if its already cached then use the cached version
     * @param url {string} The url to the sprite sheet image
     * @param callback {function} [optional] A function that will fire when the image has been fully downloaded
     * @param forceNewImage {boolean} [optional] If true, the image will download whether its cached or not. Though not recommended this can be used to update the spriteSheet revision already in memory.
     */
    function getImage(url, callback, forceNewImage) {

        //a wrapper for the callback
        function exec() {
            callback(images[url]);
        }

        //if the image has not been created, or we're forcing an overwrite
        if (!images[url] || forceNewImage) {

            //download the image
            images[url] = jQuery('<img src="' + url + '" alt="">');

            //on ready fire the callback
            images[url].ready(exec);

        //else fire the callback
        } else {
            exec();
        }
    }

    /**
     * updateSprite - Used by newSprite() to make an alpha map of a sprite. It is a seperate function because it is possible to prevent newSprite() from calling updateSprite(). Separating the two functions allows manual mapping later.
     * @param url {string} The url to the sprite sheet image
     * @param callback {function} [optional] A calback function to be fired after the sprite has been created
     */
    function updateSprite(url, callback) {

        //reference the sprite data
        var sprite = sprites[url];

        //create an image
        getImage(url, function (image) {

            //get the image data
            if (sprite.skipAlphaMap) {

                //collect vars
                var pixelZoom = engine.pixelZoom || 1,
                    imageWidth = image.width(),
                    imageHeight = image.height(),
                    dirtyImageWidth = Math.floor(imageWidth * pixelZoom),
                    dirtyImageHeight = Math.floor(imageHeight * pixelZoom),
                    dirtySpriteWidth = Math.floor(sprite.width * pixelZoom),
                    dirtySpriteHeight = Math.floor(sprite.height * pixelZoom),
                    columns = Math.floor(imageWidth / sprite.width),
                    rows = Math.floor(imageHeight / sprite.height),
                    pixelData = sprite.imageData,
                    spritePixelData = false;

                //size the canvas to the image
                canvas.width(dirtyImageWidth).height(dirtyImageHeight);

                //blit the image on to the canvas
                canvasContext.drawImage(image[0], 0, 0, imageWidth, imageHeight, 0, 0, dirtyImageWidth, dirtyImageHeight);

                //loop each sprite column
                for (var c = 0; c < columns; c += 1) {

                    //if the pixel data column does not exist then create it
                    if (!pixelData[c]) pixelData[c] = [];

                    //loop through each sprite row
                    for (var r = 0; r < rows; r += 1) {

                        //if the pixel data row does not exist then create it
                        if (!pixelData[c][r]) pixelData[c][r] = [];

                        //get the pixel data
                        spritePixelData = canvasContext.getImageData(c * dirtySpriteWidth, r * dirtySpriteHeight, dirtyImageWidth, dirtyImageHeight);

                        //extract each pixel
                        for (var prgb = 0; prgb < spritePixelData; prgb += 4) {
                            var p = prgb / 4,
                                pr = Math.floor(p / dirtySpriteWidth),
                                pc = p - Math.floor(dirtyImageWidth * pr);

                            //if the pixel data row does not exist then create it
                            if (!pixelData[c][r][pc]) pixelData[c][r][pc] = [];

                            //create the pixel slot for the alpha data
                            pixelData[c][r][pc][pr] = spritePixelData[prgb + 3];
                        }
                    }
                }
            } else {

                //save empty data
                sprite.imageData = false;
            }
        }, false);
    }

    /**
     * removeSprite - Removes a sprite and its corresponding image
     * @param url {string} The sprite url
     */
    function removeSprite(url) {
        delete sprites[url];
        delete images[url];
    }

    //return the module api
    return {
        "sprite": {
            "create": newSprite,
            "update": updateSprite,
            "clear": removeSprite
        }
    }
});
