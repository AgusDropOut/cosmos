import { useState, useCallback } from 'react';

export interface IDEConfig {
    shortcuts: {
        delete: string;
        boxSelect: string;
        multiSelect: string;
    };
    previews: {
        enabled: boolean;          
        resolution: number;        
        fps: number;              
        showAxes: boolean;        
    };
    editor: {
        snapToGrid: boolean;
        autoSave: boolean;
    };

}

const DEFAULT_CONFIG: IDEConfig = {
    shortcuts: {
        delete: 'Backspace',
        boxSelect: 'Shift',
        multiSelect: 'Control'
    },
    previews: {
        enabled: true,
        resolution: 128,
        fps: 15,
        showAxes: false
    },
    editor: {
        snapToGrid: true,
        autoSave: true
    }
};

const STORAGE_KEY = 'cosmos-ide-config';

export function useIDEConfig() {
    const [config, setConfig] = useState<IDEConfig>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Deep merge ensures older saves don't overwrite new future config keys with undefined
                return {
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    shortcuts: { ...DEFAULT_CONFIG.shortcuts, ...(parsed.shortcuts || {}) }
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

    return { config, updateConfig };
}