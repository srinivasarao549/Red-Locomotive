/*!
 * Red Locomotive Canvas Module
 * http://robertwhurst.github.com/Red-Locomtive/
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */
RedLocomotive('bitmaps', function(){
    "use strict"

	/**
	 * newBitmap - Creates a new Red Locomotive bitmap width dimensions and image data.
	 * @param width {int} The bitmap width
	 * @param height {int} The bitmap height
	 * @param image {object} An image or bitmap object to copy from
	 * @param dX {int} The x position to draw the image data from
	 * @param dY {int} The y position to draw the image data from
	 */
	function newBitmap(width, height, image, sX, sY, sW, sH, dX, dY, dW, dH) {

		var canvas = jQuery('<canvas></canvas>'),
			context = canvas[0].getContext('2d');

		if(width) {
			canvas[0].width = width;
		}
		if(height) {
			canvas[0].height = height;
		}

		if(image) {

			sX = sX || 0;
			sY = sY || 0;
			sW = sW || image.width;
			sH = sH || image.height;

			dX = dX || 0;
			dY = dY || 0;
			dW = dW || image.width;
			dH = dH || image.height;

			context.drawImage(image, sX, sY, sW, sH, dX, dY, dW, dH);
		}

		return {
			"canvas": canvas,
			"context": context
		};

	}

	/**
	 * trim - Trims white space margins from a bitmap
	 * @param bitmap {object} A Red Locomotive bitmap
	 */
	function trim(bitmap) {

		var pixels = dump(bitmap),
			topLeft, topRight,
			bottomLeft;

		for(var pI = 0; pI < pixels.length; pI += 1) {

			var alpha = pixels[pI][3],
				y = Math.floor(pI / bitmap.canvas[0].width),
				x = pI - (bitmap.canvas[0].width * y);

			//if the pixel is transparent
			if(alpha >= 255) {

				//Set the first opaque pixel as the start point
				if(!topLeft) { topLeft = [x, y]; }
				if(!topRight) { topRight = [x, y]; }
				if(!bottomLeft) { bottomLeft = [x, y]; }

				//TOP LEFT
				if(x < topLeft[0]) {
					topLeft[0] = x;
				}

				//TOP RIGHT
				if(x > topRight[0]) {
					topRight[0] = x;
				}

				//BOTTOM LEFT
				if(y > bottomLeft[1]) {
					bottomLeft[1] = y;
				}
				if(x < bottomLeft[0]) {
					bottomLeft[0] = x;
				}
			}
		}

		//get the trimmed area width and height
		var width = topRight[0] - topLeft[0],
			height = bottomLeft[1] - topLeft[1];

		//apply the trimmed data to a new bitmap and return it
		return newBitmap(width, height, bitmap.canvas[0], topLeft[0], topLeft[1], width, height, 0, 0, width, height);

	}

	/**
	 * slice - Chops a bitmap into bits of a given size starting from the top left.
	 * @param bitmap {object} A Red Locomotive bitmap
	 * @param width {int} The width of each slice
	 * @param height {int} The height of each slice
	 */
	function slice(bitmap, width, height) {

		//calculate the rows and columns
		var rows = Math.floor(bitmap.canvas[0].width / width) || 1,
			columns = Math.floor(bitmap.canvas[0].height / height) || 1,
			bitmaps = [];

		if(rows < 2 && columns < 2) {
			return [[bitmap]];
		}

		//get each piece
		for (var rI = 0; rI < rows; rI += 1) {
			if(!bitmaps[rI]) { bitmaps[rI] = []; }

			for (var cI = 0; cI < columns; cI += 1) {

				var x = rI * width,
					y = cI * height;

				//apply the image
				bitmaps[rI][cI] = newBitmap(width, height, bitmap.canvas[0], x, y, width, height, 0, 0, width, height);

			}
		}

		return bitmaps;
	}

	/**
	 * dump - Dumps all the pixel data grouped by pixel
	 * @param bitmap {object} A Red Locomotive bitmap
	 */
	function dump(bitmap) {
		var imageData = bitmap.context.getImageData(0, 0, bitmap.canvas[0].width, bitmap.canvas[0].height).data,
			pixels = [];

		for(var pI = 0; pI < imageData.length; pI += 4) {

			var red = imageData[pI],
				blue = imageData[pI + 1],
				green = imageData[pI + 2],
				alpha = imageData[pI + 3],
				pixel = [red, blue, green, alpha];

			pixels.push(pixel);
		}

		return pixels;
	}

	/**
	 * isBlank - Checks to the if a Red Locomotive bitmap is blank
	 * @param bitmap {object} A Red Locomotive bitmap
	 */
	function isBlank(bitmap) {

		//trim the bitmap
		bitmap = trim(bitmap);

		//dump the pixels
		var pixels = dump(bitmap);

		//loop through the pixels looking for a translucent or opaque pixel
		for(var pI = 0; pI < pixels; pI += 1) {

			//if a translucent or opaque pixel is found return false
			if(pixels[pI][3] > 0) {
				return false;
			}
		}

		//no translucent or opaque pixels were found, return true
		return true;

	}

	function getPointData(bitmap, x, y) {

		if(x >= 0 && y >= 0 && x < bitmap.canvas[0].width && y < bitmap.canvas[0].height){

			x = Math.floor(x);
			y = Math.floor(y);

			var collisionMaskPixelData = dump(bitmap),
				currentPixel = x + (y * bitmap.canvas[0].width);

			return collisionMaskPixelData[currentPixel];
		}
		return false;
	}

	return {
		"bitmap": {
			"create": newBitmap,
			"trim": trim,
			"slice": slice,
			"dump": dump,
			"isBlank": isBlank,
			"pointData": getPointData
		}
	}
});