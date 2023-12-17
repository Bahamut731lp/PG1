import CubeFactory from "../lib/CubeFactory.js";

async function level_1() {
    let box, renderer, boundaries, left_player, right_player;

    let left_player_boxhelper, right_player_boxhelper;

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

        let left_player_mesh = new THREE.Mesh(new THREE.BoxGeometry(0.33, 2, 1), null);
        left_player_mesh.position.set(-4, 0, 0)
        left_player_boxhelper = new THREE.BoxHelper(left_player_mesh);

        let right_player_mesh = new THREE.Mesh(new THREE.BoxGeometry(0.33, 2, 1), null);
        right_player_mesh.position.set(4, 0, 0)
        right_player_boxhelper = new THREE.BoxHelper(right_player_mesh);

        scene.add(left_player_boxhelper)
        scene.add(right_player_boxhelper)

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
        window.addEventListener("keydown", (event) => moveWithKeys(event, left_player_mesh, { top: "w", bottom: "s"}, 0.05, left_player_boxhelper), false);
        window.addEventListener("keydown", (event) => moveWithKeys(event, right_player_mesh, { top: "ArrowUp", bottom: "ArrowDown"}, 0.05, right_player_boxhelper), false);

        render();
    }

    function moveWithKeys(event, target, keys, speed, box) {
        if (event.key == keys.top) {
            target.position.y += speed
        }
        if (event.key == keys.bottom) {
            target.position.y -= speed;
        }
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

        left_player_boxhelper.update();
        right_player_boxhelper.update();
        render();
    }

    function render() {
        renderer.render( scene, camera );
    }
}

export default level_1;