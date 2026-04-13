// src/core/contexts/MaterialContext.tsx
import React from 'react';
import type { IProjectContext } from '../../types/context';
import { ShapeRegistry } from '../shapes/ShapeRegistry';
import type { Node } from 'reactflow';

export const MaterialContext: IProjectContext = {
    id: 'MATERIAL',
    name: 'Material & Entity',
    
    getInitialNodes: (): Node[] => [
        { id: 'out-1', type: 'OUTPUT_FRAG', position: { x: 600, y: 150 }, data: { astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }], outputs: [] } },
        { id: 'out-vert-1', type: 'OUTPUT_VERT', position: { x: 600, y: 300 }, data: { astType: 'OUTPUT_VERT', inputs: [{ id: 'position_offset', type: 'vec3' }, { id: 'scale', type: 'float', value: 1.0 }], outputs: [] } }
    ],

    isNodeAllowed: (nodeType: string) => {
        return true; 
    },

    
    SettingsPanel: ({ settings, onSettingChange }) => {
        const selectedShape = settings.shape || 'CUBE';
        return (
            <>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>BASE SHAPE</div>
                <select 
                    value={selectedShape} 
                    onChange={(e) => onSettingChange('shape', e.target.value)} 
                    style={{ background: '#121212', color: 'white', border: '1px solid #4a4a4a', padding: '4px', borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                >
                    {Object.keys(ShapeRegistry).map((shapeKey) => (
                        <option key={shapeKey} value={shapeKey}>
                            {shapeKey.charAt(0) + shapeKey.slice(1).toLowerCase()}
                        </option>
                    ))}
                </select>
            </>
        );
    }
};