RedLocomotive('sprites', function(options, engine){
    "use strict"

    var sprites = {},
        images = {},
        canvas = jQuery('<canvas></canvas>'),
        canvasContext = canvas[0].getContext('2d'),
        zoomLevels;

    /**
     * newSpriteSheet - Makes a new sprite sheet for use with elements
	 * @author <a href="mailto:robert@thinktankdesign.ca">Robert Hurst</a>
     * @param url {string} The url to the sprite sheet image
     * @param w {int} The sprite width
     * @param h {int} The sprite height
     * @param skipPixelMap {boolean} [optional] If true, A pixel map will not be created. Defaults to false
     */
    function newSpriteSheet(url, w, h, skipPixelMap, callback) {
        if(typeof url === "object") {
            callback = w;
            for (var i = 0; i < url.length; i += 1) {
                newSpriteSheet(url[i].url || '', url[i].spriteWidth || 0, url[i].spriteHeight || 0, url[i].skipPixelMap || false);
            }
        } else {
            sprites[url] = {
                "spriteWidth": w,
                "spriteHeight": h,
                "imageData": false,
                "skipPixelMap": skipPixelMap,
                "image": images[url]
            };
            updateSpriteSheet(url, 1, callback);
        }
    }

    /**
     * getImage - Downloads the image and caches it, if its already cached then use the cached version
	 * @author <a href="mailto:robert@thinktankdesign.ca">Robert Hurst</a>
     * @param url {string} The url to the sprite sheet image
     * @param callback {function} [optional] A function that will fire when the image has been fully downloaded
     * @param forceNewImage {boolean} [optional] If true, the image will download whether its cached or not. Though not recommended this can be used to update the spriteSheet revision already in memory.
     */
    function loadImage(url, callback, forceNewImage) {

        //if the image has not been created, or we're forcing an overwrite
        if (!images[url] || forceNewImage) {

            //download the image
            images[url] = jQuery('<img src="' + url + '" alt="">');

            //on ready fire the callback
            images[url].ready(function () {
                callback(images[url]);
            });

        //else fire the callback
        } else {
            callback(images[url]);
        }
    }

    /**
     * updateSpriteSheet - Used by newSpriteSheet() to make an pixel map of a sprite. It is a separate function because it is possible to prevent newSpriteSheet() from calling updateSpriteSheet(). Separating the two functions allows manual mapping later.
     * @author <a href="mailto:robert@thinktankdesign.ca">Robert Hurst</a>
     * @param url {string} The url to the sprite sheet image
     * @param callback {function} [optional] A callback function to be fired after the sprite has been created
     */
    function updateSpriteSheet(url, callback) {

        //reference the sprite data
        var sprite = sprites[url];

        //create an image
        loadImage(url, function (image) {

            //get the image data
            if (sprite.skipPixelMap) {

                //collect vars
                var imageWidth = image.width(),
                    imageHeight = image.height(),
                    columns = Math.floor(imageWidth / sprite.width),
                    rows = Math.floor(imageHeight / sprite.height),
                    pixelData = sprite.imageData,
                    spritePixelData = false;

                for (var z = 0; z < zoomLevels.length; z += 1) {
                    var zoomLevel = zoomLevels[z],
                        dirtyImageWidth = Math.floor(imageWidth * zoomLevel),
                        dirtyImageHeight = Math.floor(imageHeight * zoomLevel),
                        dirtySpriteWidth = Math.floor(sprite.width * zoomLevel),
                        dirtySpriteHeight = Math.floor(sprite.height * zoomLevel);

                    //size the canvas to the image
                    canvas.width(dirtyImageWidth).height(dirtyImageHeight);

                    //blit the image on to the canvas
                    canvasContext.drawImage(image[0], 0, 0, imageWidth, imageHeight, 0, 0, dirtyImageWidth, dirtyImageHeight);

                    //create the zoomlevel if it does not exist
                    if (!pixelData[zoomLevel]) pixelData[zoomLevel] = [];

                    //loop each sprite column
                    for (var c = 0; c < columns; c += 1) {

                        //if the pixel data column does not exist then create it
                        if (!pixelData[zoomLevel][c]) pixelData[zoomLevel][c] = [];

                        //loop through each sprite row
                        for (var r = 0; r < rows; r += 1) {

                            //if the pixel data row does not exist then create it
                            if (!pixelData[zoomLevel][c][r]) pixelData[zoomLevel][c][r] = [];

                            //get the pixel data
                            spritePixelData = canvasContext.getImageData(c * dirtySpriteWidth, r * dirtySpriteHeight, dirtyImageWidth, dirtyImageHeight);

                            //extract each pixel
                            for (var prgb = 0; prgb < spritePixelData; prgb += 4) {
                                var p = prgb / 4,
                                    pr = Math.floor(p / dirtySpriteWidth),
                                    pc = p - Math.floor(dirtyImageWidth * pr);

                                //if the pixel data row does not exist then create it
                                if (!pixelData[zoomLevel][c][r][pc]) pixelData[zoomLevel][c][r][pc] = [];

                                //create the pixel slot for the rgba data
                                pixelData[zoomLevel][c][r][pc][pr] = [spritePixelData[prgb], spritePixelData[prgb + 1], spritePixelData[prgb + 2], spritePixelData[prgb + 3]];
                            }
                        }
                    }
                }
            } else {
                sprite.imageData = false;
            }

            if  (typeof callback === "function") {
                callback();
            }
        }, false);
    }

    function addZoomLevel(zoomLevel, force) {
        if(!jQuery.inArray(zoomLevel, zoomLevels) || force){
            zoomLevels.push(zoomLevel);
            for (var spriteName in sprites) {
                if (sprites.hasOwnProperty(spriteName)) {
                    updateSpriteSheet(sprites[spriteName].url);
                }
            }
        }
    }

    /**
     * removeImage - Removes an image from the cache
	 * @author <a href="mailto:robert@thinktankdesign.ca">Robert Hurst</a>
     * @param url {string} The image url
     */
    function removeImage(url) {
        delete images[url];
    }

    /**
     * removeSpriteSheet - Removes a sprite sheet and its corresponding image
	 * @author <a href="mailto:robert@thinktankdesign.ca">Robert Hurst</a>
     * @param url {string} The sprite url
     */
    function removeSpriteSheet(url) {
        delete sprites[url];
        delete images[url];
    }

    /**
     * getSpriteSheet - returns a sprite sheet data object by url
     * @param spriteSheetName
     */
    function getSpriteSheet(spriteSheetName) {
        return sprites[spriteSheetName];
    }

    //return the module api
    return {
        "spriteSheet": {
            "get": getSpriteSheet,
            "create": newSpriteSheet,
            "update": updateSpriteSheet,
            "clear": removeSpriteSheet
        },
        "image": {
            "load": loadImage,
            "clear": removeImage
        },
        "addZoomLevel": addZoomLevel,
        "DATA": {
            "IMAGES": images,
            "SPRITES": sprites
        }
    }
});
