class Objective {
    constructor(label, imagePath = "signage_overlay_cake.png") {
        this.root = document.getElementById("ui");
        this.value = 0;
    
        const wrapperStyle = {
            "position": "fixed",
            "color": "white",
            "font-size": "6rem",
            "top": "1vh",
            "left": "1vw",
            "width": "100%",
            "display": "grid",
            "place-items": "start"
        }

        const elementStyle = {
            "font-weight": "bold",
            "font-size": "1.5rem",
            "display": "flex",
            "align-items": "center",
            "background": "#393939"
        }

        const textStyle = {
            "font-size": "0.75em",
            "height": "100%",
            "padding": "0 1em"
        }

        const wrapper = document.createElement("div");
        wrapper.style = Object.entries(wrapperStyle).map(v => v.join(":")).join(";");
        wrapper.className = "key fade";

        const element = document.createElement("div");
        element.style = Object.entries(elementStyle).map(v => v.join(":")).join(";");

        const instructions = document.createElement("div");
        instructions.innerText = label;
        instructions.style = Object.entries(textStyle).map(v => v.join(":")).join(";");
        
        const image = document.createElement("img");
        image.src = `assets/textures/signage/${imagePath}`;
        image.style = `width: 1.5em; height: 1.5em; background: black;`

        element.append(image, instructions);
        wrapper.append(element);

        this.ref = this.root.appendChild(wrapper)

        new Promise(((resolve) => {
            setTimeout(() => {
                this.ref.classList.add("open");
                new Audio("assets/sounds/ui/menu_focus.wav").play();
                resolve()
            }, 10);
        }))
    }

    async complete() {
        this.ref.classList.remove("open");
        new Audio("assets/sounds/ui/menu_accept.wav").play();

        await new Promise((resolve) => setTimeout(resolve, 150));
        this.ref.remove();
    }
}

export default Objective;