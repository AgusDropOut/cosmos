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

const selectStyle = {
    background: '#121212', 
    color: 'white', 
    border: '1px solid #4a4a4a', 
    padding: '4px', 
    borderRadius: '4px', 
    fontSize: '11px', 
    outline: 'none', 
    width: '100%',
    marginBottom: '8px'
};

const labelStyle = { 
    color: '#ccc', 
    fontSize: '10px', 
    fontWeight: 'bold',
    marginTop: '8px',
    display: 'block' 
};

export const MaterialContext: IProjectContext = {
    id: 'MATERIAL',
    name: 'Material & Entity',
    
    getInitialNodes: (): Node[] => [
        { id: 'out-1', type: 'OUTPUT_FRAG', position: { x: 600, y: 150 }, data: { astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }, { id: 'alpha', type: 'float', value: 1.0 }], outputs: [] } },
        { id: 'out-vert-1', type: 'OUTPUT_VERT', position: { x: 600, y: 300 }, data: { astType: 'OUTPUT_VERT', inputs: [{ id: 'position_offset', type: 'vec3' }, { id: 'scale', type: 'float', value: 1.0 }], outputs: [] } }
    ],

    isNodeAllowed: (nodeType: string) => {
        const forbiddenForMaterial = [
            'TRAIL_ENDPOINT'
        ];
        return !forbiddenForMaterial.includes(nodeType);
    }, 

    SettingsPanel: ({ settings, onSettingChange }) => {
        const selectedShape = settings.shape || 'CUBE';
        const blendMode = settings.blend_mode || 'OPAQUE';
        const cullMode = settings.cull_mode || 'BACK';
        const depthTest = settings.depth_test || 'LEQUAL';
        const depthWrite = settings.depth_write !== undefined ? settings.depth_write : true;
        const alphaCutoff = settings.alpha_cutoff || 0.0;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={labelStyle}>BASE PREVIEW SHAPE</span>
                <select value={selectedShape} onChange={(e) => onSettingChange('shape', e.target.value)} style={selectStyle}>
                    {Object.keys(ShapeRegistry).map((shapeKey) => (
                        <option key={shapeKey} value={shapeKey}>{shapeKey.replace('_', ' ')}</option>
                    ))}
                </select>

                <div style={{ borderTop: '1px solid #333', margin: '8px 0' }} />
                <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>RENDER STATE</span>

                <span style={labelStyle}>BLEND MODE</span>
                <select value={blendMode} onChange={(e) => onSettingChange('blend_mode', e.target.value)} style={selectStyle}>
                    <option value="OPAQUE">OPAQUE (Solid)</option>
                    <option value="TRANSLUCENT">TRANSLUCENT (Alpha)</option>
                    <option value="ADDITIVE">ADDITIVE (Glow)</option>
                    <option value="MULTIPLY">MULTIPLY (Shadow/Darken)</option>
                </select>

                <span style={labelStyle}>CULL MODE (FACE RENDERING)</span>
                <select value={cullMode} onChange={(e) => onSettingChange('cull_mode', e.target.value)} style={selectStyle}>
                    <option value="BACK">BACK (Standard)</option>
                    <option value="FRONT">FRONT (Inside-out)</option>
                    <option value="NONE">NONE (Double-sided)</option>
                </select>

                <span style={labelStyle}>DEPTH TEST</span>
                <select value={depthTest} onChange={(e) => onSettingChange('depth_test', e.target.value)} style={selectStyle}>
                    <option value="LEQUAL">LEQUAL (Normal)</option>
                    <option value="ALWAYS">ALWAYS (Render through walls)</option>
                </select>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={labelStyle}>ALPHA CUTOFF (PUNCHTHROUGH)</span>
                    <span style={{ color: '#888', fontSize: '10px' }}>{alphaCutoff.toFixed(2)}</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="1" step="0.05" 
                    value={alphaCutoff} 
                    onChange={(e) => onSettingChange('alpha_cutoff', parseFloat(e.target.value))} 
                    style={{ width: '100%', marginBottom: '8px' }}
                />

                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                    <input 
                        type="checkbox" 
                        checked={depthWrite} 
                        onChange={(e) => onSettingChange('depth_write', e.target.checked)} 
                    />
                    WRITE TO DEPTH BUFFER (Z-WRITE)
                </label>
            </div>
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