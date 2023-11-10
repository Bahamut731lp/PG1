export class SplashScreen {

    constructor() {
        this.screens = [];
    }

    addNewScreen(label = "") {
        const wrapper = document.createElement("section");
        wrapper.id = "splash";
        wrapper.classList.add("splashscreen__wrapper");

        const text = document.createElement("h1");
        text.classList.add("splashscreen__title");
        text.innerText = label;

        wrapper.append(text);
        this.screens.push(wrapper);
    }

    async render() {
        for (const screen of this.screens) {
            document.body.append(screen);
            const ref = document.getElementById("splash")
            await new Promise((r) => setTimeout(r, 100))

            ref.classList.add("opened");
            await new Promise((r) => setTimeout(r, 5 * 1000))
            
            ref.classList.remove("opened");
            await new Promise((r) => setTimeout(r, 1.5 * 1000))

            ref.remove();
        }        
    }
}