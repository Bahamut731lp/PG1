export class SplashScreen {

    constructor() {
        this.screens = [];
    }

    addNewScreen(title = "", subtitle = "", length = 5) {
        const wrapper = document.createElement("section");
        wrapper.id = "splash";
        wrapper.classList.add("splashscreen__wrapper");

        const container = document.createElement("div");

        const titleElement = document.createElement("h1");
        titleElement.classList.add("splashscreen__title");
        titleElement.innerHTML = title;

        const subElement = document.createElement("h2");
        subElement.classList.add("splashscreen__subtitle");
        subElement.innerHTML = subtitle;
    
        container.append(subElement);
        container.append(titleElement);
        wrapper.append(container);

        this.screens.push({
            element: wrapper,
            length
        });

        return this;
    }

    async render() {
        for (const screen of this.screens) {
            document.body.append(screen.element);
            const ref = document.getElementById("splash")
            await new Promise((r) => setTimeout(r, 100))

            ref.classList.add("opened");
            await new Promise((r) => setTimeout(r, screen.length * 1000))
            
            ref.classList.remove("opened");
            await new Promise((r) => setTimeout(r, 1.5 * 1000))

            ref.remove();
        }        
    }
}

export default SplashScreen