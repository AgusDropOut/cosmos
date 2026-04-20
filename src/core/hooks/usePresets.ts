// src/core/hooks/usePresets.ts
import { useMemo, useCallback } from 'react';
import type { Node, Edge } from 'reactflow';
import { BUILT_IN_PRESETS } from '../presets/PresetRegistry';
import type { IPreset } from '../../types/preset';

/* This hook is responsible for managing the available presets based on the active context, 
*  and applying a selected preset to the editor. 
*  Note that it takes an snapshot before applying a preset, 
*  so that the user can undo back to their previous state if they want. */

export function usePresets(activeContextId: string) {
    
    
    const availablePresets = useMemo(() => {
        return BUILT_IN_PRESETS.filter(preset => preset.contextId === activeContextId);
    }, [activeContextId]);

    
    const applyPreset = useCallback((
        presetId: string, 
        setNodes: (nodes: Node[]) => void, 
        setEdges: (edges: Edge[]) => void, 
        onSettingChange: (key: string, value: any) => void,
        takeSnapshot: () => void 
    ) => {
        console.log(`Cosmos: Applying preset ${presetId}...`);
        const presetToLoad = availablePresets.find(p => p.id === presetId);
        if (!presetToLoad) {
            console.warn(`Cosmos: Preset ${presetId} not found.`);
            return;
        }

        
        takeSnapshot();

     
        setNodes(presetToLoad.nodes);
        setEdges(presetToLoad.edges);

        
        if (presetToLoad.settings) {
            Object.entries(presetToLoad.settings).forEach(([key, value]) => {
                onSettingChange(key, value);
            });
        }
        
        console.log(`Cosmos: Applied preset "${presetToLoad.name}"`);
    }, [availablePresets]);

    return {
        availablePresets,
        applyPreset
    };
}