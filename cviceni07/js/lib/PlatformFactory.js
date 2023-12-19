class PlatformFactory {
    loaders = {
        mesh: new THREE.OBJLoader(),
        texture: new THREE.MTLLoader()
    }

    async create() {
        const materials = await new Promise((r) => this.loaders.texture.load("models/light_rail_platform.mtl", r));
        materials.preload();
        this.loaders.mesh.setMaterials(materials);

        const platform = await new Promise((r) => this.loaders.mesh.load("models/light_rail_platform.obj", r));
        platform.position.set(0, 0, 0);
        platform.scale.set(0.015, 0.015, 0.015);

        const mesh = platform.children[0];
        mesh.geometry.center();
        mesh.material.transparent = false;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return platform
    }    
}

export default PlatformFactory;