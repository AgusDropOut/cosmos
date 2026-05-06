// src/core/hooks/usePresets.ts
import { useMemo, useCallback } from 'react';
import type { Node, Edge } from 'reactflow';
import { BUILT_IN_PRESETS } from '../presets/PresetRegistry';
import type { IPreset } from '../../types/preset';

/**
 * Manages the retrieval and application of predefined graph templates (presets) 
 * adapted to the currently active rendering context.
 *
 * @param activeContextId - The unique identifier of the current execution context (e.g., 'MATERIAL', 'BEAM').
 * @returns An object containing the filtered list of applicable presets and the application handler.
 */
export function usePresets(activeContextId: string) {
    
    /**
     * Dynamically filters the global preset registry to only expose templates 
     * mathematically valid for the current active context.
     */
    const availablePresets = useMemo(() => {
        return BUILT_IN_PRESETS.filter(preset => preset.contextId === activeContextId);
    }, [activeContextId]);

    /**
     * Injects a selected preset into the active workspace state.
     * Captures a history snapshot immediately prior to injection to ensure the user 
     * can undo the preset application.
     * @param presetId - The unique identifier of the target preset to load.
     * @param setNodes - State setter for the React Flow nodes array.
     * @param setEdges - State setter for the React Flow edges array.
     * @param onSettingChange - Callback to overwrite specific context settings.
     * @param takeSnapshot - Callback to commit the current graph state to the undo/history stack.
     */
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

        /* Capture the state BEFORE overwriting it so the user can easily undo */
        takeSnapshot();

        /* Populate the visual and logical graph */
        setNodes(presetToLoad.nodes);
        setEdges(presetToLoad.edges);

        /* Apply any specific numerical configurations bundled with the preset */
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