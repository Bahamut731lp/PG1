/**
 * Surma je totální gigachad
 * https://surma.dev/things/ditherpunk/
*/

const DITHERING_MATRICES = {
    "bayer": [
        [0, 12, 3, 15],
        [8, 4, 11, 7],
        [2, 14, 1, 13],
        [10, 6, 9, 5]
    ],
    "halftone": [
        [1, 5, 9, 2],
        [8, 12, 13, 6],
        [4, 15, 14, 10],
        [0, 11, 7, 3]
    ]
}

const DIFFUSION_MATRICES = {
    "floyd-steinberg": (x, y, error, image) => {
        image.addToPixel(x + 1, y + 0, 7/16 * error)
        image.addToPixel(x - 1, y + 1, 3/16 * error)
        image.addToPixel(x + 0, y + 1, 5/16 * error)
        image.addToPixel(x + 1, y + 1, 1/16 * error)
    },
    "javis-judice-ninke": (x, y, error, image) => {
        image.addToPixel(x + 1, y + 0, 7/48 * error)
        image.addToPixel(x + 2, y + 0, 5/48 * error)

        image.addToPixel(x - 2, y + 1, 3/48 * error)
        image.addToPixel(x - 1, y + 1, 5/48 * error)
        image.addToPixel(x,     y + 1, 7/48 * error)
        image.addToPixel(x + 1, y + 1, 5/48 * error)
        image.addToPixel(x + 2, y + 1, 3/48 * error)

        image.addToPixel(x - 2, y + 2, 1/48 * error)
        image.addToPixel(x - 1, y + 2, 3/48 * error)
        image.addToPixel(x,     y + 2, 5/48 * error)
        image.addToPixel(x + 1, y + 2, 3/48 * error)
        image.addToPixel(x + 2, y + 2, 1/48 * error)
    },
    "bill-atkinson": (x, y, error, image) => {
        image.addToPixel(x + 1, y + 0, 1/8 * error)
        image.addToPixel(x + 2, y + 0, 1/8 * error)

        image.addToPixel(x - 1, y + 1, 1/8 * error)
        image.addToPixel(x,     y + 1, 1/8 * error)
        image.addToPixel(x + 1, y + 1, 1/8 * error)

        image.addToPixel(x,     y + 2, 1/8 * error)
    }
}

window.addEventListener("load", () => {
    document.querySelector("#value_k").addEventListener("input", convertImage)
    document.querySelector("#dither_matrix").addEventListener("change", convertImage)
    document.querySelector("#diffusion_matrix").addEventListener("change", convertImage)
});


// Callback function called, when file is "opened"
function handleFileSelect(item) {
    const files = item.files;

    console.log(files);

    for (const i = 0; i < files.length; i++) {
        console.log(files[i], files[i].name, files[i].size, files[i].type);

        // Only process image files.
        if (!files[i].type.match('image.*')) {
            continue;
        }

        const reader = new FileReader();

        // Closure for loading image to memory
        reader.onload = (function(file) {
            return function(evt) {

                const srcImg = new Image();
                srcImg.src = evt.target.result;

                srcImg.onload = function() {
                    
                    const canvases = ["src", "dest"];

                    for (const canvas of canvases) {
                        const element = document.getElementById(canvas);

                        element.width = srcImg.width;
                        element.height = srcImg.height;
                    }


                    const srcCanvas = document.getElementById("src");
                    const srcContext = srcCanvas.getContext("2d");

                    srcContext.drawImage(srcImg, 0, 0);

                    const convertButton = document.getElementById("convert");
                    const compareButton = document.getElementById("compare");


                    // Enabled button
                    convertButton.disabled = false;
                    compareButton.disabled = false;
                    
                    // Add callback
                    convertButton.addEventListener('click', () => {
                        const srcCanvas = document.getElementById("src");
                        const destCanvas = document.getElementById("dest");
                    
                        convertImage(srcCanvas, destCanvas);
                    }, false);

                    compareButton.addEventListener("click", addToComparison)
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

function addToComparison() {
    const srcCanvas = document.getElementById("src");
    const destCanvas = document.createElement("canvas");

    destCanvas.width = srcCanvas.width;
    destCanvas.height = srcCanvas.height;

    const [dithering, diffusion] = convertImage(srcCanvas, destCanvas);
    const k = document.querySelector("#value_k").value;
    const container = document.querySelector("#comparison");
    
    const div = document.createElement("div");
    div.insertAdjacentHTML("beforeend", `
        <div class="render_info">
            <strong>Maticový rozptyl</strong>
            <span>${dithering}</span>
            <strong>Distribuce chyby</strong>
            <span>${diffusion}</span> 
            <strong>Hodnota k</strong>
            <span>${k}</span> 
        </div>
    `);

    div.insertAdjacentElement("beforeend", destCanvas);

    container.append(div);
}

// Callback function called, when clicked at Convert button
function convertImage(srcCanvas, destCanvas) {
    const srcContext = srcCanvas.getContext("2d");
    const destContext = destCanvas.getContext("2d");

    const canvasHeight = srcCanvas.height;
    const canvasWidth = srcCanvas.width;
    const srcImageData = structuredClone(srcContext.getImageData(0, 0, canvasWidth, canvasHeight));

    const ditheringType = document.querySelector("#dither_matrix").value;
    const diffusionType = document.querySelector("#diffusion_matrix").value;

    convertImageData(srcImageData, ditheringType, diffusionType);
    destContext.putImageData(srcImageData, 0, 0);

    return [ditheringType, diffusionType]
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
function convertImageData(imgData, ditheringType, diffusionType) {
    console.log(`${new Date().toLocaleString()} - Omezuji barevnou paletu pomocí maticového rozptylu typu ${ditheringType} a distribuce chyby typu ${diffusionType}`)

    if (!(diffusionType in DIFFUSION_MATRICES)) {
        console.warn(`Typ ${diffusionType} nebyl nalezen v seznamu možných distribucí chyby.\nDistribuce chyby se tudíž nebude provádět`);
    }

    const M = DITHERING_MATRICES[ditheringType];
    const k = document.querySelector("#value_k").value;

    n = 4

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

            // Pokud se tam nějakou čirou náhodou dostane distribuce chyby, kterou neznáme
            // tak ji dělat nebudeme. Zas tak kritický to není.
            if (!(diffusionType in DIFFUSION_MATRICES)) continue
            DIFFUSION_MATRICES[diffusionType](x, y, error, image)
        }
    }	
}

