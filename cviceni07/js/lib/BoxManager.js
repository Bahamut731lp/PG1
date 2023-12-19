class BoxManager {
    constructor(x, y, z) {
        this.size = [x, y, z];
        this.loader = new THREE.TextureLoader();
        this.loader.path = "assets/textures/";
        this.bump = null;
        this.bumpScale = 1;
        this.normal = null;
        this.normalScale = [1, 1];
        
        this.position = {
            x: 0,
            y: 0,
            z: 0,
        }

        this.rotation = {
            x: 0,
            y: 0,
            z: 0,
        }
    }

    setPosition(x, y, z) {
        this.position = { x, y, z }
        return this;
    }

    setRotation(x, y, z) {
        this.rotation = { x, y, z }
        return this;
    }


    setTexture(path) {
        this.texture = path;
        return this;
    }

    setBumpMap(path, intensity = 1) {
        this.bump = path;
        this.bumpScale = intensity;
        return this;
    }

    setNormalMap(path, intensity = [1, 1]) {
        if (typeof intensity == "number") {
            intensity = [intensity, intensity]
        }
        
        this.normal = path;
        this.normalScale = intensity;
        return this;
    }

    setRepetition(x, y = x) {
        this.repeat = [x, y];
        return this;
    }

    async create() {
        let texture, bump, normal;

        texture = await new Promise((resolve) => {
            this.loader.load(this.texture, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(...this.repeat);

                resolve(texture)
            })
        });

        if (this.bump) {
            bump = await new Promise((resolve) => {
                this.loader.load(this.bump, (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(...this.repeat);
    
                    resolve(texture)
                })
            });
        }

        if (this.normal) {
            normal = await new Promise((resolve) => {
                this.loader.load(this.normal, (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(...this.repeat);
    
                    resolve(texture)
                })
            });
        }

        console.log(this.normalScale)
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            bumpMap: bump,
            bumpScale: this.bumpScale,
            normalMap: normal,
            normalScale: new THREE.Vector2(...this.normalScale)
        });

        const object = new THREE.Mesh(new THREE.BoxGeometry(...this.size), material);
        object.position.x = this.position.x;
        object.position.y = this.position.y;
        object.position.z = this.position.z;

        object.rotation.x = this.rotation.x;
        object.rotation.y = this.rotation.y;
        object.rotation.z = this.rotation.z;
        
        object.receiveShadow = true;

        return object;
    }
}

export default BoxManager;