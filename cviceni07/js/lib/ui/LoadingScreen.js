class LoadingScreen {
    constructor() {
        this.root = document.getElementById("ui");
        this.completed = false;
        
        const screen = document.createElement("section");
        const image = document.createElement("img");
        const title = document.createElement("h1");

        screen.style = "width: 100vw; height: 100vh";
        image.style = "width: 100%; height: 100%; object-fit: cover";
        title.style = "position: fixed; bottom: 5vh; left: 5vw; font-weight: bold; color: white; font-size: 64px; background: rgba(0, 0, 0, 0.75); padding: 0.25em;";

        image.src = "assets/scenes/level_1/01.jpg";

        title.textContent = "Loading..."

        screen.append(image);
        screen.append(title);

        this.ref = this.root.appendChild(screen);
    }

    async waitForCompletion() {
        await new Promise((resolve) => {
            setInterval(() => {
                if (this.completed) resolve();
            }, 500);
        });

        this.ref.remove();
    }

    async waitForKeyPress() {

    }

    setCompletion(state) {
        this.completed = state;
    }
}

export default LoadingScreen;