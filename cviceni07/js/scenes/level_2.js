import LoadingScreen from "../lib/ui/LoadingScreen.js";

import CubeFactory from "../lib/CubeFactory.js";
import ChamberDoorFactory from "../lib/ChamberDoorsFactory.js";
import PlatformFactory from "../lib/PlatformFactory.js";

import Controllable from "../lib/Controllable.js";
import Score from "../lib/ui/Score.js";
import VoiceoverGenerator from "../voiceover/level_2.js";
import BoxManager from "../lib/BoxManager.js";
import SplashScreen from "../splashscreen.js";
import Objective from "../lib/ui/Objective.js";
import RailFactory from "../lib/RailFactory.js";
import SCENES from "./main_menu.js";

async function level_2(end_level) {
    const loadingScreen = new LoadingScreen();
    let renderer, player;

    let hasColided = false;
    let collisionDelta = 0;

    let BBs = {
        "ceiling": null,
        "floor": null,
        "left_wall": null,
        "right_wall": null
    }

    const bounceSounds = ["assets/sounds/objects/rock_impact_soft1.wav", "assets/sounds/objects/rock_impact_soft2.wav", "assets/sounds/objects/rock_impact_soft3.wav"]

    // 3D Instantiation
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    const scene = new THREE.Scene();
    const cube = await new CubeFactory().CompanionCube();
    const chamberDoors = await new ChamberDoorFactory().create();
    const clock = new THREE.Clock();

    const platform = await new PlatformFactory().create();
    const rail = await new RailFactory().create();
    
    const turret_platform = await new PlatformFactory().create();
    const turret_rail = await new RailFactory().create();
    let turret_dy = 0.01;
    
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
    const splash = new SplashScreen().addNewScreen("Glorious Freedom", "Test Chamber 02", 5);

    init();

    // Čekáme na dokončení loadingu scény - init() se ohlásí
    await loadingScreen.waitForCompletion();
    
    // Enable continuous rendering so that movement is visible
    enableRendering();
    scene.add(cube);
    
    document.body.classList.add("visible");

    splash.render();
    ambience.play();

    await voiceover.start.play();

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

    const objective = new Objective("Defeat \"The Turret\" by 3 points.", "signage_laser_burn.png");

    // Game rules and UI
    const [playerScore, setPlayerScore] = new Score({ "left": "25%", "bottom": "0" });
    const [enemyScore, setEnemyScore] = new Score({ "right": "25%", "bottom": "0" });

    const conditions = {
        "win": () => playerScore.value >= enemyScore.value + 3,
        "lose": () => enemyScore.value >= playerScore.value + 3
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
        chamberDoors.position.set(0, -1.5, -1.75)
        chamberDoors.rotation.set(0, 0, 0);

        
        platform.position.set(-4.25, 0, 0);
        platform.rotation.set(0, 0, -Math.PI / 2);
        turret_platform.position.set(4.25, 0, 0);
        turret_platform.rotation.set(0, 0, Math.PI / 2);

        rail.position.set(-4.3, 0, 0.1);
        rail.rotation.set(0, 0, -Math.PI / 2);
        turret_rail.position.set(4.3, 0, 0.1);
        turret_rail.rotation.set(0, 0, Math.PI / 2);    

        // Adding everything to scene
        scene.add(backwall);
        scene.add(leftwall);
        scene.add(rightwall);
        scene.add(floor);
        scene.add(ceiling);
        scene.add(chamberDoors);
        scene.add(platform);
        scene.add(rail);
        scene.add(turret_platform);
        scene.add(turret_rail);

        player = platform;

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

        if (hasColided) {
            collisionDelta += delta;
            if (collisionDelta > 0.2) {
                collisionDelta = 0;
                hasColided = false;
            }
        }

        const playerBB = new THREE.Box3().setFromObject(player);
        const turretBB = new THREE.Box3().setFromObject(turret_platform);
        const cubeBB = new THREE.Box3().setFromObject(cube);

        // Vertikální kolize se stěnou
        if (BBs.ceiling.intersectsBox(cubeBB) || BBs.floor.intersectsBox(cubeBB)) {
            dy = -dy;
            playBounce();
        };

        cube.position.y += delta * dy;

        turret_platform.position.y += turret_dy;
        

        if (Math.abs(turret_platform.position.y) - 1.8 > 0) {
            turret_dy = -turret_dy
        }

        let predicates_1 = [
            playerBB.intersectsBox(cubeBB),
            player.position.x < cube.position.x,
            !gameOver,
            !hasColided
        ]

        // Bounce platform left
        if (predicates_1.every(v => v)) {
            dx = -dx;

            collisionDelta = 0;
            hasColided = true;

            playBounce();
            setPlayerScore(prev => prev + 1);
            checkGameConditions();
        }

        // Turret bounce
        if (turretBB.intersectsBox(cubeBB) && turret_platform.position.x > cube.position.x && !hasColided && !gameOver) {
            dx = -dx;

            collisionDelta = 0;
            hasColided = true;

            playBounce();
            setEnemyScore(prev => prev + 1);
            checkGameConditions(); 
        }

        // Bounce left wall
        if (BBs.left_wall.intersectsBox(cubeBB)) {
            dx = -dx;
            playBounce();
            resetCube();
            setPlayerScore(prev => prev - 1);
            checkGameConditions();
        }

        // Bounce right wall
        if (BBs.right_wall.intersectsBox(cubeBB)) {
            dx = -dx;
            playBounce();
            resetCube();
            setEnemyScore(prev => prev - 1);
            checkGameConditions();
        }

        cube.position.x += delta * dx;
    }

    // Tohle je systém rozehrávek z florecu, basically
    function resetCube() {
        if (gameOver) return;

        new Audio("assets/sounds/objects/spawn.wav").play();
        cube.position.set(0, 0, 0);
        let direction = Math.sign(dx);
        dx = 0;
        dy = 0;
        
        setTimeout(() => {
            dx = direction * speeds.x,
            dy = speeds.y
        }, 2 * 1000)
    }

    function playBounce() {
        if (gameOver) return;
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
                    objective.complete()
                ) : (
                    objective.fail()
                )
                resolve();
            }, 2 * 1000)
        })

        // Ukázat win/lose screen
        new SplashScreen()
            .addNewScreen(didPlayerWin ? "You Win" : "You Lose", "Testing Chamber 02")
            .render()

        // Pustit správný voiceover
        await voiceover.end[key].play();

        if (didPlayerWin) {
            ambience.pause();
            end_level(SCENES.menu.main);
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
        objective.create();
        dx = speeds.x;
        dy = speeds.y;
    }

    async function render() {
        renderer.render(scene, camera);
    }
}

export default level_2