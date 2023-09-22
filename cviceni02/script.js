// Callback function called, when file is "opened"
function handleFileSelect(item, elementName) {
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
                    var srcCanvas = document.getElementById(elementName);
                    var srcContext = srcCanvas.getContext("2d");

                    // Change size of canvas
                    srcCanvas.height = srcImg.height;
                    srcCanvas.width = srcImg.width;

                    srcContext.drawImage(srcImg, 0, 0);

                    var dstCanvas = document.getElementById("result");
                    dstCanvas.height = srcImg.height;
                    dstCanvas.width = srcImg.width;

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
    };
};


// Callback function called, when clicked at Convert button
function convertImage() {
    var personCanvas = document.getElementById("person");
    var personContext = personCanvas.getContext("2d");
    var canvasHeight = personCanvas.height;
    var canvasWidth = personCanvas.width;

    var personImageData = personContext.getImageData(0, 0, canvasWidth, canvasHeight);
    var backgroundImageData = document.getElementById("background").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var logoImageData = document.getElementById("logo").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var resultImageData = document.getElementById("result").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);

    convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData);

    document.getElementById("result").getContext("2d").putImageData(resultImageData, 0, 0);
};

// Function for converting raw data of image
function convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData) {
    var personData = personImageData.data;
    var backgroundData = backgroundImageData.data;
    var logoData = logoImageData.data;
    var resultData = resultImageData.data;

    // Go through the image using x,y coordinates
    var red, green, blue, alpha;
    for (var pixelIndex = 0; pixelIndex < personData.length; pixelIndex += 4) {
        red = (personData[pixelIndex + 0] + backgroundData[pixelIndex + 0] + logoData[pixelIndex + 0]) / 3;
        green = (personData[pixelIndex + 1] + backgroundData[pixelIndex + 1] + logoData[pixelIndex + 1]) / 3;
        blue = (personData[pixelIndex + 2] + backgroundData[pixelIndex + 2] + logoData[pixelIndex + 2]) / 3;
        alpha = (personData[pixelIndex + 3] + backgroundData[pixelIndex + 3] + logoData[pixelIndex + 3]) / 3;

        // Do magic at this place
        //console.log(red, green, blue, alpha);

        resultData[pixelIndex + 0] = red;
        resultData[pixelIndex + 1] = green;
        resultData[pixelIndex + 2] = blue;
        resultData[pixelIndex + 3] = alpha;
    }
}