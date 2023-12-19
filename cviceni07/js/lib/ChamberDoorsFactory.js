class ChamberDoorFactory {
    loaders = {
        mesh: new THREE.OBJLoader(),
        texture: new THREE.MTLLoader()
    }

    async create() {
        const materials = await new Promise((r) => this.loaders.texture.load("models/portal_door_combined_model.mtl", r));
        materials.preload();
        this.loaders.mesh.setMaterials(materials);

        const cube = await new Promise((r) => this.loaders.mesh.load("models/portal_door_combined_model.obj", r));
        cube.position.set(0, 0, 0);
        cube.scale.set(0.02, 0.02, 0.02);

        const mesh = cube.children[0];
        mesh.geometry.center();
        mesh.material.transparent = false;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return cube
    }
}

export default ChamberDoorFactory;