class PressKey {
    constructor(key, label) {
        this.root = document.getElementById("ui");
        this.value = 0;
    
        const style = {
            "position": "fixed",
            "color": "white",
            "font-size": "6rem",
            "bottom": "10vw",
            "left": "50%",
            "transform": "translateX(-50%)",
            "background": "rgba(0, 0, 0, 0.5)",
            "padding": "0.25rem",
            "font-size": "1.5em",
            "display": "flex",
            "gap": "1rem",
            "align-items": "center"
        }

        const styleProp = Object.entries(style).map(v => v.join(":")).join(";");

        const wrapper = document.createElement("div");
        wrapper.style = styleProp;
        wrapper.className = "key";
        
        const kbd = document.createElement("kbd");
        kbd.innerText = key;

        const instructions = document.createElement("span");
        instructions.innerText = label;
        instructions.style = "font-size: 0.75em"
        wrapper.append(kbd, instructions);

        this.ref = this.root.appendChild(wrapper)
        new Audio("assets/sounds/ui/buttonrollover.wav").play();

        return () => {
            new Audio("assets/sounds/ui/buttonclickrelease.wav").play();
            this.ref.remove();
        }
    }
}

export default PressKey;