class Score {
    constructor(position) {
        this.root = document.getElementById("ui");
        this.value = 0;
    
        const style = {
            "position": "fixed",
            "color": "white",
            "font-size": "6rem",
            ...position
        }

        const styleProp = Object.entries(style).map(v => v.join(":")).join(";")
        const scoreElement = document.createElement("div");
        scoreElement.style = styleProp;
        scoreElement.className = "score";
        scoreElement.innerText = this.value;

        this.ref = this.root.appendChild(scoreElement)

        return [this, (fn) => { this.update(fn(this.value)) }]
    }

    update(value) {
        this.value = value;
        this.ref.innerText = this.value;
    }
}

export default Score;