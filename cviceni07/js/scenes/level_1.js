import CubeFactory from "../lib/CubeFactory.js";
import Controllable from "../lib/Controllable.js";

async function level_1() {
    let box, renderer, boundaries, left_player_mesh, right_player_mesh;

    let left_player_collider, right_player_collider;

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
    await init();
    animate();

    async function init() {
        box = new THREE.Object3D();

        left_player_mesh = new THREE.Mesh(new THREE.BoxGeometry(0.01, 2, 1), null);
        left_player_mesh.position.set(-4, 0, 0)
        left_player_collider = new THREE.BoxHelper(left_player_mesh);

        right_player_mesh = new THREE.Mesh(new THREE.BoxGeometry(0.01, 2, 1), null);
        right_player_mesh.position.set(4, 0, 0)
        right_player_collider = new THREE.BoxHelper(right_player_mesh);

        scene.add(left_player_collider)
        scene.add(right_player_collider)

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
        document.body.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);

        const keybinds = {
            "w": (target) => target.element.position.y += target.speed,
            "s": (target) => target.element.position.y -= target.speed
        }

        new Controllable(left_player_mesh)
        .setKeybinds(keybinds)
        .setSpeed(0.1)
        .mount()

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

        //console.log(left_player_mesh.position, cubeFacePositions.top, cubeFacePositions.bottom)

        // Vertikální kolize se stěnou
        if (cubeFacePositions.top >= boundaries.max.y || cubeFacePositions.bottom <= boundaries.min.y) {
            dy = -dy;
        };

        cube.position.y += dy;
        
        //TODO: Předělat, tohle je hrůza.
        const left_player_test = new THREE.Box3().setFromObject(left_player_mesh).getSize(new THREE.Vector3()).y / 2;

        let predicates_1 = [
            cubeFacePositions.left <= left_player_mesh.position.x,
            cube.position.y > (left_player_mesh.position.y - left_player_test),
            cube.position.y < (left_player_mesh.position.y + left_player_test)
        ]

        // Bounce left
        if (predicates_1.every(v => v)) {
            dx = -dx
        }

        // Bounce right

        if (cubeFacePositions.left <= boundaries.min.x) {
            //alert("You lose");
            resetCube();
            dx += Math.exp(Math.random()) / 200;
            dx = -dx
        }

        if (cubeFacePositions.right >= boundaries.max.x) {
            //alert("They lose");
            resetCube();
            dx += Math.exp(Math.random()) / 200;
            dx = -dx
        }

        cube.position.x += dx;

        // Update position of camera
        // Render scene

        left_player_collider.update();
        right_player_collider.update();
        render();
    }

    function resetCube() {
        cube.position.set(0, 0, 0);
        
    }

    function render() {
        renderer.render( scene, camera );
    }
}

export default level_1;