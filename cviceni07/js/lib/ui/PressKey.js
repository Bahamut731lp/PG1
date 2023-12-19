class PressKey {
    constructor(key, label) {
        this.root = document.getElementById("ui");
        this.value = 0;
    
        const wrapperStyle = {
            "position": "fixed",
            "color": "white",
            "font-size": "6rem",
            "bottom": "10vw",
            "width": "100%",
            "display": "grid",
            "place-items": "center"
        }

        const elementStyle = {
            "background": "rgba(0, 0, 0, 0.5)",
            "padding": "0.25rem",
            "font-size": "1.5rem",
            "display": "flex",
            "gap": "1rem",
            "align-items": "center"
        }

        const wrapper = document.createElement("div");
        wrapper.style = Object.entries(wrapperStyle).map(v => v.join(":")).join(";");;
        wrapper.className = "key fade";

        const element = document.createElement("div");
        element.style = Object.entries(elementStyle).map(v => v.join(":")).join(";");;
        
        const kbd = document.createElement("kbd");
        kbd.innerText = key;

        const instructions = document.createElement("span");
        instructions.innerText = label;
        instructions.style = "font-size: 0.75em";
        
        element.append(kbd, instructions);
        wrapper.append(element);

        this.ref = this.root.appendChild(wrapper)

        new Promise(((resolve) => {
            setTimeout(() => {
                this.ref.classList.add("open");
                new Audio("assets/sounds/ui/buttonrollover.wav").play();
                resolve()
            }, 10);
        }))
        

        return async () => {
            new Audio("assets/sounds/ui/buttonclickrelease.wav").play();
            this.ref.classList.remove("open");

            await new Promise((resolve) => setTimeout(resolve, 150));
            this.ref.remove();
        }
    }
}

export default PressKey;