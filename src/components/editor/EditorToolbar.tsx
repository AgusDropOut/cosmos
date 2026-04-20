// src/components/editor/EditorToolbar.tsx
import type { IProjectContext } from '../../types/context';
import type { ShaderGraph } from '../../types/ast';
import type { Node, Edge } from 'reactflow';

import { useState, useRef, useEffect } from 'react';


 interface EditorToolbarProps {
    globalSettings: { namespace: string; projectName: string };
    onGlobalSettingChange: (key: string, value: any) => void;
    activeContext: IProjectContext;
    availableContexts: IProjectContext[];
    onContextChange: (contextId: string) => void;
    onFlowChange: (nodes: Node[], edges: Edge[], graph: ShaderGraph, past: any[], future: any[]) => void;
    nodes: Node[];
    edges: Edge[];
    graph: ShaderGraph;
    history: { past: any[]; future: any[] };
    handleGameExport: () => void;
    handleSave: (manual: boolean) => void;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onOpenNodeMenu: () => void;
    onOpenPresetMenu: () => void;
    contextSettings: Record<string, any>;
    onSettingChange: (key: string, value: any) => void;
}

const headerStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 16px', background: '#181818', borderBottom: '1px solid #2a2a2a',
    height: '40px', boxSizing: 'border-box', width: '100%', zIndex: 10, userSelect: 'none'
};

const menuButtonStyle: React.CSSProperties = {
    background: 'transparent', color: '#ccc', border: 'none', padding: '4px 12px',
    fontSize: '12px', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.1s'
};

const dropdownStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', left: 0, background: '#1e1e1e',
    border: '1px solid #333', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    padding: '8px', minWidth: '160px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '4px'
};

const compactInputStyle: React.CSSProperties = {
    background: 'transparent', color: '#fff', border: 'none', borderBottom: '1px dashed #444',
    padding: '2px 4px', fontSize: '12px', outline: 'none', width: '100px', transition: 'border 0.2s'
};

export function EditorToolbar({
    globalSettings, onGlobalSettingChange, activeContext, availableContexts, onContextChange, onFlowChange,
    nodes, edges, graph, history, handleGameExport, handleSave, handleFileUpload, fileInputRef,
    onOpenNodeMenu, onOpenPresetMenu, contextSettings, onSettingChange
}: EditorToolbarProps) {
    
    const [activeMenu, setActiveMenu] = useState<'file' | 'settings' | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (menu: 'file' | 'settings') => setActiveMenu(activeMenu === menu ? null : menu);

    return (
        <div style={headerStyle}>
            {/* Left: Standard IDE Menus */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }} ref={menuRef}>
                
                {/* FILE MENU */}
                <div style={{ position: 'relative' }}>
                    <button style={{ ...menuButtonStyle, background: activeMenu === 'file' ? '#333' : 'transparent' }} onClick={() => toggleMenu('file')}>
                        File
                    </button>
                    {activeMenu === 'file' && (
                        <div style={dropdownStyle}>
                            <button style={menuButtonStyle} onClick={() => { handleSave(true); setActiveMenu(null); }}>💾 Save Project</button>
                            <button style={menuButtonStyle} onClick={() => { fileInputRef.current?.click(); setActiveMenu(null); }}>📂 Load Project</button>
                            <input type="file" accept=".cosmosproj" ref={fileInputRef} onChange={(e) => { handleFileUpload(e); setActiveMenu(null); }} style={{ display: 'none' }} />
                        </div>
                    )}
                </div>

                {/* ADD NODE */}
                <button style={menuButtonStyle} onClick={onOpenNodeMenu}>
                    Add Node
                </button>

                {/* PRESETS OVERLAY BUTTON */}
                <button style={menuButtonStyle} onClick={onOpenPresetMenu}>
                    Presets
                </button>

                {/* SETTINGS MENU */}
                <div style={{ position: 'relative' }}>
                    <button style={{ ...menuButtonStyle, background: activeMenu === 'settings' ? '#333' : 'transparent' }} onClick={() => toggleMenu('settings')}>
                        Context Settings
                    </button>
                    {activeMenu === 'settings' && (
                        <div style={{ ...dropdownStyle, width: '220px', padding: '12px' }}>
                            <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', marginBottom: '8px' }}>{activeContext.name.toUpperCase()} SETTINGS</div>
                            <activeContext.SettingsPanel settings={contextSettings} onSettingChange={onSettingChange} />
                        </div>
                    )}
                </div>
            </div>

            {/* Center: Compact Project Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>ID:</span>
                    <input type="text" value={globalSettings.namespace} onChange={(e) => onGlobalSettingChange('namespace', e.target.value)} placeholder="mod_id" style={{ ...compactInputStyle, color: '#4dabf7', width: '80px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>PROJ:</span>
                    <input type="text" value={globalSettings.projectName} onChange={(e) => onGlobalSettingChange('projectName', e.target.value)} placeholder="project_name" style={{ ...compactInputStyle, fontWeight: 'bold', width: '120px' }} />
                </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select 
                    value={activeContext.id} 
                    onChange={(e) => { onFlowChange(nodes, edges, graph, history.past, history.future); onContextChange(e.target.value); }} 
                    style={{ background: '#222', color: '#ccc', border: '1px solid #333', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                >
                    {availableContexts.map(ctx => <option key={ctx.id} value={ctx.id}>{ctx.name}</option>)}
                </select>
                <button onClick={handleGameExport} style={{ ...menuButtonStyle, background: '#194225', color: '#40c057', border: '1px solid #2b8a3e', fontWeight: 'bold' }}>
                    🚀 Export to Minecraft
                </button>
            </div>
        </div>
    );
}