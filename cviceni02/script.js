/**
 * Funkce pro převod z hexadecimální reprezentace RGB do dekadické
 * @param {string} str Řetězec v hexa (např. #000000)
 * @returns {{red: number, green: number, blue: number}} Objekt s normalizovanými hodnotami RGB kanálů
 */
function Hex2RGB(str) {
    const red = parseInt(str.slice(1, 3), 16) / 255;
    const green = parseInt(str.slice(3, 5), 16) / 255;
    const blue = parseInt(str.slice(5, 7), 16) / 255;

    return { red, green, blue }
}

/**
 * Funkce realizující funkce "přes" pro kompozici dvou obrázků. Hodnoty jednotlivých kanálů jsou normalizované (rozsah 0 - 1)
 * @see https://en.wikipedia.org/wiki/Alpha_compositing#Description
 * @param {{red: number, green: number, blue: number, alpha: number}} background Pixel pozadí
 * @param {{red: number, green: number, blue: number, alpha: number}} foreground Pixel popředí
 */
function over(background, foreground) {

    invert = (1 - foreground.alpha)
    alpha = foreground.alpha + background.alpha * invert;
    red = ((foreground.red * foreground.alpha) + (background.red * background.alpha * invert)) / alpha;
    green = ((foreground.green * foreground.alpha) + (background.green * background.alpha * invert)) / alpha;
    blue = ((foreground.blue * foreground.alpha) + (background.blue * background.alpha * invert)) / alpha;

    return {red, green, blue, alpha}
}

// Callback function called, when file is "opened"
function handleFileSelect(item, elementName) {
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
                    const srcCanvas = document.getElementById(elementName);
                    const srcContext = srcCanvas.getContext("2d");

                    // Change size of canvas
                    srcCanvas.height = srcImg.height;
                    srcCanvas.width = srcImg.width;

                    srcContext.drawImage(srcImg, 0, 0);

                    const dstCanvas = document.getElementById("result");
                    dstCanvas.height = srcImg.height;
                    dstCanvas.width = srcImg.width;

                    const convertButton = document.getElementById("convert");
                    // Enabled button
                    convertButton.disabled = false;
                    // Add callback
                    convertButton.addEventListener('click', convertImage, false);
                    convertImage();
                }
            }
        })(files[i]);

        reader.readAsDataURL(files[i]);

        break;
    };
};

// Callback function called, when clicked at Convert button
function convertImage() {
    const personCanvas = document.getElementById("person");
    const personContext = personCanvas.getContext("2d");
    const canvasHeight = personCanvas.height;
    const canvasWidth = personCanvas.width;

    const personImageData = personContext.getImageData(0, 0, canvasWidth, canvasHeight);
    const backgroundImageData = document.getElementById("background").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    const logoImageData = document.getElementById("logo").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    const resultImageData = document.getElementById("result").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);

    const tolerance = Number(document.getElementById("chroma_threshold").value);
    document.getElementById("chroma_threshold_value").textContent = tolerance;

    convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData);

    document.getElementById("result").getContext("2d").putImageData(resultImageData, 0, 0);
};

// Function for converting raw data of image
function convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData) {
    const personData = personImageData.data;
    const backgroundData = backgroundImageData.data;
    const logoData = logoImageData.data;
    const resultData = resultImageData.data;
    const chroma = Hex2RGB(document.getElementById("chroma_key").value);
    const tolerance = Number(document.getElementById("chroma_threshold").value);

    for (let pixelIndex = 0; pixelIndex < personData.length; pixelIndex += 4) {

        const person = {
            red: personData[pixelIndex + 0] / 255,
            green: personData[pixelIndex + 1] / 255,
            blue: personData[pixelIndex + 2] / 255,
            alpha: personData[pixelIndex + 3] / 255
        }

        const background = {
            red: backgroundData[pixelIndex + 0] / 255,
            green: backgroundData[pixelIndex + 1] / 255,
            blue: backgroundData[pixelIndex + 2] / 255,
            alpha: backgroundData[pixelIndex + 3] / 255
        }

        const logo = {
            red: logoData[pixelIndex + 0] / 255,
            green: logoData[pixelIndex + 1] / 255,
            blue: logoData[pixelIndex + 2] / 255,
            alpha: logoData[pixelIndex + 3] / 255
        }

        const grayscale = (0.3 * logo.red + 0.59 * logo.green + 0.11 * logo.blue);

        // Převod loga do černobílé
        logo.red = grayscale;
        logo.green = grayscale;
        logo.blue = grayscale;

        // Predikáty pro vyklíčování pixelu
        const predicates = [
            Math.abs(person.red - chroma.red) < tolerance,
            Math.abs(person.green - chroma.green) < tolerance,
            Math.abs(person.blue - chroma.blue) < tolerance
        ]

        // Přidání vyklíčované postavy, pokud existuje
        if (predicates.every(v => v)) {
            person.alpha = 0
        }

        // Alpha Compositing - Over op.
        let resultWithoutLogo = over(background, person);
        let {red, green, blue, alpha} = over(resultWithoutLogo, logo)

        resultData[pixelIndex + 0] = red * 255;
        resultData[pixelIndex + 1] = green * 255;
        resultData[pixelIndex + 2] = blue * 255;
        resultData[pixelIndex + 3] = alpha * 255;
    }
}