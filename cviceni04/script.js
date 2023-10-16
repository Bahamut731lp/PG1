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
                    var histCanvas = document.getElementById("histogram");
                    var histContext = histCanvas.getContext("2d");
                    
                    // Change size of canvas
                    srcCanvas.height = histCanvas.height = srcImg.height;
                    srcCanvas.width = histCanvas.width = srcImg.width;

                    srcContext.drawImage(srcImg, 0, 0);

                    var canvasHeight = srcCanvas.height;
                    var canvasWidth = srcCanvas.width;
                    var srcImageData = srcContext.getImageData(0, 0, canvasWidth, canvasHeight);

                    var histHeight = histCanvas.height;
                    var histWidth = histCanvas.width;
                    var histImageData = histContext.getImageData(0, 0, histWidth, histHeight);

                    convertImageData(srcImageData, histImageData);

                    histContext.putImageData(histImageData, 0, 0);
                }
            }
        })(files[i]);

        reader.readAsDataURL(files[i]);

        break;
    };
};

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

    /**
     * Funkce pro přístup k pixelu na konkrétních souřadnicích
     * @param {number} x - Horizontální souřadnice
     * @param {number} y - Vertikální souřadnice
     */
    pixel(x, y) {
        const index = this.getPixelIndex(x, y)

        return {
            /**
             * Funkce pro získání hodnot RGBA kanálů pixelu na souřadnicích
             * @returns {{red: number, green: number, blue: number, alpha: number}} Slovník s hodnotami RGBA kanálů
             */
            get: () => ({
                red: this.data[index],
                green: this.data[index + 1],
                blue: this.data[index + 2],
                alpha: this.data[index + 3]
            }),
            /**
             * 
             * @param {number} r - Hodnota červeného kanálu
             * @param {number} g - Hodnota zeleného kanálu
             * @param {number} b - Hodnota modrého kanálu
             * @param {number} a - Hodnota alpha kanálu
             */
            set: (r, g, b, a) => {
                this.data[index] = r ?? this.data[index]
                this.data[index + 1] = g ?? this.data[index + 1]
                this.data[index + 2] = b ?? this.data[index + 2]
                this.data[index + 3] = a ?? this.data[index + 3]
            }
        }
    }
}

// Function for converting raw data of image
function convertImageData(srcImageData, histImageData) {
    const image = new ImageManager(srcImageData);
    const hist = new ImageManager(histImageData);
    // Vytvoření histogramu
    // Vytvoří se prázné pole o 256 položkách, které se pak transformuje na páry [index, 0]
    // Tyhle dvojice se pak přes fromEntries převedou na slovník, kde klíč je index a value je 0
    const histogram = Object.fromEntries(Array(256).fill(null).map((_, index) => [index, 0]));

    // Průchod zdrojového obrázku pro nalezení hodnot histogramu
    for(let y = 0; y < image.height; y++) {
        for(let x = 0; x < image.width; x++) {    
            const {red, green, blue} = image.pixel(x, y).get();
            const brightness = Math.round(0.229 * red + 0.587 * green + 0.114 * blue);

            histogram[brightness] += 1;
        }
    }

    // Canvas s histogramem musí být minimálně 256px, jinak to nepůjde
    const max = Math.max(...Object.values(histogram));
    const pixelsPerColumn = Math.floor(hist.width / 256);

    //Vykreslení histogramu
    for(let x = 0; x < hist.width; x++) {
        //Protože potřebujeme 256 hodnot roztáhnout na 512px,
        // podělíme index sloupce s počtem pixelů na sloupec a zaokrouhlíme dolů
        const index = Math.round(x / pixelsPerColumn);
        const normalizedColumnHeight = Math.floor(histogram[index] / max * hist.height);

        for (let y = 0; y < normalizedColumnHeight; y++) {
            hist.pixel(x, hist.height - y).set(0, 0, 0, 255)
        }
    }
};

