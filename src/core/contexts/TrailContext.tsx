// src/core/contexts/TrailContext.tsx
import React from 'react';
import * as THREE from 'three';
import type { IProjectContext, IPreviewStrategy, RenderContext } from '../../types/context';
import type { Node } from 'reactflow';
import { TrailGeometryGenerator } from '../shapes/TrailGeometryGenerator';
import { TrailExporter } from '../exporter/TrailExporter';

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
        const forbidden = ['OUTPUT_FRAG', 'OUTPUT_VERT', 'COLOR', 'MATERIAL_REF'];
        return !forbidden.includes(nodeType);
    },

    SettingsPanel: ({ settings, onSettingChange }) => {
        const segments = settings.segments || 20;
        const materialId = settings.material_id || "bloodyhell:magical_fire"; 

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

                <div style={{ marginTop: '10px' }} />
                <label style={{ fontSize: '11px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    Material ID (Linker):
                    <input 
                        type="text" 
                        value={materialId} 
                        onChange={(e) => onSettingChange('material_id', e.target.value)} 
                        placeholder="modid:shader_name"
                        style={{ 
                            background: '#121212', 
                            color: '#e03131',
                            border: '1px solid #4a4a4a', 
                            padding: '6px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            outline: 'none',
                            fontFamily: 'monospace'
                        }}
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
                const previewMaterial = material
                previewMaterial.side = THREE.DoubleSide;
                
                mesh = new THREE.Mesh(new THREE.BufferGeometry(), previewMaterial);
                scene.add(mesh);
            },
            update: (time: number, settings: Record<string, any>) => {
                if (mesh && camRef) {
                    const t = time * 0.002;
                    targetPos.set(Math.cos(t) * 2, Math.sin(t * 2), Math.sin(t) * 1.5);
                    
                    const oldGeo = mesh.geometry;
                    mesh.geometry = trailGenerator.update(
                        targetPos, 
                        camRef.position, 
                        settings.segments || 20, 
                        0.2 
                    );
                    oldGeo.dispose();
                }
            },
            onSettingsChange: () => {}, 
            dispose: () => {
                if (mesh) {
                    mesh.geometry.dispose();
                    (mesh.material as THREE.Material).dispose();
                    mesh.removeFromParent();
                }
            }
        };
    }
};