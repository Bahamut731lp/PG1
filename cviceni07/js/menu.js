export class Menu {
    constructor() {
        this.root = document.createElement("section");
        this.root.id = "menu";
        this.root.classList.add("menu__wrapper");

        this.buttons = [];
        this.logo = null;
        this.background = null;
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

    createBackground(url) {
        const image = document.createElement("img");
        image.src = url;
        image.classList.add("menu__background");

        this.background = image;
    }

    render() {
        const list = document.createElement("ul");
        list.classList.add("menu__list");
        
        for (const button of this.buttons) {
            const item = document.createElement("li");
            item.append(button);
            list.append(item);
        }

        this.root.append(this.background);
        this.root.append(this.logo);
        this.root.insertAdjacentHTML("beforeend", list.outerHTML);
        document.body.append(this.root);
    }
}