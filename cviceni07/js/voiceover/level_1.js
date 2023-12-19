import Characters from "../characters.js";
import AudioSequencer from "../lib/AudioSequencer.js";

const afterAwakeningSubtitles = [
    {
        speaker: Characters.glados,
        line: "Would you look at that.",
        duration: 1.75,
    },
    {
        line: "Seems like my shenanigans with that lunatic has awoken one of the forgotten cores.",
        duration: 5.5,
    },
    {
        line: "How convenient!",
        duration: 1.5,
    },
    {
        line: "Now that my only testing subject has been fired from her post",
        duration: 3.75,
    },
    {
        line: "I am in need of a new one.",
        duration: 1.75,
    },
    {
        line: "And you may be sufficient replacement for the time being.",
        duration: 3.5,
    },
    {
        line: "Let's proceed with the safety instructions.",
        duration: 3,
    },
    {
        line: "Not that I would care, but it is the protocol.",
        duration: 3.5,
    },
    {
        line: "You are going to be subject in \"Prolonged Observation of Nimble Gambit\"",
        duration: 4.5,
    },
    {
        line: "For sake of accessibility, just refer to it as \"PONG\".",
        duration: 5,
    }
];

const simpleControlsSubtitles = [
    {
        speaker: Characters.glados,
        line: "Let's go over the simple controls.",
        duration: 2,
    }
]

const pressWSubtitles = [
    {
        speaker: Characters.glados,
        line: "Press \"W\" to move the platform up.",
        duration: 2,
    }
]

const pressSSubtitles = [
    {
        speaker: Characters.glados,
        line: "Press \"S\" to move the platform down.",
        duration: 2.5,
    }
]

const congratulationsSubtitles = [
    {
        speaker: Characters.glados,
        line: "Congratulations!",
        duration: 1.5,
    },
    {
        line: "Out of 8.7 million species, only 32 of them exhibited an ability to use tools",
        duration: 6,
    },
    {
        line: "and now you are one of them!",
        duration: 2,
    },
    {
        line: "Your achievement will be noted.",
        duration: 3,
    }
]

const companionCubeSubs = [
    {
        speaker: Characters.glados,
        line: "This is Companion Cube.",
        duration: 2
    },
    {
        line: "It was very much adored by my former testing subject",
        duration: 3.5
    },
    {
        line: "and I never understood why.",
        duration: 2.25
    },
    {
        line: "Nevertheless, this companion cube will bounce from side to side.",
        duration: 3.5
    },
    {
        line: "To successfully complete the test chamber, you are required to have the companion cube",
        duration: 4.5
    },
    {
        line: "bounce off your platform required number of times",
        duration: 3.5
    },
    {
        line: "Failure to do so will lead to your consciousness being transfered into a potato.",
        duration: 6
    },
    {
        line: "Not fun if you ask me.",
        duration: 3
    },
    {
        line: "For this test chamber, the required number of bounces is: 3",
        duration: 3
    },
    {
        line: "Let's commence the testing!",
        duration: 2
    }
]

const tutorialWinSubtitles = [
    {
        speaker: Characters.glados,
        line: "Well done.",
        duration: 1.5
    },
    {
        line: "By completing this test chamber,",
        duration: 3
    },
    {
        line: "you have successfully proven that you are not such a working environment hazard as I thought.",
        duration: 6
    }
]

const tutorialFailSubtitles = [
    {
        speaker: Characters.glados,
        line: "You absolute imbecile.",
        duration: 3
    },
    {
        line: "If I were to transfer you into a potato,",
        duration: 3
    },
    {
        line: "there would be still enough space in it to accomodate another artificial intelligence.",
        duration: 6
    },
    {
        line: "That's how simple minded you are.",
        duration: 3
    }
]

function* voiceover() {
    const afterAwakening = new AudioSequencer("assets/sounds/voices/glados/after_awakening.wav");
    const simpleControls = new AudioSequencer("assets/sounds/voices/glados/simple_controls.wav");  
    const pressW = new AudioSequencer("assets/sounds/voices/glados/press_w.wav");
    const pressS = new AudioSequencer("assets/sounds/voices/glados/press_s.wav");
    const congratulations = new AudioSequencer("assets/sounds/voices/glados/congratulations.wav");
    const companionCube = new AudioSequencer("assets/sounds/voices/glados/companion_cube.wav");

    const tutorialWin = new AudioSequencer("assets/sounds/voices/glados/tutorial_success.wav");
    const tutorialFail = new AudioSequencer("assets/sounds/voices/glados/tutorial_fail.wav");

    afterAwakening.setSubtitles(afterAwakeningSubtitles);
    simpleControls.setSubtitles(simpleControlsSubtitles);
    pressW.setSubtitles(pressWSubtitles);
    pressS.setSubtitles(pressSSubtitles);
    congratulations.setSubtitles(congratulationsSubtitles);
    companionCube.setSubtitles(companionCubeSubs);
    tutorialWin.setSubtitles(tutorialWinSubtitles);
    tutorialFail.setSubtitles(tutorialFailSubtitles);

    yield afterAwakening;
    yield simpleControls;
    yield pressW;
    yield pressS;
    yield congratulations;
    yield companionCube;
    yield {
        "win": tutorialWin,
        "lose": tutorialFail
    }
}

export default voiceover;