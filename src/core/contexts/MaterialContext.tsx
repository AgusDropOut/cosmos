// src/core/contexts/MaterialContext.tsx
import React from 'react';
import * as THREE from 'three';
import type { IProjectContext, IPreviewStrategy } from '../../types/context';
import { ShapeRegistry } from '../shapes/ShapeRegistry';
import type { Node } from 'reactflow';
import { MaterialExporter } from '../exporter/MaterialExporter';

const getSafeGenerator = (shapeKey: string) => {
    return ShapeRegistry[shapeKey] || ShapeRegistry['CUBE'];
};

export const MaterialContext: IProjectContext = {
    id: 'MATERIAL',
    name: 'Material & Entity',
    
    getInitialNodes: (): Node[] => [
        { id: 'out-1', type: 'OUTPUT_FRAG', position: { x: 600, y: 150 }, data: { astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }, { id: 'alpha', type: 'float', value: 1.0 }], outputs: [] } },
        { id: 'out-vert-1', type: 'OUTPUT_VERT', position: { x: 600, y: 300 }, data: { astType: 'OUTPUT_VERT', inputs: [{ id: 'position_offset', type: 'vec3' }, { id: 'scale', type: 'float', value: 1.0 }], outputs: [] } }
    ],

    isNodeAllowed: (nodeType: string) => true, 

    SettingsPanel: ({ settings, onSettingChange }) => {
        const selectedShape = settings.shape || 'CUBE';
        return (
            <>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>BASE SHAPE</div>
                <select 
                    value={selectedShape} 
                    onChange={(e) => onSettingChange('shape', e.target.value)} 
                    style={{ background: '#121212', color: 'white', border: '1px solid #4a4a4a', padding: '4px', borderRadius: '4px', fontSize: '11px', outline: 'none', width: '100%' }}
                >
                    {Object.keys(ShapeRegistry).map((shapeKey) => (
                        <option key={shapeKey} value={shapeKey}>
                            {shapeKey.replace('_', ' ')}
                        </option>
                    ))}
                </select>
            </>
        );
    },

    createPreviewStrategy: (): IPreviewStrategy => {
        let mesh: THREE.Mesh | null = null;
        let currentShape = 'CUBE';

        return {
            init: ({ scene, material }, settings) => {
                currentShape = settings.shape || 'CUBE';
                const generator = getSafeGenerator(currentShape);
                mesh = new THREE.Mesh(generator.generate(), material);
                scene.add(mesh);
            },
            update: (time, settings) => {
                // Only spin the mesh if we are NOT in 2D mode
                if (mesh && currentShape !== '2D_QUAD') {
                    mesh.rotation.x += 0.005;
                    mesh.rotation.y += 0.005;
                }
            },
            onSettingsChange: (settings) => {
                if (mesh && currentShape !== settings.shape) {
                    currentShape = settings.shape;
                    const oldGeo = mesh.geometry;
                    const generator = getSafeGenerator(currentShape);
                    mesh.geometry = generator.generate();
                    oldGeo.dispose();

                   
                    if (currentShape !== '2D_QUAD') {
                        mesh.rotation.set(0, 0, 0);
                    }
                }
            },
            dispose: () => {
                if (mesh) {
                    mesh.geometry.dispose();
                    mesh.removeFromParent();
                }
            }
        };
    },
    getExporter: () => new MaterialExporter()
};