// src/core/contexts/TrailContext.tsx
import React from 'react';
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
        const trailGenerator = new TrailGeometryGenerator();
        const targetPos = new THREE.Vector3();
        let camRef: THREE.PerspectiveCamera | null = null;

        return {
            init: ({ scene, material, camera }: RenderContext) => {
                camRef = camera;
                
                // Utilizes the shared material reference injected by the renderer
                material.side = THREE.DoubleSide;
                
                mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
                scene.add(mesh);
            },
            update: (time: number, settings: Record<string, any>, graph?: ShaderGraph) => {
            if (mesh && camRef) {
                const t = time * 0.002;
                let currentTarget = new THREE.Vector3(Math.cos(t) * 2, Math.sin(t * 2), Math.sin(t) * 1.5);
                let currentWidth = 0.2;

                if (graph) {
                    const endpoint = graph.nodes.find(n => n.type === 'TRAIL_ENDPOINT');
                    if (endpoint) {
                        // Initialize the live evaluator for this exact frame
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

                const oldGeo = mesh.geometry;
                mesh.geometry = trailGenerator.update(currentTarget, camRef.position, settings.segments || 20, currentWidth);
                oldGeo.dispose();
            }
        },
            onSettingsChange: () => {}, 
            dispose: () => {
                if (mesh) {
                    mesh.geometry.dispose();
                    mesh.removeFromParent();
                }
            }
        };
    }
};