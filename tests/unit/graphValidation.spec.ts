// tests/unit/graphValidation.spec.ts
import { describe, it, expect } from 'vitest';
import type { ShaderGraph } from '../../src/types/ast';
import { validateGraph } from '../../src/core/graphValidation';

describe('Cosmos Engine: Graph Integrity', () => {

    it('detects cyclical connections between nodes', () => {
        const cyclicalGraph: ShaderGraph = {
            nodes: [
                { id: 'node_A', type: 'MATH_BINARY', inputs: [{ id: 'in', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] },
                { id: 'node_B', type: 'MATH_UNARY', inputs: [{ id: 'in', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
            ],
            connections: [
                { id: 'c1', sourceNodeId: 'node_A', sourcePortId: 'out', targetNodeId: 'node_B', targetPortId: 'in' },
                /* Establishes the invalid return loop. */
                { id: 'c2', sourceNodeId: 'node_B', sourcePortId: 'out', targetNodeId: 'node_A', targetPortId: 'in' }
            ]
        };

        const result = validateGraph(cyclicalGraph);
        expect(result.hasCycles).toBe(true);
    });

    it('validates acyclic graphs correctly', () => {
        const acyclicGraph: ShaderGraph = {
            nodes: [
                { id: 'node_A', type: 'FLOAT', inputs: [], outputs: [{ id: 'out', type: 'float' }] },
                { id: 'node_B', type: 'MATH_UNARY', inputs: [{ id: 'in', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
            ],
            connections: [
                { id: 'c1', sourceNodeId: 'node_A', sourcePortId: 'out', targetNodeId: 'node_B', targetPortId: 'in' }
            ]
        };

        const result = validateGraph(acyclicGraph);
        expect(result.hasCycles).toBe(false);
    });
});