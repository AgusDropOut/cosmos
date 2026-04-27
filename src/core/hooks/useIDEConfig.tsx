// src/core/hooks/useIDEConfig.tsx (Note: Change extension to .tsx since we are returning JSX)
import { useState, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export interface IDEConfig {
    shortcuts: { delete: string; boxSelect: string; multiSelect: string; };
    previews: {
        enabled: boolean;          
        resolution: number;        
        fps: number;              
        showAxes: boolean;
        showFps: boolean;  
        fpsColor: string;      
    };
    editor: { snapToGrid: boolean; autoSave: boolean; };
}

const DEFAULT_CONFIG: IDEConfig = {
    shortcuts: { delete: 'Backspace', boxSelect: 'Shift', multiSelect: 'Control' },
    previews: { enabled: true, resolution: 128, fps: 15, showAxes: false, showFps: false, fpsColor: '#00ff00' },
    editor: { snapToGrid: true, autoSave: true }
};

const STORAGE_KEY = 'cosmos-ide-config';


const IDEConfigContext = createContext<{
    config: IDEConfig;
    updateConfig: <K extends keyof IDEConfig>(section: K, updates: Partial<IDEConfig[K]>) => void;
} | null>(null);


export function IDEConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<IDEConfig>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    shortcuts: { ...DEFAULT_CONFIG.shortcuts, ...(parsed.shortcuts || {}) },
                    previews: { ...DEFAULT_CONFIG.previews, ...(parsed.previews || {}) },
                    editor: { ...DEFAULT_CONFIG.editor, ...(parsed.editor || {}) }
                };
            }
        } catch (error) {
            console.warn('Cosmos: Failed to load IDE config', error);
        }
        return DEFAULT_CONFIG;
    });

    const updateConfig = useCallback(<K extends keyof IDEConfig>(section: K, updates: Partial<IDEConfig[K]>) => {
        setConfig(prev => {
            const newConfig = {
                ...prev,
                [section]: { ...prev[section], ...updates }
            };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
            } catch (error) {
                console.warn('Cosmos: Failed to save IDE config', error);
            }
            return newConfig;
        });
    }, []);

    
    return (
        <IDEConfigContext.Provider value={{ config, updateConfig }}>
            {children}
        </IDEConfigContext.Provider>
    );
}


export function useIDEConfig() {
    const context = useContext(IDEConfigContext);
    if (!context) {
        throw new Error('useIDEConfig must be used within an IDEConfigProvider');
    }
    return context;
}