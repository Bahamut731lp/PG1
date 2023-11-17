export class Menu {
    constructor(structure) {
        this.root = document.getElementById("menu") ?? document.createElement("section");
        this.root.id = "menu";
        this.root.classList.add("menu__wrapper");

        this.buttons = structure;
        this.ids = Object.keys(structure);
        this.logo = null;
        this.background = null;

        this.sounds = {
            hover: new Audio("assets/sounds/ui/buttonrollover.wav"),
            click: new Audio("assets/sounds/ui/buttonclickrelease.wav")
        }
    }

    createLogo() {
        const logo = document.createElement("h1");
        logo.classList.add("menu__logo");
        logo.innerText = "PONG | 2"

        this.logo = logo;
    }

    createBackground(url) {
        const image = document.createElement("img");
        image.src = url;
        image.classList.add("menu__background");

        this.background = image;
    }

    async render() {
        const list = document.createElement("ul");
        list.classList.add("menu__list");
        
        for (const [id, btn] of Object.entries(this.buttons)) {
            const button = document.createElement("button");
            button.innerText = btn.label;
            button.id = id;
            button.classList.add("menu__button");

            const item = document.createElement("li");
            item.append(button);
            list.append(item);
        }

        this.root.append(this.background);
        this.root.append(this.logo);
        this.root.insertAdjacentHTML("beforeend", list.outerHTML);
        document.body.append(this.root);

        this.ids.map(v => document.getElementById(v)).forEach((btn) => {
            btn.addEventListener("mouseenter", () => {
                // Play audio sfx
                // TODO: Občas to dělá takovej divnej static, chce to ještě prozkoumat
                this.sounds.hover.pause();
                this.sounds.hover.currentTime = 0;
                this.sounds.hover.play();
            })
    
            btn.addEventListener("click", async () => {
                // Play audio sfx
                this.sounds.click.pause();
                this.sounds.click.currentTime = 0;
                this.sounds.click.play();

                // Execute next step
                const callback = this.buttons[btn.id].callback

                if (typeof callback == "function") {
                    await this.cleanup();
                    callback();
                }
            })
        })

        await new Promise((r) => setTimeout(r, 100))
        this.root.classList.add("opened")
    }

    async cleanup() {
        this.root.innerHTML = "";
        return true;
    }
}