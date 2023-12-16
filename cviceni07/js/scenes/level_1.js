async function level_1() {
	let camera, scene, parent, obj, cube, box, renderer, boundaries, left_paddle;

	let dy = 0.01;
	let dx = 0.02;

	init();
	animate();

	function init() {
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 5.0;

		// Create scene hierarchy
		scene = new THREE.Scene();
		parent = new THREE.Object3D();
		obj = new THREE.Object3D();
		box = new THREE.Object3D();
		parent.add(obj);
		scene.add(parent);

        left_paddle = new THREE.Object3D();

		// Add helper object (bounding box)
		let bounding_box_geometry = new THREE.BoxGeometry( 10.01, 5.01, 1.01 );
		let bounding_box_mesh = new THREE.Mesh(bounding_box_geometry, null);
		let bbox = new THREE.BoxHelper( bounding_box_mesh);
        boundaries = new THREE.Box3().setFromObject(bbox)
		scene.add(bbox);

		// Instantiate a loader
		let loader = new THREE.TextureLoader();

		// Load a resource
		loader.load(
			// URL of texture
			'textures/companion_cube.jpg',
			// Function when resource is loaded
			function ( texture ) {
				// Create objects using texture
				let cube_geometry = new THREE.BoxGeometry( 1, 1, 1 );
				let tex_material = new THREE.MeshBasicMaterial({map: texture});

				cube = new THREE.Mesh(cube_geometry, tex_material);
				obj.add(cube);

				// Call render here, because loading of texture can
				// take lot of time
				render();
			},
			// Function called when download progresses
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// Function called when download errors
			function ( xhr ) {
				console.log( 'An error happened' );
			}
		);

		// renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		//controls.handleResize();
		render();
	}

	function animate() {
		requestAnimationFrame( animate );

        /**
         * Souřadnice jednotlivých stran kostky na 
         */
        const cubeFacePositions = {
            top: cube.position.y + cube.geometry.parameters.height / 2,
            bottom: cube.position.y - cube.geometry.parameters.height / 2,
            left: cube.position.x - cube.geometry.parameters.width / 2,
            right: cube.position.x + cube.geometry.parameters.width / 2
        }


        // Vertikální kolize
        if (cubeFacePositions.top >= boundaries.max.y || cubeFacePositions.bottom <= boundaries.min.y) {
            dy = -dy;
        };
		
        cube.position.y += dy;
        
        // Horizontální kolize
        if (cubeFacePositions.left <= boundaries.min.x || cubeFacePositions.right >= boundaries.max.x) {
			dx = -dx;
		};

		cube.position.x += dx;

		// Update position of camera
		// Render scene
		render();
	}

	function render() {
		renderer.render( scene, camera );
	}
}

export default level_1;