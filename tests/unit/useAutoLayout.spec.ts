// @vitest-environment jsdom
// tests/unit/useAutoLayout.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoLayout } from '../../src/core/hooks/useAutoLayout';
import type { Node, Edge } from 'reactflow';

/* Isolate the mathematical dependency. 
 * We mock Dagre using an actual ES6 class so the `new` keyword works perfectly.
 */
const mockSetGraph = vi.fn();

vi.mock('dagre', () => {
    class MockGraph {
        setDefaultEdgeLabel = vi.fn();
        setGraph = mockSetGraph;
        setNode = vi.fn();
        setEdge = vi.fn();
        node = vi.fn(() => ({ x: 500, y: 500 })); // Force predictable output
    }

    return {
        default: {
            graphlib: { Graph: MockGraph },
            layout: vi.fn()
        },
        // Flat exports catch edge cases where the test runner drops the 'default' wrapper
        graphlib: { Graph: MockGraph },
        layout: vi.fn()
    };
});

describe('useAutoLayout Hook', () => {
    
    const mockSetNodes = vi.fn();
    const mockTakeSnapshot = vi.fn();

    const mockNodes: Node[] = [
        { id: 'n1', position: { x: 0, y: 0 }, data: {} },
        { id: 'n2', position: { x: -100, y: -200 }, data: {} }
    ];

    const mockEdges: Edge[] = [
        { id: 'e1', source: 'n1', target: 'n2' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('triggers a history snapshot prior to modifying node coordinates', () => {
        const { result } = renderHook(() => useAutoLayout({
            nodes: mockNodes,
            edges: mockEdges,
            setNodes: mockSetNodes,
            takeSnapshot: mockTakeSnapshot
        }));

        act(() => {
            result.current.autoLayout();
        });

        /* The history snapshot MUST fire before the nodes are updated */
        expect(mockTakeSnapshot).toHaveBeenCalledTimes(1);
        expect(mockSetNodes).toHaveBeenCalledTimes(1);
        
        /* Validates execution order: Snapshot -> Update */
        const snapshotOrder = mockTakeSnapshot.mock.invocationCallOrder[0];
        const updateOrder = mockSetNodes.mock.invocationCallOrder[0];
        expect(snapshotOrder).toBeLessThan(updateOrder);
    });

    it('translates Dagre center coordinates to React Flow top-left coordinates', () => {
        const { result } = renderHook(() => useAutoLayout({
            nodes: mockNodes,
            edges: mockEdges,
            setNodes: mockSetNodes,
            takeSnapshot: mockTakeSnapshot
        }));

        act(() => {
            result.current.autoLayout();
        });

        const appliedNodes = mockSetNodes.mock.calls[0][0];
        
        /* Expected offset mathematics:
         * Dagre Center: x: 500, y: 500
         * Width (220) / 2 = 110. 500 - 110 = 390
         * Height (150) / 2 = 75. 500 - 75 = 425
         */
        expect(appliedNodes[0].position.x).toBe(390);
        expect(appliedNodes[0].position.y).toBe(425);
        expect(appliedNodes[1].position.x).toBe(390);
        expect(appliedNodes[1].position.y).toBe(425);
    });

    it('respects layout direction overrides', () => {
        const { result } = renderHook(() => useAutoLayout({
            nodes: mockNodes,
            edges: mockEdges,
            setNodes: mockSetNodes,
            takeSnapshot: mockTakeSnapshot
        }));

        act(() => {
            result.current.autoLayout('TB'); // Top-to-Bottom
        });

        expect(mockSetGraph).toHaveBeenCalledWith(
            expect.objectContaining({ rankdir: 'TB' })
        );
    });
});