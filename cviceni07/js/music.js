class Music {
    constructor(path) {
        this.path = path;
        this.audio = new Audio(path);
    }

    play() {
        this.audio.play();
    }
}