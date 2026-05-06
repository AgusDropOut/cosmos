// src/core/graphValidation.ts
import type { ShaderGraph } from '../types/ast';

export function validateGraph(graph: ShaderGraph): { hasCycles: boolean } {
    const adjacencyList: Record<string, string[]> = {};

    for (const node of graph.nodes) {
        adjacencyList[node.id] = [];
    }

    for (const connection of graph.connections) {
        if (adjacencyList[connection.sourceNodeId]) {
            adjacencyList[connection.sourceNodeId].push(connection.targetNodeId);
        }
    }

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
        if (recursionStack.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visited.add(nodeId);
        recursionStack.add(nodeId);

        const neighbors = adjacencyList[nodeId] || [];
        for (const neighborId of neighbors) {
            if (hasCycleDFS(neighborId)) return true;
        }

        recursionStack.delete(nodeId);
        return false;
    };

    for (const node of graph.nodes) {
        if (hasCycleDFS(node.id)) {
            return { hasCycles: true };
        }
    }

    return { hasCycles: false };
}