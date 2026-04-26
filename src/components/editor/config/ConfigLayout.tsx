//ConfigLayout.tsx

import type { IDEConfig } from "../../../core/hooks/useIDEConfig";
import { ShortcutCaptureRow } from "./ShortcutCaptureRow";

interface ConfigLayoutProps {
    activeTab: 'shortcuts' | 'appearance' | 'editor';
    config: IDEConfig;
    updateConfig: <K extends keyof IDEConfig>(section: K, updates: Partial<IDEConfig[K]>) => void;
}

export function ConfigLayout({activeTab, config, updateConfig}: ConfigLayoutProps) {

return (
<div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#1a1a1a' }}>
                        
                        {activeTab === 'shortcuts' && (
                            <div>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Keyboard Shortcuts</h3>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '24px' }}>
                                    Click a button and press any key to rebind it. Press <strong>Escape</strong> to cancel.
                                </div>

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <ShortcutCaptureRow 
                                        label="Delete Node/Edge" 
                                        value={config.shortcuts.delete}
                                        onChange={(val) => updateConfig('shortcuts', { delete: val })}
                                    />
                                    <ShortcutCaptureRow 
                                        label="Box Selection" 
                                        value={config.shortcuts.boxSelect}
                                        onChange={(val) => updateConfig('shortcuts', { boxSelect: val })}
                                    />
                                    <ShortcutCaptureRow 
                                        label="Multi-Select" 
                                        value={config.shortcuts.multiSelect}
                                        onChange={(val) => updateConfig('shortcuts', { multiSelect: val })}
                                    />
                                </ul>
                            </div>
                        )}
                    </div>

)}