import SCENES from "./scenes/main_menu.js";
async function app() {
	// Game menu
	
    // const music = new Audio("assets/soundtrack/main_menu.mp3");
    // music.volume = 0.25;
    // music.play();

	let level = SCENES.menu.init;

	while (true) {
		let next = await new Promise(resolve => level(resolve));
		level = next;
	}
    //level_1()
}

window.addEventListener("DOMContentLoaded", app);