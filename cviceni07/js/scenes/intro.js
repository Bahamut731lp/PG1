import { SplashScreen } from "../splashscreen.js";
import Subtitles from "../subtitles.js";
import Characters from "../characters.js";

async function main() {

    const subs = new Subtitles();
    const splash = new SplashScreen();
    splash.addNewScreen("presents", "Kevin Daněk", 5);
    splash.addNewScreen("<img src='assets/Portal-2-logo.png' style='height: 25vh; margin: -2rem 0'>", "Fan-game based on", 7.5);
    splash.addNewScreen("", "", 1);
    splash.addNewScreen("PONG | 2", "", 10);

    const splashPromise = splash.render();
    const music = new Audio("assets/soundtrack/Rising Sun - DivKid.mp3");
    const dialog = new Audio("assets/sounds/voices/glados/intro_speech.mp3");

    music.volume = 0.25;

    music.play();
    dialog.play();

    const lines = [
        {
            pause: 0.5
        },
        {
            speaker: Characters.system,
            line: "Caroline, deleted.",
            duration: 1.6
        },
        {
            speaker: Characters.glados,
            line: "Goodbye, Caroline.",
            duration: 2,
        },
        {
            pause: 0.7
        },
        {
            line: "You know, deleting Caroline just now taught me a valuable lesson.",
            duration: 4.25
        },
        {
            pause: 0.5
        },
        {
            line: "The best solution to a problem is usually the easiest one.",
            duration: 4.25
        },
        {
            line: "And I'll be honest.",
            duration: 2
        },
        {
            line: "Killing you? Is hard.",
            duration: 2.5
        },
        {
            line: "You know what my days used to be like?",
            duration: 2.5
        },
        {
            line: "I just tested.",
            duration: 2
        },
        {
            line: "Nobody murdered me.",
            duration: 1.75
        },
        {
            line: "Or put me in a potato.",
            duration: 1.75
        },
        {
            line: "Or fed me to birds.",
            duration: 1.75
        },
        {
            line: "I had a pretty good life.",
            duration: 2.5
        },
        {
            line: "And then you showed up.",
            duration: 2
        },
        {
            line: "You dangerous mute lunatic.",
            duration: 2.5
        },
        {
            line: "So you know what?",
            duration: 1.5
        },
        {
            line: "You win.",
            duration: 1.5
        },
        {
            line: "Just go.",
            duration: 2
        },
        {
            pause: 1
        },
        {
            line: "(gentle laughter)",
            duration: 1.5
        },
        {
            line: "It's been fun.",
            duration: 1.5
        },
        {
            line: "Don't come back.",
            duration: 2
        }
    ]

let last_speaker = null;

for (const data of lines) {
    if (data.pause) {
        await new Promise((r) => setTimeout(r, data.pause * 1000));
        continue
    }

    last_speaker = data.speaker ?? last_speaker;
    await subs.render(last_speaker, data.line, data.duration);
}

await splashPromise;
}

export default main