import type { Node, Edge } from 'reactflow';
import type { ShaderGraph } from './ast';

export interface SavedWorkspace {
    version: string;                                        
    globalSettings: { namespace: string; projectName: string }; 
    activeContextId: string;                                 
    workspaces: Record<string, {                              
        graph: ShaderGraph; 
        settings: Record<string, any>;
    }>;
}


export interface EditorWorkspaceState extends SavedWorkspace {
    nodes: Node[];        
    edges: Edge[];        
    historyPast: any[];   
    historyFuture: any[]; 
}