import { Menu } from "../menu.js"
import Intro from "./intro.js";
import Freeman from "./freeman.js";

const SCENES = {
    "menu": {
        "init": init,
        "main": renderMainMenu,
        "options": renderOptions
    },
    "intro": {
        "start": (resolve) => transitionAwayTo(Intro, resolve)
    }
}

const MAIN_MENU = {
	"campaing": {
		"label": "Campaign",
        "callback": SCENES.intro.start
	},
	"free-game": {
		"label": "Freeman Mode",
        "callback": (resolve) => transitionAwayTo(Freeman, resolve)
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

async function transitionAwayTo(scene, resolve) {
    menu.sounds.music.pause();
    menu.root.classList.remove("opened");
    console.log(menu.root);

    await new Promise((r) => setTimeout(r, 2.5 * 1000));
    menu.destroy();
    return scene(resolve);
}

async function init(resolve) {
    menu = new Menu({})
    menu.sounds.music.volume = 0.25;
    menu.sounds.music.play();
    
    return renderMainMenu(resolve);
}

async function renderMainMenu(resolve) {
    // Game menu
    menu.clear();
	menu.update(MAIN_MENU);
    menu.createLogo();
	menu.createBackground("assets/scenes/menu/01.jpg");

	return resolve(await menu.render());
}

async function renderOptions(resolve) {
    // Game menu
    menu.clear();
    menu.update(OPTIONS);
	menu.createBackground("assets/scenes/menu/02.jpg");

	return resolve(await menu.render());
}


export default SCENES;