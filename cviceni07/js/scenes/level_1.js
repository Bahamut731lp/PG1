async function level_1() {
    let stats;

    console.log(THREE)

    let camera, scene, parent, obj, cube, box, renderer, boundaries, left_paddle;
    let dy = 0.01;
    let dx = 0.02;

    init();
    animate();

    async function init() {
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.z = 5.0;

        // Create scene hierarchy
        scene = new THREE.Scene();
        parent = new THREE.Object3D();
        obj = new THREE.Object3D();
        box = new THREE.Object3D();
        parent.add(obj);
        scene.add(parent);

        scene.background = new THREE.Color(0xabcdef);

        left_paddle = new THREE.Object3D();

        // Add helper object (bounding box)
        let bounding_box_geometry = new THREE.BoxGeometry( 10.01, 5.01, 1.01 );
        let bounding_box_mesh = new THREE.Mesh(bounding_box_geometry, null);
        let bbox = new THREE.BoxHelper( bounding_box_mesh);
        boundaries = new THREE.Box3().setFromObject(bbox)
        scene.add(bbox);

        console.log(boundaries, boundaries.size(new THREE.Vector3()))

        var pointLight = new THREE.PointLight(0xffffff, 1); // 0xffffff is the color (white), 1 is the intensity
        pointLight.position.set(0, 0, 5); // Set the position of the light
        scene.add(pointLight);


        const loaders = {
            cube: {
                mesh: new THREE.OBJLoader(),
                texture: new THREE.MTLLoader()
            }
        }

        const materials = await new Promise((r) => loaders.cube.texture.load("models/EDITOR_companion_cube.mtl", r));
        materials.preload();
        loaders.cube.mesh.setMaterials(materials);

        cube = await new Promise((r) => loaders.cube.mesh.load("models/EDITOR_companion_cube.obj", r));
        cube.position.set(0, 0, 0);
        cube.scale.set(0.025, 0.025, 0.025);
        cube.add(new THREE.Box3().setFromObject(cube))

        const mesh = cube.children[0];
        mesh.geometry.center();
        cube.add(new THREE.BoxHelper(mesh))

        scene.add(cube);


        // renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );
        render();
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

        //TODO: Tohle se nemusí počítat každý frame.
        const size = new THREE.Box3().setFromObject(cube).getSize(new THREE.Vector3())

        /**
         * Souřadnice jednotlivých stran kostky na 
         */
        const cubeFacePositions = {
            top: cube.position.y + size.y / 2,
            bottom: cube.position.y - size.y / 2,
            left: cube.position.x - size.x / 2,
            right: cube.position.x + size.x / 2
        }

        console.log(cube.position.x, cube.position.y, size.x, size.y)
        //console.log(size, cube.position, cubeFacePositions, boundaries.min);

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