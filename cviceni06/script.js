window.onload = function() {
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
	// We need many vertices, because each vertex need
	// own value of normal and UV
	var vertices = [
		// Bottom face
		-1.0, -1.0, -1.0,	// 0
		 1.0, -1.0, -1.0,	// 1
		 1.0,  1.0, -1.0,	// 2
		-1.0,  1.0, -1.0,	// 3
		// Left face
		-1.0, -1.0, -1.0,	// 4
		 1.0, -1.0, -1.0,	// 5
		 1.0, -1.0,  1.0,	// 6
		-1.0, -1.0,  1.0,	// 7
		// Front face
		 1.0, -1.0, -1.0,	// 8
		 1.0,  1.0, -1.0,	// 9
		 1.0,  1.0,  1.0,	// 10
		 1.0, -1.0,  1.0,	// 11
		// Right face
		 1.0,  1.0, -1.0,	// 12
		-1.0,  1.0, -1.0,	// 13
		-1.0,  1.0,  1.0,	// 14
		 1.0,  1.0,  1.0,	// 15
		// Back face
		-1.0, -1.0, -1.0,	// 16
		-1.0, -1.0,  1.0,	// 17
		-1.0,  1.0,  1.0,	// 18
		-1.0,  1.0, -1.0,	// 19
		// Top face
		-1.0, -1.0,  1.0,	// 20
		 1.0, -1.0,  1.0,	// 21
		 1.0,  1.0,  1.0,	// 22
		-1.0,  1.0,  1.0	// 23
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

	// Create buffer for UV coordinates
	var uvLoc = gl.getAttribLocation(program, "uv");
	gl.enableVertexAttribArray(uvLoc);
	var uvBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	uvs = [
		// Bottom face
		 0.0,  0.0,
		 1.0,  0.0,
		 1.0,  1.0,
		 0.0,  1.0,
		// Left face
		 0.0,  0.0,
		 1.0,  0.0,
		 1.0,  1.0,
		 0.0,  1.0,
		// Front
		 0.0,  0.0,
		 1.0,  0.0,
		 1.0,  1.0,
		 0.0,  1.0,
		// Right face
		 0.0,  0.0,
		 1.0,  0.0,
		 1.0,  1.0,
		 0.0,  1.0,
		// Back face
		 0.0,  0.0,
		 1.0,  0.0,
		 1.0,  1.0,
		 0.0,  1.0,
		// Top face
		 0.0,  0.0,
		 1.0,  0.0,
		 1.0,  1.0,
		 0.0,  1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
	gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

	// Create buffer for vertex normals
	var normalLoc = gl.getAttribLocation(program, "normal");
	gl.enableVertexAttribArray(normalLoc);
	var normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	normals = [
		// Bottom face
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		// Left face
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		// Front
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		// Right face
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		// Back face
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		// Top face
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, true, 0, 0);

	// Create index buffer
	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	var indices = [
		 0,  1,  2,	// 0
		 0,  2,  3,
		 4,  5,  6,	// 1
		 4,  6,  7,
		 8,  9, 10,	// 2
		 8, 10, 11,
		12, 13, 14,	// 3
		12, 14, 15,
		16, 17, 18,	// 4
		16, 18, 19,
		20, 21, 22,	// 5
		20, 22, 23
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

	// Create and load image used as texture
	var image = new Image();
	image.src = "./wood_texture_simple.png";
	image.onload = function() {
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
	mat4.perspective(projMatrix, Math.PI/3, 1, 0.1, 100);
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
		|| function(cb) { setTimeout(cb, 1000/60); };

	var render = function() {
		mat4.rotateX(modelMatrix, modelMatrix, 0.005);
		mat4.rotateY(modelMatrix, modelMatrix, 0.01);
		gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

		mat3.normalFromMat4(normalMatrix, modelMatrix);
		gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

		gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
		requestAnimationFrame(render);
	}

	render();
}