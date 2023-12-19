import CubeFactory from "../lib/CubeFactory.js";
import Controllable from "../lib/Controllable.js";
import Score from "../lib/ui/Score.js";
import VoiceoverGenerator from "../voiceover/level_1.js";
import PressKey from "../lib/ui/PressKey.js";

async function level_1() {
    let box, renderer, boundaries, left_player_mesh, right_player_mesh;
    let left_player_collider, right_player_collider;
    
    // 3D Instantiation
    const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    const scene = new THREE.Scene();
    const cube = await new CubeFactory().CompanionCube();

    // Camera positioning
    camera.position.z = 5.0;

    // Speed variables
    let dy = 0.01;
    let dx = 0.02;

    // Ambience
    const ambience = new Audio("assets/sounds/ambience/ambience_test_chamber_01.mp3");
    ambience.play();

    // Voiceover
    const voiceover = VoiceoverGenerator();
    await init();
    await voiceover.next().value.play();   
    await voiceover.next().value.play();

    // Enable continuous rendering so that movement is visible
    enableRendering();

    const keybinds = {
        "w": (target) => target.element.position.y += target.speed,
        "s": (target) => target.element.position.y -= target.speed
    }

    const controllable = new Controllable(left_player_mesh)
    .setKeybinds(keybinds)
    .setSpeed(0.1)

    await voiceover.next().value.play();
    // Mount controls
    controllable.mount();
    
    // Move up tutorial
    let hide = null;
    hide = new PressKey("w", "Press to move the platform up.");
    await pressKeyOnce("w");
    hide();

    // Move down tutorial
    await voiceover.next().value.play();
    hide = new PressKey("s", "Press to move the platform down.");
    await pressKeyOnce("s")
    hide();

    // Congratulations
    await voiceover.next().value.play();

    // Spawn companion cube
    new Audio("assets/sounds/objects/spawn.wav").play();
    scene.add(cube);

    await voiceover.next().value.play();
    
    // Game rules and UI
    const [playerScore, setPlayerScore] = new Score({ "left": "25%", "bottom": "0" });
    const [enemyScore, setEnemyScore] = new Score({ "right": "25%", "bottom": "0", "opacity": 0 });

    const conditions = {
        "win": () => playerScore.value >= 3,
        "lose": () => enemyScore.value >= 1
    }

    animate();

    async function init() {
        box = new THREE.Object3D();
        const texture = await new Promise((resolve) => {
            const path = "assets/textures/concrete/concrete_modular_wall001a.png"
            new THREE.TextureLoader().load(path, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 9, 6 );

                resolve(texture)
            })
        });

        const material = new THREE.MeshStandardMaterial({ map: texture });
        const wall = new THREE.Mesh(new THREE.BoxGeometry(15, 10, 0.01), material);
        wall.receiveShadow = true;
        wall.position.z = -1;
        wall.receiveShadow = true;

        scene.add(wall);

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
        
        const light = new THREE.SpotLight( 0xffffff, 0.9, 100, 0.5, 0.2, 2);
        light.castShadow = true;
        light.shadow.camera.near = 200;
        light.shadow.camera.far = 200;
        light.shadow.camera.fov = 30;
        light.position.set(0, 10, 5);
        light.target = cube
        scene.add( light );

        // renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);

        render();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }

    function enableRendering() {
        requestAnimationFrame(enableRendering);

        left_player_collider.update();
        right_player_collider.update();
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
            dx += Math.exp(Math.random()) / 200;
            dx = -dx;
            setEnemyScore(prev => prev + 1);
            resetCube();
        }

        if (cubeFacePositions.right >= boundaries.max.x) {
            //alert("They lose");
            dx += Math.exp(Math.random()) / 200;
            dx = -dx;
            setPlayerScore(prev => prev + 1)
            resetCube();
        }

        cube.position.x += dx;
    }

    function resetCube() {
        cube.position.set(0, 0, 0);

        if (conditions.win()) {
            afterGame(true);
        }

        if (conditions.lose()) {
            afterGame(false);
        }
    }

    function afterGame(didPlayerWin) {
        dy = 0;
        dx = 0;

        if (didPlayerWin) {
            voiceover.next().value.win.play()
        }
        else {
            voiceover.next().value.lose.play()
        }
    }

    function pressKeyOnce(key) {
        return new Promise(resolve => {
            function isCorrectKey(event) {
                if (event.key != key) return;
                
                window.removeEventListener("keydown", isCorrectKey);
                resolve();
                render();
            }
    
            window.addEventListener('keydown', isCorrectKey);
        });
    }

    async function render() {
        renderer.render( scene, camera );
    }
}

export default level_1;