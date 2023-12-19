import Subtitles from "../subtitles.js";

class AudioSequencer {
    constructor(path) {
        this.audio = new Audio(path);
        this.subtitles = null;
    }

    setSubtitles(subtitles) {
        this.subtitles = subtitles;
    }

    async play() {
        this.audio.play();
        if (!this.subtitles) return;

        const subs = new Subtitles();
        let last_speaker = null;
    
        for (const data of this.subtitles) {
            if (data.pause) {
                await new Promise((r) => setTimeout(r, data.pause * 1000));
                continue
            }
    
            last_speaker = data.speaker ?? last_speaker;
            await subs.render(last_speaker, data.line, data.duration);
        }
    }
}

export default AudioSequencer;