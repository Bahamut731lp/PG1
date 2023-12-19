class CubeFactory {
    loaders = {
        mesh: new THREE.OBJLoader(),
        texture: new THREE.MTLLoader()
    }

    async CompanionCube() {
        const materials = await new Promise((r) => this.loaders.texture.load("models/EDITOR_companion_cube.mtl", r));
        materials.preload();
        this.loaders.mesh.setMaterials(materials);

        const cube = await new Promise((r) => this.loaders.mesh.load("models/EDITOR_companion_cube.obj", r));
        cube.position.set(0, 0, 0);
        cube.scale.set(0.025, 0.025, 0.025);
        cube.add(new THREE.Box3().setFromObject(cube))

        const mesh = cube.children[0];
        mesh.geometry.center();
        mesh.castShadow = true;
        cube.add(new THREE.BoxHelper(mesh))

        return cube
    }
}

export default CubeFactory;