import type { IDEConfig } from "../../../core/hooks/useIDEConfig";
import { ShortcutCaptureRow } from "./ShortcutCaptureRow";

interface ConfigLayoutProps {
    activeTab: 'shortcuts' | 'appearance' | 'editor' | 'previews';
    config: IDEConfig;
    updateConfig: <K extends keyof IDEConfig>(section: K, updates: Partial<IDEConfig[K]>) => void;
}

type TabProps = Omit<ConfigLayoutProps, 'activeTab'>;

function ShortcutsTab({ config, updateConfig }: TabProps) {
    return (
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
    );
}

function PreviewsTab({ config, updateConfig }: TabProps) {
    return (
        <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Port Previews</h3>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '24px' }}>
                Configure performance settings for real-time node previews.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={config.previews.enabled}
                        onChange={(e) => updateConfig('previews', { enabled: e.target.checked })}
                    />
                    Enable Real-Time Previews
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#ccc', fontSize: '13px' }}>Resolution (px)</label>
                    <select
                        value={config.previews.resolution}
                        onChange={(e) => updateConfig('previews', { resolution: parseInt(e.target.value) })}
                        style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '4px', width: '120px', outline: 'none' }}
                    >
                        <option value={32}>32 x 32</option>
                        <option value={64}>64 x 64</option>
                        <option value={128}>128 x 128</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#ccc', fontSize: '13px' }}>Target FPS ({config.previews.fps})</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#666', fontSize: '11px' }}>5</span>
                        <input
                            type="range"
                            min="5" max="60" step="5"
                            value={config.previews.fps}
                            onChange={(e) => updateConfig('previews', { fps: parseInt(e.target.value) })}
                            style={{ flex: 1, cursor: 'pointer' }}
                        />
                        <span style={{ color: '#666', fontSize: '11px' }}>60</span>
                    </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={config.previews.showAxes}
                        onChange={(e) => updateConfig('previews', { showAxes: e.target.checked })}
                    />
                    Show UV/Coordinate Axes
                </label>

            </div>
        </div>
    );
}

function EditorTab({ config, updateConfig }: TabProps) {
    return (
        <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Editor Behavior</h3>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '24px' }}>
                General workflow and canvas settings.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={config.editor.snapToGrid}
                        onChange={(e) => updateConfig('editor', { snapToGrid: e.target.checked })}
                    />
                    Snap to Grid
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={config.editor.autoSave}
                        onChange={(e) => updateConfig('editor', { autoSave: e.target.checked })}
                    />
                    Auto-Save Workspace
                </label>
            </div>
        </div>
    );
}

const TAB_COMPONENTS: Record<string, React.FC<TabProps>> = {
    shortcuts: ShortcutsTab,
    previews: PreviewsTab,
    editor: EditorTab,
};

export function ConfigLayout({ activeTab, config, updateConfig }: ConfigLayoutProps) {
    const ActiveContent = TAB_COMPONENTS[activeTab];

    return (
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#1a1a1a' }}>
            {ActiveContent ? (
                <ActiveContent config={config} updateConfig={updateConfig} />
            ) : (
                <div style={{ color: '#666', fontSize: '12px' }}>Configuration panel under construction.</div>
            )}
        </div>
    );
}