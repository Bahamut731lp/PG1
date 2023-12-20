import LoadingScreen from "../lib/ui/LoadingScreen.js";

import CubeFactory from "../lib/CubeFactory.js";
import ChamberDoorFactory from "../lib/ChamberDoorsFactory.js";
import PlatformFactory from "../lib/PlatformFactory.js";

import Controllable from "../lib/Controllable.js";
import Score from "../lib/ui/Score.js";
import VoiceoverGenerator from "../voiceover/level_1.js";
import PressKey from "../lib/ui/PressKey.js";
import BoxManager from "../lib/BoxManager.js";
import SplashScreen from "../splashscreen.js";
import Objective from "../lib/ui/Objective.js";
import RailFactory from "../lib/RailFactory.js";

async function level_1() {
    const loadingScreen = new LoadingScreen();

    let renderer, player, player_bbox;

    let leftAlreadyBounced = false;

    let BBs = {
        "ceiling": null,
        "floor": null,
        "left_wall": null,
        "right_wall": null,
        "platform": null
    }

    const bounceSounds = ["assets/sounds/objects/rock_impact_soft1.wav", "assets/sounds/objects/rock_impact_soft2.wav", "assets/sounds/objects/rock_impact_soft3.wav"]

    // 3D Instantiation
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    const scene = new THREE.Scene();
    const cube = await new CubeFactory().CompanionCube();
    const chamberDoors = await new ChamberDoorFactory().create();
    const platform = await new PlatformFactory().create();
    const rail = await new RailFactory().create();
    const clock = new THREE.Clock();

    let deltaCoffecient = 1;
    let gameOver = false;

    // Camera positioning
    camera.position.z = 5.0;

    // Speed variables
    const speeds = {
        x: 2,
        y: 1
    }

    let dx = speeds.x;
    let dy = speeds.y;

    const ambience = new Audio("assets/sounds/ambience/ambience_test_chamber_01.mp3");
    const voiceover = VoiceoverGenerator();
    const splash = new SplashScreen().addNewScreen("Tutorial", "Test Chamber 01", 5);

    init();

    // Čekáme na dokončení loadingu scény - init() se ohlásí
    await loadingScreen.waitForCompletion();

    splash
    splash.render();
    ambience.play();

    await voiceover.afterAwakening//.play();
    await voiceover.simpleControls//.play();


    // Enable continuous rendering so that movement is visible
    enableRendering();

    // Move up tutorial
    await voiceover.pressW//.play();

    new Controllable(player)
        .setKeybinds({
            "w": (target) => {
                target.element.position.y += target.speed
                target.element.position.y = Math.min(target.element.position.y, 1.8)
            },
            "s": (target) => {
                target.element.position.y -= target.speed
                target.element.position.y = Math.max(target.element.position.y, -1.8)
            }
        })
        .setSpeed(0.1)
        .mount();

    let hide = null;
    hide = new PressKey("w", "Press to move the platform up.");
    await pressKeyOnce("w");
    hide();

    // Move down tutorial
    await voiceover.pressS//.play();
    hide = new PressKey("s", "Press to move the platform down.");
    await pressKeyOnce("s")
    hide();

    // Congratulations
    await voiceover.congratulations//.play();

    // Spawn companion cube
    new Audio("assets/sounds/objects/spawn.wav").play();
    scene.add(cube);

    await voiceover.companionCube//.play();

    const threeBouncesObjective = new Objective("Bounce off the Companion Cube 3 times", "signage_overlay_companioncube.png");

    // Game rules and UI
    const [playerScore, setPlayerScore] = new Score({ "left": "25%", "bottom": "0" });
    const [enemyScore, setEnemyScore] = new Score({ "right": "25%", "bottom": "0", "opacity": 0 });

    const conditions = {
        "win": () => playerScore.value >= 30,
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

        BBs.floor = new THREE.Box3().setFromObject(floor);
        BBs.ceiling = new THREE.Box3().setFromObject(ceiling);
        BBs.left_wall = new THREE.Box3().setFromObject(leftwall);
        BBs.right_wall = new THREE.Box3().setFromObject(rightwall);

        // Positioning of chamber doors
        chamberDoors.position.set(5.9, -1.5, -0.5)
        chamberDoors.rotation.set(0, -Math.PI / 2, 0);

        platform.position.set(-4.25, 0, 0);
        platform.rotation.set(0, 0, -Math.PI / 2);

        rail.position.set(-4.3, 0, 0.1);
        rail.rotation.set(0, 0, -Math.PI / 2);

        // Adding everything to scene
        scene.add(backwall);
        scene.add(leftwall);
        scene.add(rightwall);
        scene.add(floor);
        scene.add(ceiling);
        scene.add(chamberDoors);
        scene.add(platform);
        scene.add(rail);

        player = platform;
        scene.add(player_bbox);

        // Add helper object (bounding box)
        let bounding_box_geometry = new THREE.BoxGeometry(11.01, 5.01, 1.51);
        let bounding_box_mesh = new THREE.Mesh(bounding_box_geometry, null);
        bounding_box_mesh.position.set(0, 0, -0.25);

        const rightLight = new THREE.PointLight(0xaaaaaa, 0.75, 100);
        rightLight.position.set(5, 1, 2);

        const leftLight = new THREE.PointLight(0xaaaaaa, 0.75, 100);
        leftLight.position.set(-5, 1, 2);

        scene.add(rightLight);
        scene.add(leftLight);

        // renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);

        render();
        loadingScreen.setCompletion(true);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    function enableRendering() {
        requestAnimationFrame(enableRendering);
        render();
    }


    function animate() {
        requestAnimationFrame(animate);

        let delta = clock.getDelta();
        delta *= deltaCoffecient;

        const playerBB = new THREE.Box3().setFromObject(player);
        const cubeBB = new THREE.Box3().setFromObject(cube);

        // Vertikální kolize se stěnou
        if (BBs.ceiling.intersectsBox(cubeBB) || BBs.floor.intersectsBox(cubeBB)) {
            dy = -dy;
            playBounce();
        };

        cube.position.y += delta * dy;

        let predicates_1 = [
            playerBB.intersectsBox(cubeBB),
            player.position.x < cube.position.x,
            !gameOver
        ]

        // Bounce platform left
        if (predicates_1.every(v => v)) {
            dx = -dx;

            playBounce();
            setPlayerScore(prev => prev + 1);
            checkGameConditions();
        }

        // Bounce left wall
        if (BBs.left_wall.intersectsBox(cubeBB)) {
            dx += Math.exp(Math.random()) / 10;
            dx = Math.abs(dx);

            playBounce();
            setEnemyScore(prev => prev + 1);
            checkGameConditions();
        }

        // Bounce right wall
        if (BBs.right_wall.intersectsBox(cubeBB)) {
            dx += Math.exp(Math.random()) / 10;
            dx = -dx;
            playBounce();
        }

        cube.position.x += delta * dx;
    }

    function playBounce() {
        const src = bounceSounds[Math.floor(Math.random() * bounceSounds.length)];
        new Audio(src).play();
    }

    function checkGameConditions() {
        if (gameOver) return;

        if (conditions.win()) {
            afterGame(true);
        }

        if (conditions.lose()) {
            afterGame(false);
        }
    }

    async function afterGame(didPlayerWin) {
        // Zastavení kostky
        gameOver = true;
        deltaCoffecient = 0.2;

        new Audio("assets/sounds/objects/despawn.wav").play();

        // Splnění či nesplnění úkolu
        const key = didPlayerWin ? "win" : "lose";

        // Schování úkolu
        new Promise((resolve) => {
            setTimeout(() => {
                didPlayerWin ? (
                    threeBouncesObjective.complete()
                ) : (
                    threeBouncesObjective.fail()
                )
                resolve();
            }, 2 * 1000)
        })

        // Ukázat win/lose screen
        new SplashScreen()
            .addNewScreen(didPlayerWin ? "You Win" : "You Lose", "Testing Chamber 01")
            .render()

        // Pustit správný voiceover
        await voiceover.end[key].play();

        if (didPlayerWin) {

        } else {
            restartLevel();
        }
    }

    /**
     * Funkce pro restartování levelu v případě failu
     */
    async function restartLevel() {
        // Fade in
        document.body.classList.remove("visible");
        await new Promise((r) => setTimeout(r, 200));

        cube.position.set(0, 0, 0); //Reset kostky
        platform.position.y = 0;    //Reset platformy
        setPlayerScore(_ => 0); // Reset skóre
        setEnemyScore(_ => 0);  // Reset enemy skóre (v tomto případě failů)
        deltaCoffecient = 1;    // Zrychlení času na normální rychlost

        // Fade out
        document.body.classList.add("visible");
        await new Promise((r) => setTimeout(r, 200));

        // Vizuální změny
        gameOver = false;   // Reset "Game Over" stavu
        threeBouncesObjective.create();
        dx = speeds.x;
        dy = speeds.y;
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
        renderer.render(scene, camera);
    }
}

export default level_1;