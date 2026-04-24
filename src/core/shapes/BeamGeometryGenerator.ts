// src/core/shapes/BeamGeometryGenerator.ts
import * as THREE from 'three';


    
/**
  * @param startPos The origin of the beam (e.g., caster's hand)
  * @param endPos The impact point of the beam
  * @param radialSegments How many sides the beam has (3 = triangle, 4 = square, 16 = circle)
  * @param lengthSegments How many slices along the length (higher = smoother radius curves)
  * @param radiusFunc A callback to evaluate the AST math at a specific point along the beam (v)
 **/
export class BeamGeometryGenerator {
    
    public update(
        startPos: THREE.Vector3, 
        endPos: THREE.Vector3, 
        radialSegments: number,
        lengthSegments: number,
        evaluateGraph: (v: number) => { radius: number, offset: THREE.Vector3 } // ONLY 'v' NOW!
    ): THREE.BufferGeometry {
        
        const geometry = new THREE.BufferGeometry();

        const dir = new THREE.Vector3().subVectors(endPos, startPos);
        const length = dir.length();
        
        if (length < 0.0001) return geometry;
        dir.normalize();

        const up = new THREE.Vector3(0, 1, 0);
        if (Math.abs(dir.y) > 0.999) up.set(1, 0, 0); 
        
        const right = new THREE.Vector3().crossVectors(up, dir).normalize();
        up.crossVectors(dir, right).normalize();

        const positions: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        //  The "Z Segments" along the length 
        for (let i = 0; i <= lengthSegments; i++) {
            const v = i / lengthSegments; 
            const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, v);
            
            //  Evaluate AST ONCE per slice (Path Deformation)
            const evalResult = evaluateGraph(v);

           
            currentPos.add(evalResult.offset);

            // Draw the cylinder ring 
            for (let j = 0; j <= radialSegments; j++) {
                const u = j / radialSegments; 
                const theta = u * Math.PI * 2;

                const cos = Math.cos(theta);
                const sin = Math.sin(theta);

                // Draw the ring around the newly displaced center point
                const vx = currentPos.x + (right.x * cos + up.x * sin) * evalResult.radius;
                const vy = currentPos.y + (right.y * cos + up.y * sin) * evalResult.radius;
                const vz = currentPos.z + (right.z * cos + up.z * sin) * evalResult.radius;

                positions.push(vx, vy, vz);

                const mappedU = -1.0 + (u * 2.0);
                uvs.push(mappedU, v);
            }
        }

        
        for (let i = 0; i < lengthSegments; i++) {
            for (let j = 0; j < radialSegments; j++) {
                const a = i * (radialSegments + 1) + j;
                const b = a + radialSegments + 1;
                const c = b + 1;
                const d = a + 1;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals(); 

        return geometry;
    }
}