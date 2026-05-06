// @vitest-environment jsdom
// tests/unit/useShaderCompiler.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShaderCompiler } from '../../src/core/hooks/useShaderCompiler';
import type { Node, Edge } from 'reactflow';

describe('useShaderCompiler Hook', () => {

    const mockOnFlowChange = vi.fn();


    beforeEach(() => {
        mockOnFlowChange.mockClear();
    });

    const createDefaultProps = (nodes: Node[] = [], edges: Edge[] = []) => ({
        nodes,
        edges,
        past: [],
        future: [],
        onFlowChange: mockOnFlowChange
    });

    it('bypasses compilation if the node array is empty', () => {
        renderHook(() => useShaderCompiler(createDefaultProps([], [])));
        
        expect(mockOnFlowChange).not.toHaveBeenCalled();
    });

    it('compiles the initial AST when nodes are present', () => {
        const initialNodes: Node[] = [{ 
            id: 'n1', 
            position: { x: 100, y: 100 }, 
            data: { astType: 'FLOAT', inputs: [], outputs: [] } 
        }];
        
        renderHook(() => useShaderCompiler(createDefaultProps(initialNodes, [])));

        expect(mockOnFlowChange).toHaveBeenCalledTimes(1);
        
        const passedGraph = mockOnFlowChange.mock.calls[0][2];
        expect(passedGraph.nodes[0].type).toBe('FLOAT');
        expect(passedGraph.nodes[0].id).toBe('n1');
    });

    it('ignores pure UI changes and blocks recompilation', () => {
        const initialNodes: Node[] = [{ 
            id: 'n1', 
            position: { x: 100, y: 100 }, 
            data: { astType: 'FLOAT', inputs: [], outputs: [] } 
        }];
        
        const { rerender } = renderHook(
            (props) => useShaderCompiler(props), 
            { initialProps: createDefaultProps(initialNodes, []) }
        );

        /* Simulates a node drag event changing only the coordinate position */
        const movedNodes: Node[] = [{
            ...initialNodes[0],
            position: { x: 500, y: 500 } 
        }];

        rerender(createDefaultProps(movedNodes, []));

        /* The hash should remain identical; no additional compilation should occur. */
        expect(mockOnFlowChange).toHaveBeenCalledTimes(1);
    });

    it('triggers recompilation when logical node data is modified', () => {
        const initialNodes: Node[] = [{ 
            id: 'n1', 
            position: { x: 100, y: 100 }, 
            data: { astType: 'FLOAT', inputs: [{ id: 'val', value: 1.0 }], outputs: [] } 
        }];
        
        const { rerender } = renderHook(
            (props) => useShaderCompiler(props), 
            { initialProps: createDefaultProps(initialNodes, []) }
        );

        /* Simulates a user modifying a node parameter in the UI */
        const updatedNodes: Node[] = [{
            ...initialNodes[0],
            data: { 
                ...initialNodes[0].data, 
                inputs: [{ id: 'val', value: 2.0 }] 
            } 
        }];

        rerender(createDefaultProps(updatedNodes, []));

        /* The compiler must detect the hash change and execute again. */
        expect(mockOnFlowChange).toHaveBeenCalledTimes(2);
    });
});