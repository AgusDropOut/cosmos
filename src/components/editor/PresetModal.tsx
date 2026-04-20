// src/components/editor/PresetModal.tsx
import type { IPreset } from '../../types/preset';

interface PresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    availablePresets: IPreset[];
    onSelectPreset: (presetId: string) => void;
}

const overlayStyle: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(6px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
};

const modalStyle: React.CSSProperties = {
    background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6)', width: '600px', maxHeight: '80vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
};

export function PresetModal({ isOpen, onClose, availablePresets, onSelectPreset }: PresetModalProps) {
    if (!isOpen) return null;

    return (
        <div style={overlayStyle} onMouseDown={onClose}>
            <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid #333', background: '#151515', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>
                        CONTEXT PRESETS
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>

                {/* Preset Grid */}
                <div style={{ overflowY: 'auto', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {availablePresets.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#666', fontSize: '13px', gridColumn: '1 / -1' }}>
                            No presets available for this context yet.
                        </div>
                    ) : (
                        availablePresets.map(preset => (
                            <div 
                                key={preset.id} 
                                onClick={() => { onSelectPreset(preset.id); onClose(); }} 
                                style={{ 
                                    background: '#222', border: '1px solid #333', borderRadius: '6px', 
                                    padding: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                                    display: 'flex', flexDirection: 'column'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#4dabf7'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#333'}
                            >
                                <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{preset.name}</div>
                                <div style={{ color: '#888', fontSize: '11px', lineHeight: '1.4', flex: 1 }}>{preset.description}</div>
                                
                                {/* FUTURE: WebGL Mini-Canvas Preview Placeholder */}
                                <div style={{ 
                                    height: '100px', background: '#111', borderRadius: '4px', marginTop: '12px',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    color: '#444', fontSize: '10px', border: '1px dashed #333'
                                }}>
                                    Preview Canvas (Coming Soon)
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}