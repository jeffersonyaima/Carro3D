import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class {
    constructor() {

        this.threejsCanvas = document.querySelector('.threejs__canvas__container')
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        this.camera.position.set(12, 6, 12)
        this.camera.lookAt(0, 0, 0)

        this.tire = document.querySelector('.car__tire')

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.threejsCanvas.appendChild(this.renderer.domElement)


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true

        // const gridHelper = new THREE.GridHelper(20, 20);
        // this.scene.add(gridHelper);

        // const axesHelper = new THREE.AxesHelper(10);
        // this.scene.add(axesHelper);

        this.raycaster = new THREE.Raycaster()

        this.mouse = new THREE.Vector2()
        this.modelLoaded = false

        this.setUpScene()
        this.addLights()

    }

    setUpScene() {

        const manager = new THREE.LoadingManager(() => {
            setTimeout(() => {

                const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 16);
                const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
                this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                this.sphere.position.set(4.2, -0.5, 8)

                const ringGeometry = new THREE.TorusGeometry(0.3, 0.04, 16, 100);
                const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
                this.ring.position.set(4.2, -0.5, 8)
                this.ring.rotation.set(0, Math.PI / 4, 0)
                this.scene.add(this.sphere, this.ring)

                this.modelLoaded = true
                
            }, 1000)
        })

        const carLoader = new GLTFLoader(manager)

        // Instantiate a loader
        const dracoLoader = new DRACOLoader();

        // Specify path to a folder containing WASM/JS decoding libraries.
        dracoLoader.setDecoderPath('/draco/');
        
        carLoader.setDRACOLoader(dracoLoader)
        
        carLoader.load('/models/mercedes.glb', (gltf) => {
            this.scene.add(gltf.scene)
        })
    }

    addLights() {
        this.light = new THREE.AmbientLight(0xFFFFFF, 1)
        this.light.position.set(10, 10, 0)

        this.scene.add(this.light)
    }

    
    onMouseDown() {
    }

    onMouseUp() {
    }

    onMouseMove(event) {
        if (this.modelLoaded) {

            this.mouse.x = (event.clientX / this.width) * 2 - 1
            this.mouse.y = - (event.clientY / this.height) * 2 + 1

            this.raycaster.setFromCamera(this.mouse, this.camera)

            const objects = [this.sphere, this.ring]
            this.intersects = this.raycaster.intersectObjects(objects)

            if (this.intersects.length > 0) {
                this.tire.style.display = 'block'

            } else {
                this.tire.style.display = 'none'
            }
        }
    }

    update() {
        this.renderer.render(this.scene, this.camera)
        this.controls.update()

        if (this.modelLoaded) {
            this.ring.rotation.x += 0.01;
            this.ring.rotation.y += 0.01;
        }
    }


    onResize() {
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

    }

    /**
     * Destroy.
     */
    destroy() {
        this.destroyThreejs(this.scene)
    }

    destroyThreejs(obj) {
        while (obj.children.length > 0) {
            this.destroyThreejs(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop])
                    return;
                if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose();
            })
            // obj.material.dispose();
        }
    }
}