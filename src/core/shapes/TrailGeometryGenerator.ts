// src/core/shapes/TrailGeometryGenerator.ts
import * as THREE from 'three';

export class TrailGeometryGenerator {
    private history: THREE.Vector3[] = [];

    public update(
        targetPos: THREE.Vector3, 
        cameraPos: THREE.Vector3, 
        maxLength: number, 
        baseWidth: number
    ): THREE.BufferGeometry {
        
        this.history.unshift(targetPos.clone());
        if (this.history.length > maxLength) {
            this.history.pop();
        }

        const geometry = new THREE.BufferGeometry();

        if (this.history.length < 2) {
            return geometry;
        }

        const curve = new THREE.CatmullRomCurve3(this.history);
        const smoothHistory = curve.getPoints(this.history.length * 3);
        const size = smoothHistory.length;

        const positions: number[] = [];
        const uvs: number[] = [];

        const vStep = 2.0 / (size - 1);

        for (let i = 0; i < size - 1; i++) {
            const current = smoothHistory[i];
            const next = smoothHistory[i + 1];

            const dir = new THREE.Vector3().subVectors(next, current).normalize();
            
            const toCameraCurrent = new THREE.Vector3().subVectors(cameraPos, current).normalize();
            const rightCurrent = new THREE.Vector3().crossVectors(dir, toCameraCurrent).normalize().multiplyScalar(baseWidth);

            const toCameraNext = new THREE.Vector3().subVectors(cameraPos, next).normalize();
            const rightNext = new THREE.Vector3().crossVectors(dir, toCameraNext).normalize().multiplyScalar(baseWidth);

            const v1 = -1.0 + (i * vStep);
            const v2 = -1.0 + ((i + 1) * vStep);

            positions.push(
                current.x - rightCurrent.x, current.y - rightCurrent.y, current.z - rightCurrent.z,
                current.x + rightCurrent.x, current.y + rightCurrent.y, current.z + rightCurrent.z,
                next.x + rightNext.x, next.y + rightNext.y, next.z + rightNext.z,
                
                current.x - rightCurrent.x, current.y - rightCurrent.y, current.z - rightCurrent.z,
                next.x + rightNext.x, next.y + rightNext.y, next.z + rightNext.z,
                next.x - rightNext.x, next.y - rightNext.y, next.z - rightNext.z
            );

            uvs.push(
                -1.0, v1,
                1.0, v1,
                1.0, v2,

                -1.0, v1,
                1.0, v2,
                -1.0, v2
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        return geometry;
    }
}