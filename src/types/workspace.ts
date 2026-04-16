import type { Node, Edge } from 'reactflow';

export interface SavedWorkspace {
    version: string;     // future-proofing 
    name: string;        // E.g., "Magical Fire"
    contextId: string;   // E.g., "MATERIAL"
    settings: Record<string, any>; // E.g., { shape: 'STAR_LAMP' }
    globalSettings?: { namespace: string; projectName: string }; // Optional global settings
    nodes: Node[];       // The exact React Flow visual layout & values
    edges: Edge[];       // The exact React Flow wire connections
}

//  THE RAM STATE 
export interface EditorWorkspaceState extends SavedWorkspace {
    historyPast: any[];  
    historyFuture: any[]; 
}