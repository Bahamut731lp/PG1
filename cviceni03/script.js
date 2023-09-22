// Callback function called, when file is "opened"
function handleFileSelect(item) {
	var files = item.files;

	console.log(files);

	for (var i = 0; i < files.length; i++) {
		console.log(files[i], files[i].name, files[i].size, files[i].type);

		// Only process image files.
		if (!files[i].type.match('image.*')) {
			continue;
		}

		var reader = new FileReader();

		// Closure for loading image to memory
		reader.onload = (function(file) {
			return function(evt) {

				var srcImg = new Image();
				srcImg.src = evt.target.result;

				srcImg.onload = function() {
					var srcCanvas = document.getElementById("src");
					var srcContext = srcCanvas.getContext("2d");

					// Change size of canvas
					srcCanvas.height = srcImg.height;
					srcCanvas.width = srcImg.width;

					srcContext.drawImage(srcImg, 0, 0);

					var convertButton = document.getElementById("convert");
					// Enabled button
					convertButton.disabled = false;
					// Add callback
					convertButton.addEventListener('click', convertImage, false);
				}
			}
		})(files[i]);

		reader.readAsDataURL(files[i]);

		break;
	}
}


// Callback function called, when clicked at Convert button
function convertImage() {
	var srcCanvas = document.getElementById("src");
	var srcContext = srcCanvas.getContext("2d");
	var canvasHeight = srcCanvas.height;
	var canvasWidth = srcCanvas.width;

	var srcImageData = srcContext.getImageData(0, 0, canvasWidth, canvasHeight);

	convertImageData(srcImageData);

	srcContext.putImageData(srcImageData, 0, 0);
}


// Function for converting raw data of image
function convertImageData(imgData) {
	var rawData = imgData.data;

	// Go through the image using x,y coordinates
	var pixelIndex, red, green, blue, alpha;
	for(var y = 0; y < imgData.height; y++) {
		for(var x = 0; x < imgData.width; x++) {
			pixelIndex = ( (imgData.width * y) + x) * 4
			red   = rawData[pixelIndex + 0];
			green = rawData[pixelIndex + 1];
			blue  = rawData[pixelIndex + 2];
			alpha = rawData[pixelIndex + 3];

			// Do magic at this place :-)

			rawData[pixelIndex + 0] = 255 - red;
			rawData[pixelIndex + 1] = 255 - green;
			rawData[pixelIndex + 2] = 255 - blue;
			rawData[pixelIndex + 3] = alpha;
		}
	}	
}

