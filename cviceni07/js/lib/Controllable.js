class Controllable {
    constructor(target) {
        this.element = target;
        this.speed = null;
        this.keybinds = null;
    }

    setKeybinds(value) {
        this.keybinds = value;
        return this;
    }

    setSpeed(value) {
        this.speed = value;
        return this;
    }
    
    static #onEventHandle(event, data) {
        if (!(event.key in data.keybinds)) return;

        data.keybinds[event.key](data);
    }

    mount() {
        console.log(this);
        if (!this.keybinds) return;

        
        window.addEventListener("keydown", (e) => Controllable.#onEventHandle(e, this), false)
    }

}

export default Controllable;