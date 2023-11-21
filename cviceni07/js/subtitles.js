class Subtitles {
    constructor() {
        if (!document.getElementById("subtitles")) {
            const wrapper = document.createElement("section");
            wrapper.id = "subtitles";
            wrapper.classList.add("subtitles__wrapper");
    
            document.body.append(wrapper);
        }
    
        this.root = document.getElementById("subtitles") 
    }

    async render(character, line, duration = 5) {
        // Jméno postavy
        const speaker = document.createElement("span");
        speaker.style = `color: ${character.color}; font-weight: bold;`;
        speaker.innerText = `${character.name}:`;

        //Samotný text
        const text = document.createElement("span");
        text.textContent = line;

        //Kontainer pro titulky
        const id = crypto.randomUUID();
        const container = document.createElement("div");
        container.id = id;
        container.classList.add("subtitle");
        container.append(speaker)
        container.append(text)

        //Přidání do obrazu
        this.root.append(container)

        //Vyčkání
        await new Promise((r) => setTimeout(r, duration * 1000));

        //Odstranění titulku
        container.remove();
    }
}

export default Subtitles