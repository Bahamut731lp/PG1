export class Menu {
    constructor() {
        this.root = document.createElement("section");
        this.root.id = "menu";
        this.root.style = Object.entries(
            {
                "width": "100vw",
                "height": "100vh",
                "position": "fixed"
            }
        ).map((pair) => pair.join(":")).join(";");

        this.buttons = [];
        this.logo = null;
    }

    createLogo() {
        const logo = document.createElement("h1");
        logo.classList.add("menu__logo");
        logo.innerText = "PONG | 2"

        this.logo = logo;
    }

    createButton(label) {
        const button = document.createElement("button");
        button.innerText = label;
        button.classList.add("menu__button");

        this.buttons.push(button)
    }

    render() {
        const list = document.createElement("ul");
        
        for (const button of this.buttons) {
            const item = document.createElement("li");
            item.append(button);
            list.append(item);
        }

        this.root.append(this.logo);
        this.root.insertAdjacentHTML("beforeend", list.outerHTML);
        document.body.append(this.root);
    }
}