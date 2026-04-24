// src/core/shapes/ShapeRegistry.ts
import * as THREE from 'three';


export interface IShapeGenerator {
    generate(): THREE.BufferGeometry;
}

//  Standard Three.js Shapes (Wrappers)
export class CubeShape implements IShapeGenerator {
    generate() { return new THREE.BoxGeometry(0.8, 0.8, 0.8); }
}

export class SphereShape implements IShapeGenerator {
    generate() { return new THREE.SphereGeometry(0.6, 32, 32); }
}

export class CylinderShape implements IShapeGenerator {
    generate() { return new THREE.CylinderGeometry(0.5, 0.5, 1.0, 32); }
}

export class IcosahedronShape implements IShapeGenerator {
    generate() { return new THREE.IcosahedronGeometry(0.6, 0); }
}

export class QuadShape implements IShapeGenerator {
    generate() { 
        return new THREE.PlaneGeometry(2, 2); 
    }
}

//  Shape (The Star)
export class StarLampShape implements IShapeGenerator {
    
    // Helper to mirror getIcosahedronVertices()
    private getIcosahedronVertices(scale: number): THREE.Vector3[] {
        const phi = (1.0 + Math.sqrt(5.0)) / 2.0; // Golden ratio (t in Java)
        const s = (1.0 / Math.sqrt(1 + phi * phi)) * scale;
        const t = phi * s;

        return [
            new THREE.Vector3(-s, t, 0), new THREE.Vector3(s, t, 0), new THREE.Vector3(-s, -t, 0), new THREE.Vector3(s, -t, 0),
            new THREE.Vector3(0, -s, t), new THREE.Vector3(0, s, t), new THREE.Vector3(0, -s, -t), new THREE.Vector3(0, s, -t),
            new THREE.Vector3(t, 0, -s), new THREE.Vector3(t, 0, s), new THREE.Vector3(-t, 0, -s), new THREE.Vector3(-t, 0, s)
        ];
    }

    // Helper to mirror getIcosahedronFaces()
    private getIcosahedronFaces(): number[][] {
        return [
            [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
            [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
            [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
            [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
        ];
    }

    generate() {
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];

        // Values tuned to fit nicely inside the WebGL preview canvas
        const baseScale = 0.35; 
        const tipScale = 0.7;

        const baseVerts = this.getIcosahedronVertices(baseScale);
        const tipVerts = this.getIcosahedronVertices(tipScale);
        const faces = this.getIcosahedronFaces();

        // Helper to push a single triangle to the raw array
        const addTri = (v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) => {
            vertices.push(v1.x, v1.y, v1.z,  v2.x, v2.y, v2.z,  v3.x, v3.y, v3.z);
        };

        // Mirroring your addDoubleSidedTri logic (Winding order swap)
        const addDoubleSidedTri = (v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) => {
            addTri(v1, v2, v3);
            addTri(v3, v2, v1); // Reverse winding creates the backface
        };

      
        for (const f of faces) {
            const v1 = baseVerts[f[0]];
            const v2 = baseVerts[f[1]];
            const v3 = baseVerts[f[2]];

            const t1 = tipVerts[f[0]];
            const t2 = tipVerts[f[1]];
            const t3 = tipVerts[f[2]];

            addDoubleSidedTri(v1, v2, t3);
            addDoubleSidedTri(v2, v3, t1);
            addDoubleSidedTri(v3, v1, t2);
            addDoubleSidedTri(v1, v2, v3);
        }

       
        const positionArray = new Float32Array(vertices);
        geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        
        
        geometry.computeVertexNormals();

        return geometry;
    }
}

// 4. The Master Registry
export const ShapeRegistry: Record<string, IShapeGenerator> = {
    'CUBE': new CubeShape(),
    'SPHERE': new SphereShape(),
    'CYLINDER': new CylinderShape(),
    'ICOSAHEDRON': new IcosahedronShape(),
    'STAR': new StarLampShape(),
    '2D_QUAD': new QuadShape()
};