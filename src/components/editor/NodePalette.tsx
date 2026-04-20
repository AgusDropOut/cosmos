// src/components/editor/NodePalette.tsx
import { useState } from 'react';
import { NODE_DEFINITIONS } from '../../core/NodeDefinitions';
import type { IProjectContext } from '../../types/context';

interface NodePaletteProps {
    activeContext: IProjectContext;
    addNode: (type: string) => void;
}

// Organize your nodes into logical folders
const NODE_CATEGORIES = [
    { id: 'input', label: 'Inputs & Context', nodes: ['UV_COORDS', 'TIME', 'VERTEX_COLOR'] },
    { id: 'math', label: 'Math Operations', nodes: ['MATH_BINARY', 'MATH_UNARY', 'SMOOTHSTEP'] },
    { id: 'vector', label: 'Vector Math', nodes: ['SPLIT_VEC2', 'PACK_VEC2', 'PACK_VEC3', 'VECTOR_MATH', 'VECTOR_SCALAR_MATH'] },
    { id: 'color', label: 'Color & Blending', nodes: ['COLOR', 'MIX_COLORS'] },
    { id: 'noise', label: 'Procedural Noise', nodes: ['FBM_NOISE_2D', 'RIDGE_NOISE_3D'] },
    { id: 'output', label: 'Outputs', nodes: ['OUTPUT_FRAG', 'OUTPUT_VERT'] },
];

const sidebarStyle: React.CSSProperties = {
    width: '240px',
    height: '100%',
    background: '#121212',
    borderRight: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
};

export function NodePalette({ activeContext, addNode }: NodePaletteProps) {
    // Keep track of which folders are open (default all open, or just specific ones)
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
        input: true, math: true, vector: true, color: true, noise: true, output: true
    });

    const toggleFolder = (id: string) => {
        setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div style={sidebarStyle}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a2a', fontSize: '11px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>
                NODE LIBRARY
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {NODE_CATEGORIES.map(category => {
                    const isOpen = openFolders[category.id];
                    
                    // Only show folder if context allows at least one node in it
                    const allowedNodes = category.nodes.filter(type => activeContext.isNodeAllowed(type) && NODE_DEFINITIONS[type]);
                    if (allowedNodes.length === 0) return null;

                    return (
                        <div key={category.id} style={{ marginBottom: '8px' }}>
                            {/* Folder Header */}
                            <div 
                                onClick={() => toggleFolder(category.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', padding: '6px 8px', cursor: 'pointer',
                                    color: '#ccc', fontSize: '11px', fontWeight: '600', userSelect: 'none',
                                    background: isOpen ? '#1a1a1a' : 'transparent', borderRadius: '4px'
                                }}
                            >
                                <span style={{ marginRight: '6px', fontSize: '9px', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.1s' }}>
                                    ▶
                                </span>
                                {category.label}
                            </div>

                            {/* Node Buttons inside Folder */}
                            {isOpen && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '14px' }}>
                                    {allowedNodes.map(type => {
                                        const def = NODE_DEFINITIONS[type];
                                        return (
                                            <button 
                                                key={def.type} 
                                                onClick={() => addNode(def.type)} 
                                                style={{ 
                                                    background: 'transparent',
                                                    color: def.color, 
                                                    border: 'none',
                                                    borderLeft: `2px solid ${def.color}80`, 
                                                    padding: '6px 8px', 
                                                    fontSize: '11px', 
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.1s ease',
                                                    borderRadius: '0 4px 4px 0'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#222'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {def.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}