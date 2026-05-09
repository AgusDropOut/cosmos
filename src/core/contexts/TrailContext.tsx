
import * as THREE from 'three';
import type { IProjectContext, IPreviewStrategy, RenderContext } from '../../types/context';
import type { Node } from 'reactflow';
import { TrailGeometryGenerator } from '../shapes/TrailGeometryGenerator';
import { TrailExporter } from '../exporter/TrailExporter';
import { AstEvaluator } from '../compiler';
import type { ShaderGraph } from '../../types/ast';

export const TrailContext: IProjectContext = {
    id: 'TRAIL',
    name: 'Trail Projectile',
    requiresGlobalMaterial: true,
    
    getExporter: () => new TrailExporter(),

    getInitialNodes: (): Node[] => [
        { 
            id: 'trail-out-1', 
            type: 'TRAIL_ENDPOINT', 
            position: { x: 600, y: 150 }, 
            data: { 
                astType: 'TRAIL_ENDPOINT', 
                inputs: [
                    { id: 'width', type: 'float', value: 1.0 },
                    { id: 'orbit_offset', type: 'vec3', value: { r: 0, g: 0, b: 0 } }
                ], 
                outputs: [] 
            } 
        }
    ],

    isNodeAllowed: (nodeType: string) => {
        const allowedMathNodes = [
            'TRAIL_ENDPOINT',
            'TIME',
            'MATH_BINARY',
            'MATH_UNARY',
            'VECTOR_MATH',
            'VECTOR_SCALAR_MATH',
            'SPLIT_VEC2',
            'PACK_VEC2',
            'PACK_VEC3'
        ];
        return allowedMathNodes.includes(nodeType);
    },

    SettingsPanel: ({ settings, onSettingChange }) => {
        const segments = settings.segments || 20;

        return (
            <>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>TRAIL SETTINGS</div>
                
                <label style={{ fontSize: '11px', color: '#ccc' }}>Segments: {segments}
                    <input 
                        type="range" min="5" max="50" step="1" value={segments} 
                        onChange={(e) => onSettingChange('segments', parseInt(e.target.value))} 
                        style={{ width: '100%', marginTop: '4px' }}
                    />
                </label>
            </>
        );
    },

    createPreviewStrategy: (): IPreviewStrategy => {
        let mesh: THREE.Mesh | null = null;
        let grid: THREE.GridHelper | null = null;
        let entityMesh: THREE.Mesh | null = null;
        
        let trailGenerator = new TrailGeometryGenerator();
        let camRef: THREE.PerspectiveCamera | null = null;
        
        let lastLoop = 0; 

        return {
            init: ({ scene, material, camera }: RenderContext) => {
                camRef = camera;
                
                material.side = THREE.DoubleSide;
                mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
                scene.add(mesh);

                grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
                grid.position.y = -2; 
                scene.add(grid);

                const entityGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
                const entityMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                entityMesh = new THREE.Mesh(entityGeo, entityMat);
                scene.add(entityMesh);

                camera.position.set(0, 3, 10); 
                camera.lookAt(0, 0, 0);
            },
            update: (time: number, settings: Record<string, any>, graph?: ShaderGraph) => {
                if (mesh && camRef && entityMesh) {
                    
                    const LOOP_DURATION = 1500; 
                    const currentLoop = Math.floor(time / LOOP_DURATION);
                    const p = (time % LOOP_DURATION) / LOOP_DURATION; 

                    if (currentLoop > lastLoop) {
                        lastLoop = currentLoop;
                        trailGenerator = new TrailGeometryGenerator(); 
                    }

                    const startX = -5, endX = 5;
                    const startZ = -2, endZ = 2;
                    
                    const currentX = startX + (endX - startX) * p;
                    const currentZ = startZ + (endZ - startZ) * p;
                    
                    const ground = -2; 
                    const peak = 5;    
                    const currentY = ground + 4 * peak * p * (1 - p);

                    let currentTarget = new THREE.Vector3(currentX, currentY, currentZ);
                    let currentWidth = 0.2;

                    if (graph) {
                        const endpoint = graph.nodes.find(n => n.type === 'TRAIL_ENDPOINT');
                        if (endpoint) {
            
                            const evaluator = new AstEvaluator(graph, time * 0.001);
                            
                            const evaluatedWidth = evaluator.evaluatePort(endpoint.id, 'width');
                            if (typeof evaluatedWidth === 'number') currentWidth = evaluatedWidth;

                            const offset = evaluator.evaluatePort(endpoint.id, 'orbit_offset');
                            if (offset && (offset.x !== undefined || offset.r !== undefined)) {
                                currentTarget.add(new THREE.Vector3(
                                    offset.x ?? offset.r ?? 0,
                                    offset.y ?? offset.g ?? 0,
                                    offset.z ?? offset.b ?? 0
                                ));
                            }
                        }
                    }

                    entityMesh.position.copy(currentTarget);
                    entityMesh.rotation.x += 0.1; 
                    entityMesh.rotation.y += 0.1;

                    const oldGeo = mesh.geometry;
                    mesh.geometry = trailGenerator.update(
                        currentTarget, 
                        camRef.position, 
                        settings.segments || 20, 
                        currentWidth 
                    );
                    oldGeo.dispose();
                }
            },
            onSettingsChange: () => {}, 
            dispose: () => {
                if (mesh) { mesh.geometry.dispose(); mesh.removeFromParent(); }
                if (grid) { grid.geometry.dispose(); grid.removeFromParent(); }
                if (entityMesh) { entityMesh.geometry.dispose(); entityMesh.removeFromParent(); }
            }
        };
    },
    getDefaultSettings: () => ({ segments: 20 })
};