// src/core/utils/hash.ts
import type { Node, Edge } from 'reactflow';

export function computeLogicalHash(nodes: Node[], edges: Edge[]): string {
    const logicalNodes = nodes.map(n => ({
        id: n.id,
        type: n.data?.astType,
        inputs: n.data?.inputs,
        outputs: n.data?.outputs,
        isUniform: n.data?.isUniform,
        uniformName: n.data?.uniformName
    }));
    
    const logicalEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
    }));

    return JSON.stringify({ nodes: logicalNodes, edges: logicalEdges });
}