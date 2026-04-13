// src/types/context.ts
import type { Node } from 'reactflow';
import React from 'react';

export interface IProjectContext {
    id: string;
    name: string;
    
    // Returns the mandatory endpoints (e.g., OUTPUT_FRAG + OUTPUT_VERT)
    getInitialNodes: () => Node[];
    
    // Determines if a node type should appear in the left toolbar
    isNodeAllowed: (nodeType: string) => boolean;
    
    // Dynamically injects context-specific UI into the top-right panel
    SettingsPanel: React.FC<{
        settings: Record<string, any>;
        onSettingChange: (key: string, value: any) => void;
    }>;
}