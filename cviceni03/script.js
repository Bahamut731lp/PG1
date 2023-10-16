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

const getColorIndicesForCoord = (x, y, width) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
};


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

class ImageManager {

    /**
     * Konstruktor třídy pro manipulaci s obrazem
     * @param {ImageData} imageData Obrazová data canvasu
     */
    constructor(imageData) {
        this.data = imageData.data
        this.width = imageData.width
        this.height = imageData.height
    }

    getPixelIndex(x, y) {
        return ((this.width * y) + x) * 4
    }

    getPixel(x, y) {
        const index = this.getPixelIndex(x, y);

        return {
            red: this.data[index],
            green: this.data[index + 1],
            blue: this.data[index + 2],
            alpha: this.data[index + 3]
        }
    }

    setPixel(x, y, red, green, blue, alpha) {
        if (x > this.width || y > this.height) return;
        
        const index = this.getPixelIndex(x, y);

        this.data[index] = red ?? this.data[index]
        this.data[index + 1] = green ?? this.data[index + 1]
        this.data[index + 2] = blue ?? this.data[index + 2]
        this.data[index + 3] = alpha ?? this.data[index + 3]
    }

    addToPixel(x, y, value) {
        if (x > this.width || y > this.height) return;

        const index = this.getPixelIndex(x, y);

        this.data[index] += value
        this.data[index + 1] += value
        this.data[index + 2] += value
        this.data[index + 3] += value
    }
}

// Function for converting raw data of image
function convertImageData(imgData) {
    let M = [
        [0, 12, 3, 15],
        [8, 4, 11, 7],
        [2, 14, 1, 13],
        [10, 6, 9, 5]
    ]

    n = 4
    k = 1/16;

    const image = new ImageManager(imgData)

    // Go through the image using x,y coordinates
    for(let y = 0; y < imgData.height; y++) {
        for(let x = 0; x < imgData.width; x++) {

            const {red, green, blue} = image.getPixel(x, y)
            
            // Konverze RGB na BT.601 Grayscale
            v_in = 0.229 * red + 0.587 * green + 0.114 * blue;
            // Hranice pro prahování v rozsahu 0 až 1
            normalized_threshold = k * M[y % n][x % n];

            // Bílá
            max = 255
            // Černá
            min = 0

            // Hodnota výstupního pixelu V_out 
            v_out = (v_in / 255 > normalized_threshold) ? max : min;
            // Nastavení prahované hodnoty aktuálně zpracovávaného pixelu
            image.setPixel(x, y, v_out, v_out, v_out, 255)
            
            //Distribuce zaokrouhlovací chyby
            //V prezentaci je to sice obráceně, ale to mi jinak udělá nesmysly
            //I tak nejsem schopný na 100% napodobit referenční obrázek. Idk man.
            error = v_in - v_out;
            image.addToPixel(x + 1, y + 0, 7/16 * error)
            image.addToPixel(x - 1, y + 1, 3/16 * error)
            image.addToPixel(x + 0, y + 1, 5/16 * error)
            image.addToPixel(x + 1, y + 1, 1/16 * error)
        }
    }	
}

