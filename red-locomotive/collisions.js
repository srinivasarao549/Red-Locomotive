RedLocomotive('collisions', function(engine, options) {

    var canvas = jQuery('<canvas></canvas>'),
        context = canvas[0].getContext('2d');

	function checkForCollision(args) {

		if(!args.length) {
			return false;
		}

		var subject,
			obstacle,
			sX,
			sY,
			oX,
			oY,
			sSX,
			sSY,
			oSX,
			oSY,
			pixelData,
			p,
			pA;

		for (var eI = 0; eI < args.length; eI += 1) {
			subject = args[eI];

			canvas[0].width = subject[0].width;
			canvas[0].height = subject[0].height;
			canvas.width(subject[0].width);
			canvas.height(subject[0].height);

			for (var oI = 0;  oI < args.length; oI += 1) {
				if(oI === eI) {
					continue;
				}
				obstacle = args[oI];

				sX = subject[1] || subject[0].x;
				sY = subject[2] || subject[0].y;
				sSX = subject[3] || subject[0].spritePos[0];
				sSY = subject[4] || subject[0].spritePos[1];

				oX = obstacle[1] || obstacle[0].x;
				oY = obstacle[2] || obstacle[0].y;
				oSX = obstacle[3] || obstacle[0].spritePos[0];
				oSY = obstacle[4] || obstacle[0].spritePos[1];

				if (
					(sX < oX + obstacle[0].width && sX + subject[0].width > oX) &&
					(sY < oY + obstacle[0].height && sY + subject[0].height > oY)
				) {

					engine.canvas.applyElement(obstacle[0], context, oX, oY, oSX, oSY);
					context.globalCompositeOperation = 'source-in';
					engine.canvas.applyElement(subject[0], context, sX, sY, sSX, sSY);

					pixelData = context.getImageData(0, 0, subject.width, subject.height).data;

					for (p = 0; p < pixelData.length; p += 4) {
						pA = pixelData[p + 3];
						if(pA >= 255) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	return {
		"checkForCollision": checkForCollision
	}

});