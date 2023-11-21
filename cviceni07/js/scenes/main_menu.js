import { Menu } from "../menu.js"
import Intro from "./intro.js";

const SCENES = {
    "menu": {
        "init": init,
        "main": renderMainMenu,
        "options": renderOptions
    },
    "intro": {
        "start": () => transitionAwayTo(Intro)
    }
}

const MAIN_MENU = {
	"campaing": {
		"label": "Campaign",
        "callback": SCENES.intro.start
	},
	"free-game": {
		"label": "Free-Game"
	},
	"options": {
		"label": "Options",
        "callback": SCENES.menu.options
	},
	"credits": {
		"label": "Credits"
	}
}

const OPTIONS = {
    "general": {
        "label": "General",
    },
    "audio": {
        "label": "Audio"
    },
    "video": {
        "label": "Video"
    },
    "back": {
        "label": "Go Back",
        "callback": SCENES.menu.main
    }
}

/**
 * @type {Menu | null}
 */
let menu = null;

async function transitionAwayTo(scene) {
    menu.sounds.music.pause();
    menu.root.classList.remove("opened");
    console.log(menu.root);

    await new Promise((r) => setTimeout(r, 2.5 * 1000));
    menu.destroy();
    scene()
}

async function init() {
    menu = new Menu({})
    menu.sounds.music.volume = 0.25;
    menu.sounds.music.play();

    renderMainMenu()
}

async function renderMainMenu() {
    // Game menu
    menu.clear();
	menu.update(MAIN_MENU);
    menu.createLogo();
	menu.createBackground("assets/scenes/menu/01.jpg")
	menu.render();
}

async function renderOptions() {
    // Game menu
    menu.clear();
    menu.update(OPTIONS);
	menu.createBackground("assets/scenes/menu/02.jpg")
	menu.render();
}


export default SCENES;