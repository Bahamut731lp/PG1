export class Menu {
    constructor(structure) {
        this.root = document.getElementById("menu") ?? document.createElement("section");
        this.root.id = "menu";
        this.root.classList.add("menu__wrapper");
        this.update(structure);
        this.logo = null;
        this.background = null;

        this.sounds = {
            music: new Audio("assets/soundtrack/main_menu.mp3"),
            hover: new Audio("assets/sounds/ui/buttonrollover.wav"),
            click: new Audio("assets/sounds/ui/buttonclickrelease.wav")
        }
    }

    clear() {
        this.buttons = null;
        this.ids = null;
        this.logo = null;
        this.background = null;
    }

    destroy() {
        this.root.remove();
    }

    update(structure) {
        this.buttons = structure;
        this.ids = Object.keys(structure);
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

    render() {
        return new Promise((resolve) => {
            
            // Resetování menu
            this.root.innerHTML = "";
            document.body.classList.add("visible")
            // List pro tlačítka v menu
            const list = document.createElement("ul");
            list.classList.add("menu__list");

            // Vytvoření jednotlivých tlačítek
            for (const [id, btn] of Object.entries(this.buttons)) {
                const button = document.createElement("button");
                button.innerText = btn.label;
                button.id = id;
                button.classList.add("menu__button");

                const item = document.createElement("li");
                item.append(button);
                list.append(item);
            }

            // Přidání jednotlivých prvků menu
            this.root.append(this.background);
            this.root.append(this.logo);
            this.root.insertAdjacentHTML("beforeend", list.outerHTML);
            // Přidání do DOM
            document.body.append(this.root);

            // Přidání event handlerů
            // Musí se to udělat až po přidání do DOM, jinak to nefunguje
            this.ids.map(v => document.getElementById(v)).forEach((btn) => {
                btn.addEventListener("mouseenter", () => {
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
                        return resolve(callback);
                    }
                })
            })

            new Promise((r) => setTimeout(() => {
                document.body.classList.add("visible");
                this.root.classList.add("opened");
                r();
            }, 100))
            
        })
    }
}