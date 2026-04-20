// src/types/preset.ts
import type { Node, Edge } from 'reactflow';

export interface IPreset {
    id: string;
    name: string;
    description: string;
    contextId: string; // e.g., 'MATERIAL' or 'TRAIL'
    nodes: Node[];
    edges: Edge[];
    settings: Record<string, any>;
}