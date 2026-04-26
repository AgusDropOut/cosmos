import React, { useState } from 'react';
import type { IDEConfig } from '../../core/hooks/useIDEConfig';
import { ShortcutCaptureRow } from './config/ShortcutCaptureRow';
import { ConfigLayout } from './config/ConfigLayout';

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: IDEConfig;
    updateConfig: <K extends keyof IDEConfig>(section: K, updates: Partial<IDEConfig[K]>) => void;
}

const overlayStyle: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(6px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
};

const modalStyle: React.CSSProperties = {
    background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6)', width: '600px', height: '400px',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    fontFamily: 'sans-serif'
};

export function ConfigModal({ isOpen, onClose, config, updateConfig }: ConfigModalProps) {
    const [activeTab, setActiveTab] = useState<'shortcuts' | 'editor'>('shortcuts');

    if (!isOpen) return null;

    return (
        <div style={overlayStyle} onMouseDown={onClose}>
            <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid #333', background: '#151515', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>
                        IDE CONFIGURATION
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>

                {/* 2-Column Body */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    
                    {/* Left Sidebar */}
                    <div style={{ width: '160px', background: '#111', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                        <button 
                            onClick={() => setActiveTab('shortcuts')}
                            style={{ 
                                background: activeTab === 'shortcuts' ? '#222' : 'transparent',
                                color: activeTab === 'shortcuts' ? '#4dabf7' : '#aaa',
                                border: 'none',
                                borderLeft: activeTab === 'shortcuts' ? '3px solid #4dabf7' : '3px solid transparent',
                                padding: '12px 16px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '13px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Shortcuts
                        </button>
                        {/* Future tabs go here */}
                    </div>

                    {/* Right Content Area */}
                   < ConfigLayout activeTab={activeTab} config={config} updateConfig={updateConfig} />
                    
                </div>
            </div>
        </div>
    );
}