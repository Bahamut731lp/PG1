import { Menu } from "../menu.js"
import Intro from "./intro.js";

const SCENES = {
    "menu": {
        "main": renderMenu,
        "options": renderOptions
    },
    "intro": {
        "start": Intro
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

async function renderMenu() {
    // Game menu
	const menu = new Menu(MAIN_MENU);
	menu.createLogo();
	menu.createBackground("assets/scenes/menu/01.jpg")
	menu.render();
}

async function renderOptions() {
    // Game menu
	const menu = new Menu(OPTIONS);
	menu.createBackground("assets/scenes/menu/02.jpg")
	menu.render();
}


export default SCENES;