// src/components/editor/NodeSearchModal.tsx
import { useState, useEffect, useRef } from 'react';
import { NODE_DEFINITIONS } from '../../core/NodeDefinitions';
import type { IProjectContext } from '../../types/context';

interface NodeSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeContext: IProjectContext;
    addNode: (type: string) => void;
}

const overlayStyle: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
};

const modalStyle: React.CSSProperties = {
    background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)', width: '400px', maxHeight: '70vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
};

export function NodeSearchModal({ isOpen, onClose, activeContext, addNode }: NodeSearchModalProps) {
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus search input when opened
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredNodes = Object.values(NODE_DEFINITIONS)
        .filter(def => activeContext.isNodeAllowed(def.type))
        .filter(def => def.label.toLowerCase().includes(search.toLowerCase()) || def.type.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={overlayStyle} onMouseDown={onClose}>
            <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
                {/* Search Bar */}
                <div style={{ padding: '12px', borderBottom: '1px solid #333', background: '#151515' }}>
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Search nodes..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', background: '#0a0a0a', border: '1px solid #444', color: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>

                {/* Node List */}
                <div style={{ overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredNodes.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontSize: '12px' }}>No nodes found.</div>
                    ) : (
                        filteredNodes.map(def => (
                            <button 
                                key={def.type} 
                                onClick={() => { addNode(def.type); onClose(); }} 
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent',
                                    color: '#ccc', border: 'none', padding: '8px 12px', borderRadius: '4px',
                                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#2a2a2a'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: def.color }} />
                                <span style={{ fontSize: '13px' }}>{def.label}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}