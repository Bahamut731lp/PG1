import CubeFactory from "../lib/CubeFactory.js";

async function level_1() {
    let box, renderer, boundaries, left_player, right_player;

    // Everything instantiation
    const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    const scene = new THREE.Scene();
    const cube = await new CubeFactory().CompanionCube();

    // Camera positioning
    camera.position.z = 5.0;

    // Speed variables
    let dy = 0.01;
    let dx = 0.02;

    // Scene hiearchy
    scene.add(cube);
    init();
    animate();

    async function init() {
        box = new THREE.Object3D();

        left_player = new THREE.Object3D();
        right_player = new THREE.Object3D();

        // Add helper object (bounding box)
        let bounding_box_geometry = new THREE.BoxGeometry( 10.01, 5.01, 1.01 );
        let bounding_box_mesh = new THREE.Mesh(bounding_box_geometry, null);
        let bbox = new THREE.BoxHelper( bounding_box_mesh);
        boundaries = new THREE.Box3().setFromObject(bbox)
        scene.add(bbox);
        
        const light = new THREE.SpotLight( 0xffffff);
        light.castShadow = true;
        light.shadow.camera.near = 500;
        light.shadow.camera.far = 4000;
        light.shadow.camera.fov = 30;

        light.position.set( 0, 15, 10 );
        scene.add( light );

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