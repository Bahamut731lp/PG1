import Characters from "../characters.js";
import AudioSequencer from "../lib/AudioSequencer.js";

const startSubtitles = [
    {
        speaker: Characters.glados,
        line: "Let's move onto the next test chamber.",
        duration: 2.25,
    },
    {
        line: "This test will be matching your intellectual capabilities againts this turret",
        duration: 5,
    },
    {
        speaker: Characters.turret,
        line: "Glorious freedom!",
        duration: 1,
    },
    {
        speaker: Characters.glados,
        line: "Standard testing procedures asserted it's non standard emotional volatility and attachment issues.",
        duration: 6,
    },
    {
        speaker: Characters.turret,
        line: "I'm scared",
        duration: 0.5,
    },
    {
        speaker: Characters.glados,
        line: "So I figured it might be perfect first partner for your testing.",
        duration: 4,
    },
    {
        line: "Let's see who will produce better results.",
        duration: 3.5,
    },
];

const failSubtitles = [
    {
        speaker: Characters.glados,
        line: "Once again I am forced to reject my null hypothesis because of bad data.",
        duration: 5,
    },
    {
        line: "And just so we are clear. You are the wrong data.",
        duration: 4,
    }
]

const winSubtitles = [
    {
        speaker: Characters.turret,
        line: "Okay. You win.",
        duration: 1.5,
    },
    {
        speaker: Characters.glados,
        line: "My statistical models were predicting this exact outcome, yet I felt a sense of unease watching you go through the test itself.",
        duration: 8.5,
    },
    {
        line: "Congratulations and let's move on.",
        duration: 3.5
    }
]

function voiceover() {
    const start = new AudioSequencer("assets/sounds/voices/glados/level_2_start.mp3");
    const win = new AudioSequencer("assets/sounds/voices/glados/level_2_win.mp3");
    const lose = new AudioSequencer("assets/sounds/voices/glados/level_2_fail.mp3");

    start.setSubtitles(startSubtitles);
    win.setSubtitles(winSubtitles)
    lose.setSubtitles(failSubtitles);

    return {
        start,
        end: {
            "win": win,
            "lose": lose
        }
    }
}

export default voiceover;