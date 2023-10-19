const CHANNEL_COLOURS = {
    red: { red: 255, green: 0, blue: 0, alpha: 255},
    green: { red: 0, green: 255, blue: 0, alpha: 255},
    blue: { red: 0, green: 0, blue: 255, alpha: 255},
    gray: { red: 0, green: 0, blue: 0, alpha: 255}
}

let cache = null;

window.addEventListener("load", () => {
    document.getElementById("channel")?.addEventListener("change", render);
    document.getElementById("outlined")?.addEventListener("change", render);

    document.getElementById("red_transparency")?.addEventListener("change", render);
    document.getElementById("green_transparency")?.addEventListener("change", render);
    document.getElementById("blue_transparency")?.addEventListener("change", render);
    document.getElementById("gray_transparency")?.addEventListener("change", render);
});

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
                    var photoCanvas = document.getElementById("fotoaparat");
                    
                    // Change size of canvas
                    
                    [srcCanvas, histCanvas, photoCanvas].forEach(v => {
                        v.width = srcImg.width;
                        v.height = srcImg.height;
                    });
                    
                    srcContext.drawImage(srcImg, 0, 0);

                    render();
                }
            }
        })(files[i]);

        reader.readAsDataURL(files[i]);

        break;
    };
};

function render(shallow = true) {
    var srcCanvas = document.getElementById("src");
    var srcContext = srcCanvas.getContext("2d", {willReadFrequently: true});
    var histCanvas = document.getElementById("histogram");
    var histContext = histCanvas.getContext("2d", {willReadFrequently: true});
    var photoCanvas = document.getElementById("fotoaparat");
    var photoContext = photoCanvas.getContext("2d", {willReadFrequently: true});

    var canvasHeight = srcCanvas.height;
    var canvasWidth = srcCanvas.width;
    var srcImageData = srcContext.getImageData(0, 0, canvasWidth, canvasHeight);

    histContext.clearRect(0, 0, histCanvas.width, histCanvas.height);
    photoContext.clearRect(0, 0, photoCanvas.width, histCanvas.height);

    var histHeight = histCanvas.height;
    var histWidth = histCanvas.width;
    var histImageData = histContext.getImageData(0, 0, histWidth, histHeight);

    var photoImageData = photoContext.getImageData(0, 0, photoCanvas.width, photoCanvas.height);

    let selected = document.getElementById("channel")?.value;
    let outlined = document.getElementById("outlined")?.checked;
    let transparency = {
        red: document.getElementById("red_transparency")?.value,
        green: document.getElementById("green_transparency")?.value,
        blue: document.getElementById("blue_transparency")?.value,
        gray: document.getElementById("gray_transparency")?.value,
    }   

    /**
        Sanity checks 
    */

    //Jestli je cokoliv nám dá select validní barevný kanál
    if (!(selected in CHANNEL_COLOURS)) {
        console.warn(`${selected} není platný kanál k vykreslení. Vykresluje se hodnota jasu.`);
        selected = "gray";
    }

    for (const channel in transparency) {
        if (typeof transparency[channel] != "number") {
            transparency[channel] = Number(transparency[channel]);
        }

        if (isNaN(transparency[channel])) {
            transparency[channel] = 1;
            continue;
        }

        if (!isFinite(transparency[channel])) transparency[channel] = 1;
        if (transparency[channel] < 0) transparency[channel] = 0;
        if (transparency[channel] > 1) transparency[channel] = 1;
    }


    //Actuall výpočet histogramů a vykreslení
    const singleChannelCanvas = new ImageManager(histImageData);
    const allChannelsCanvas = new ImageManager(photoImageData);
    let histograms = null;

    if (shallow && cache) {
        histograms = cache;
    }
    else {
        histograms = getHistogramForSource(srcImageData);
    }

    cache = histograms;
    histograms[selected].draw(singleChannelCanvas, CHANNEL_COLOURS[selected], AlphaCompositing.over);

    for (const channel in CHANNEL_COLOURS) {
        const colour = CHANNEL_COLOURS[channel];
        const normalizedPairs = Object.entries(colour).map(([key, value]) => [key, value / 255]);
        const normalized = Object.fromEntries(normalizedPairs);
        normalized.alpha = transparency[channel];

        histograms[channel].draw(allChannelsCanvas, normalized, AlphaCompositing.over, outlined);
    }

    histContext.putImageData(histImageData, 0, 0);
    photoContext.putImageData(photoImageData, 0, 0);
}

/**
 * Třída pro manipulaci s obrázkem na plátně
 */
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
             * Funkce pro nastavení hodnot RGBA kanálů na konkrétním pixelu
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
/**
 * Třída zastřešující operace pro prolínání obrázků
 */
class AlphaCompositing {
    /**
     * Funkce realizující funkce "přes" pro kompozici dvou obrázků. Hodnoty jednotlivých kanálů jsou normalizované (rozsah 0 - 1)
     * @see https://en.wikipedia.org/wiki/Alpha_compositing#Description
     * @param {{red: number, green: number, blue: number, alpha: number}} background Pixel pozadí
     * @param {{red: number, green: number, blue: number, alpha: number}} foreground Pixel popředí
     */
    static over(background, foreground) {
        const invert = (1 - foreground.alpha)
        const alpha = foreground.alpha + background.alpha * invert;

        if (alpha < 0) debugger;
        const red = ((foreground.red * foreground.alpha) + (background.red * background.alpha * invert)) / alpha;
        const green = ((foreground.green * foreground.alpha) + (background.green * background.alpha * invert)) / alpha;
        const blue = ((foreground.blue * foreground.alpha) + (background.blue * background.alpha * invert)) / alpha;

        return {red, green, blue, alpha}
    }
}
/**
 * Rozhraní pro práci s histogramem
 */
class Histogram {
    constructor(size = 256) {
        // Vytvoření histogramu
        // Vytvoří se prázné pole o 256 položkách, které se pak transformuje na páry [index, 0]
        // Tyhle dvojice se pak přes fromEntries převedou na slovník, kde klíč je index a value je 0
        this.data = Object.fromEntries(Array(size).fill(null).map((_, index) => [index, 0]));
        this.size = size;
    }

    /**
     * Funkce pro přidání hodnoty do skupiny v histogramu
     * @param {number} bin Index skupiny, do kterého se má hodnota value přičíst
     * @param {number} value Hodnota k přičtění
     */
    add(bin, value) {
        // Sanity checks
        if (bin < 0 || bin >= this.size) {
            console.debug(`Index skupiny histogramu ${bin} je větší než jeho velikost (${this.size})`);
            return false;
        };

        if (!isFinite(value)) {
            console.debug(`Hodnota ${value} není konečné číslo.`);
            return false;
        }

        // Přičtení hodnoty do skupiny histogramu
        this.data[bin] += value;
    }

    /**
     * 
     * @param {ImageManager} target 
     * @param {{red: number, green: number, blue: number, alpha: number}} color 
     * @param {AlphaCompositing[keyof AlphaCompositing]} compositingFn
     * @returns 
     */
    draw(target, color = {red: 0, blue: 0, green: 0, alpha: 255}, compositingFn, outline = false) {
        // Sanity checks
        if (typeof color != "object") {
            console.debug(`Parametr 'color' není objekt (${JSON.stringify(color)})`);
            return false;
        }

        if (["red", "blue", "green", "alpha"].some(v => !(v in color))) {
            console.debug(`Parametr color nemá všechny potřebné klíče (${JSON.stringify(color)})`);
            return false;
        }

        if (!Object.values(color).every(v => isFinite(v))) {
            console.debug(`Některá z hodnot parametru color není konečné číslo.`);
            console.debug(color, Object.fromEntries(Object.entries(color).map(([key, value]) => [key, typeof value])));
            return false;
        }
        
        const max = Math.max(...Object.values(this.data));
        const pixelsPerBin = Math.floor(target.width / this.size);

        //Vykreslení histogramu
        for(let x = 0; x < target.width; x++) {
            //Protože potřebujeme 256 hodnot roztáhnout na 512px,
            //podělíme index sloupce s počtem pixelů na sloupec a zaokrouhlíme dolů
            const index = Math.round(x / pixelsPerBin);
            const previousIndex = Math.round(Math.max(0, x - 1) / pixelsPerBin);

            const normalizedColumnHeight = Math.floor(this.data[index] / max * target.height);
            const startHeight = Math.floor(this.data[previousIndex] / max * target.height);

            let start = 0;
            let end =  Math.max(normalizedColumnHeight, startHeight);

            if (outline) start = Math.max(Math.min(normalizedColumnHeight, startHeight) - 2, 0);

            for (let y = start; y < end; y++) {
                const original = target.pixel(x, target.height - 1 - y).get();
                const normalized = Object.fromEntries(Object.entries(original).map(([color, value]) => [color, value / 255]));
                const merged = compositingFn(normalized, color);

                target.pixel(x, target.height - 1 - y).set(merged.red * 255, merged.green * 255, merged.blue * 255, merged.alpha * 255);
            }
        }
    }
}

function getHistogramForSource(srcImageData) {
    const image = new ImageManager(srcImageData);

    const histograms = {
        red: new Histogram(256),
        green: new Histogram(256),
        blue: new Histogram(256),
        gray: new Histogram(256)
    }

    // Průchod zdrojového obrázku pro nalezení hodnot histogramu
    for(let y = 0; y < image.height; y++) {
        for(let x = 0; x < image.width; x++) {    
            const {red, green, blue} = image.pixel(x, y).get();
            const brightness = Math.round(0.229 * red + 0.587 * green + 0.114 * blue);

            histograms.red.add(red, 1);
            histograms.green.add(green, 1);
            histograms.blue.add(blue, 1);
            histograms.gray.add(brightness, 1);
        }
    }

    return histograms;
};

