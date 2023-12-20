import SCENES from "./main_menu.js";

function thank_you(resolve) {
    const root = document.getElementById("ui");
    const img = document.createElement("img");

    const container = document.createElement("div");
    const button = document.createElement("button");
    const title = document.createElement("h1");
    const paragraph = document.createElement("p");

    img.onload = () => document.body.classList.add("visible");
    img.src = "assets/scenes/thank_you/lena-tosjatova-13.jpg";
    img.style = "width: 100%; height: 100%; object-fit: cover; opacity: 0.33"

    container.style = "position: fixed; top: 0; width: 100vw; height: 100vh; display: grid; place-items: center";

    title.innerText = "Thank you";
    title.style = "font-weight: 700; font-size: 5rem; color: white; transition: all 1.5s; margin: 0;";

    paragraph.innerText = "Thank you for playing an early version of PONG|2 - Hopefully, this will get me enough credit so that I can pass the exam.";
    paragraph.style = "color: white";

    button.onclick = async () => {
        document.body.classList.remove("visible");
        await new Promise((r) => setTimeout(r, 200));

        document.getElementById("ui").innerHTML = "";
        
        resolve(SCENES.menu.init);
    }
    button.innerText = "Back to menu";
    button.className = "menu__button";
    button.style = "width: auto";
    
    container.append(title, paragraph, button);
    root.append(img, container);
}

export default thank_you;