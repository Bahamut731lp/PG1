// Reference pro poslední ID snímku, abychom mohli popř. přerušit renderování při změně parametrů
let animationFrame = null;

/**
 * Funkce pro generování geometrie UV koule
 * @param {Number} radius Poloměr koule
 * @param {Number} latitudeBands Počet vertikálních "pásů"
 * @param {Number} longitudeBands Počet horizontálních "pásů"
 * @returns {{
 * vertices: Float32Array,
 * normals: Float32Array,
 * indices: Uint16Array,
 * uvs: Float32Array
 * }} Data o geometrii
 */
function createSphereGeometry(radius, latitudeBands, longitudeBands) {
    let vertices = [];
    let normals = [];
    let uvs = [];

    for (let lat = 0; lat <= latitudeBands; lat++) {
        const theta = (lat * Math.PI) / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longitudeBands; lon++) {
            const phi = (lon * 2 * Math.PI) / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            const u = 1 - (lon / longitudeBands);
            const v = 1 - (lat / latitudeBands);

            vertices.push(radius * x, radius * y, radius * z);
            normals.push(x, y, z);
            uvs.push(u, v);
        }
    }

    let indices = [];
    for (let lat = 0; lat < latitudeBands; lat++) {
        for (let lon = 0; lon < longitudeBands; lon++) {
            const first = lat * (longitudeBands + 1) + lon;
            const second = first + longitudeBands + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    vertices = new Float32Array(vertices);
    normals = new Float32Array(normals);
    indices = new Uint16Array(indices);
    uvs = new Float32Array(uvs);

    return { vertices, normals, uvs, indices };
}

function init(horizontal, vertical, radius) {
    var gl = document.getElementById("webgl_canvas").getContext("experimental-webgl");

    // Create vertex shader
    var vertexShaderCode = document.querySelector("#vs").textContent;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    // Create fragment shader
    var fragmentShaderCode = document.querySelector("#fs").textContent;
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    // Create program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create buffer for positions of vertices
    var posLoc = gl.getAttribLocation(program, "pos");
    gl.enableVertexAttribArray(posLoc);
    // Create buffer for position of vertices
    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    // Get sphere geometry
    const sphere = createSphereGeometry(radius, horizontal, vertical);

    gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    // Create buffer for UV coordinates
    var uvLoc = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uvLoc);
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.uvs, gl.STATIC_DRAW);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    var normalLoc = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(normalLoc);
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, true, 0, 0);


    // Create index buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

    // Create and load image used as texture
    var image = new Image();
    image.src = "./globe_texture.jpg";
    image.onload = function () {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        var samplerLoc = gl.getUniformLocation(program, "sampler");
        gl.uniform1i(samplerLoc, 0); // nula odpovídá gl.TEXTURE0
    };

    // Create matrix for model
    var modelMatrix = mat4.create();
    mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.8, 0.8, 0.8));
    var modelLocation = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

    // Create matrix for view
    var viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -5));
    var viewLocation = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);

    // Create matrix for projection
    var projMatrix = mat4.create();
    mat4.perspective(projMatrix, Math.PI / 3, 1, 0.1, 100);
    var projLocation = gl.getUniformLocation(program, "projMatrix");
    gl.uniformMatrix4fv(projLocation, false, projMatrix);

    // Create matrix for transformation of normal vectors
    var normalMatrix = mat3.create();
    var normalLocation = gl.getUniformLocation(program, "normalMatrix");
    mat3.normalFromMat4(normalMatrix, modelMatrix);
    gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

    // Enable depth test
    gl.enable(gl.DEPTH_TEST);

    // Create polyfill to make it working in the most modern browsers
    window.requestAnimationFrame = window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || function (cb) { setTimeout(cb, 1000 / 60); };

    var render = function () {
        mat4.rotateX(modelMatrix, modelMatrix, 0.005);
        mat4.rotateY(modelMatrix, modelMatrix, 0.01);
        gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

        mat3.normalFromMat4(normalMatrix, modelMatrix);
        gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

        gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);
        animationFrame = requestAnimationFrame(render);
    }

    render();
}

function passAndRender() {
    window.cancelAnimationFrame(animationFrame);

    const horizontal = document.getElementById("horizontalDensity");
    const vertical = document.getElementById("verticalDensity");
    const radius = document.getElementById("radius");

    const args = [horizontal, vertical, radius].map(v => Number(v.value) ?? 6)
    init(...args)
}

window.addEventListener("load", () => {
    passAndRender();

    const horizontal = document.getElementById("horizontalDensity");
    const vertical = document.getElementById("verticalDensity");
    const radius = document.getElementById("radius");

    horizontal.addEventListener("change", passAndRender);
    vertical.addEventListener("change", passAndRender);
    radius.addEventListener("change", passAndRender);
})