import CubeFactory from "../lib/CubeFactory.js";
import Controllable from "../lib/Controllable.js";
import Score from "../lib/ui/Score.js";
import VoiceoverGenerator from "../voiceover/level_1.js";
import PressKey from "../lib/ui/PressKey.js";
import BoxManager from "../lib/BoxManager.js";
import ChamberDoorFactory from "../lib/ChamberDoors.js";
import SplashScreen from "../splashscreen.js";
import Objective from "../lib/ui/Objective.js";
import LoadingScreen from "../lib/ui/LoadingScreen.js";

async function level_1() {
    const loadingScreen = new LoadingScreen();

    let box, renderer, boundaries, left_player_mesh;
    let left_player_collider;
    const bounceSounds = ["assets/sounds/objects/rock_impact_soft1.wav", "assets/sounds/objects/rock_impact_soft2.wav", "assets/sounds/objects/rock_impact_soft3.wav"]
    
    // 3D Instantiation
    const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    const scene = new THREE.Scene();
    const cube = await new CubeFactory().CompanionCube();
    const chamberDoors = await new ChamberDoorFactory().create();

    // Camera positioning
    camera.position.z = 5.0;

    // Speed variables
    let dy = 0.015;
    let dx = 0.03;

    const ambience = new Audio("assets/sounds/ambience/ambience_test_chamber_01.mp3");
    const voiceover = VoiceoverGenerator();
    const splash = new SplashScreen().addNewScreen("Tutorial", "Test Chamber 01", 5);
    
    init();
    
    // Čekáme na dokončení loadingu scény - init() se ohlásí
    await loadingScreen.waitForCompletion();
    splash
    splash.render();
    ambience.play();

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
    const threeBouncesObjective = new Objective("Bounce off the Companion Cube 3 times", "signage_overlay_companioncube.png");
    
    // Game rules and UI
    const [playerScore, setPlayerScore] = new Score({ "left": "25%", "bottom": "0" });
    const [enemyScore, setEnemyScore] = new Score({ "right": "25%", "bottom": "0", "opacity": 0 });

    const conditions = {
        "win": () => playerScore.value >= 3,
        "lose": () => enemyScore.value >= 1
    }

    animate();

    async function init() {
        const backwall = await new BoxManager(15, 10, 0.01)
        .setTexture("concrete/white_wall_tile003b.png")
        .setNormalMap("concrete/white_wall_tile003b_normal.png", 0.05)
        .setRepetition(4, 3)
        .setPosition(0, 0, -2)
        .create();

        const floor = await new BoxManager(20, 10, 0.5)
        .setTexture("concrete/underground_white_tile002a.png")
        .setNormalMap("concrete/underground_white_tile002a_normal.png", 1)
        .setRepetition(3, 3)
        .setPosition(0, -3, -1)
        .setRotation(Math.PI / 2, 0, 0)
        .create();

        const leftwall = await new BoxManager(15, 10, 0.01)
        .setTexture("concrete/white_wall_tile003b.png")
        .setNormalMap("concrete/white_wall_tile003b_normal.png", 0.05)
        .setRepetition(6, 3)
        .setPosition(-6, 0, -1)
        .setRotation(0, Math.PI / 2, 0)
        .create();

        const rightwall = await new BoxManager(15, 10, 0.01)
        .setTexture("concrete/white_wall_tile003b.png")
        .setNormalMap("concrete/white_wall_tile003b_normal.png", 0.02)
        .setRepetition(6, 3)
        .setPosition(6, 0, -1)
        .setRotation(0, Math.PI / 2, 0)
        .create();

        const ceiling = await new BoxManager(20, 10, 0.5)
        .setTexture("concrete/white_wall_tile003c.png")
        .setBumpMap("concrete/white_wall_tile003c_height-ssbump.png", 0.05)
        .setRepetition(20, 10)
        .setPosition(0, 3, 0)
        .setRotation(Math.PI / 2, 0, 0)
        .create();

        // Positioning of chamber doors
        chamberDoors.position.set(5.9, -1.5, -0.5)
        chamberDoors.rotation.set(0, -Math.PI / 2, 0);

        // Adding everything to scene
        scene.add(backwall);
        scene.add(leftwall);
        scene.add(rightwall);
        scene.add(floor);
        scene.add(ceiling);
        scene.add(chamberDoors);

        left_player_mesh = new THREE.Mesh(new THREE.BoxGeometry(0.01, 2, 1), null);
        left_player_mesh.position.set(-4, 0, 0)
        left_player_collider = new THREE.BoxHelper(left_player_mesh);

        scene.add(left_player_collider)

        // Add helper object (bounding box)
        let bounding_box_geometry = new THREE.BoxGeometry( 11.01, 5.01, 1.51 );
        let bounding_box_mesh = new THREE.Mesh(bounding_box_geometry, null);
        bounding_box_mesh.position.set(0, 0, -0.25)
        let bbox = new THREE.BoxHelper( bounding_box_mesh);
        boundaries = new THREE.Box3().setFromObject(bbox)
        //scene.add(bbox);
        
        const rightLight = new THREE.PointLight( 0xaaaaaa, 0.75, 100);
        rightLight.position.set( 5, 1, 2 );

        const leftLight = new THREE.PointLight( 0xaaaaaa, 0.75, 100);
        leftLight.position.set( -5, 1, 2 );

        scene.add( rightLight );
        scene.add( leftLight );

        // renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);


        render();
        loadingScreen.setCompletion(true);
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

        // Vertikální kolize se stěnou
        if (cubeFacePositions.top >= boundaries.max.y || cubeFacePositions.bottom <= boundaries.min.y) {
            dy = -dy;
            playBounce();
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
            dx = -dx;
            setPlayerScore(prev => prev + 1);
            checkGameConditions();
            playBounce();
        }

        // Bounce right

        if (cubeFacePositions.left <= boundaries.min.x) {
            //alert("You lose");
            dx += Math.exp(Math.random()) / 200;
            dx = -dx;
            playBounce();
        }

        if (cubeFacePositions.right >= boundaries.max.x) {
            //alert("They lose");
            dx += Math.exp(Math.random()) / 200;
            dx = -dx;
            playBounce();
        }

        cube.position.x += dx;
    }

    function playBounce() {
        const src = bounceSounds[Math.floor(Math.random()*bounceSounds.length)];
        new Audio(src).play();
    }

    function checkGameConditions() {
        if (conditions.win()) {
            afterGame(true);
        }

        if (conditions.lose()) {
            afterGame(false);
        }
    }

    async function afterGame(didPlayerWin) {
        // Zastavení kostky
        dy = 0;
        dx = 0;
        cube.position.set(0, 0, 0);
        new Audio("assets/sounds/objects/despawn.wav").play();

        // Schování úkolu
        new Promise((resolve) => {
            setTimeout(() => {
                threeBouncesObjective.complete();
                resolve();
            }, 2 * 1000)
        })
        
        // Splnění či nesplnění úkoluw
        const key = didPlayerWin ? "win" : "lose";

        // Ukázat win/lose screen
        new SplashScreen()
        .addNewScreen(didPlayerWin ? "You Win" : "You Lose", "Testing Chamber 01")
        .render()
        
        // Pustit správný voiceover
        await voiceover
        .next()
        .value[key]
        .play();
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