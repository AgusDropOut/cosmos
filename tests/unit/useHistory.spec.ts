// @vitest-environment jsdom
// tests/unit/useHistory.spec.ts

/**
 * Validates the history management and time-travel mechanics of the Cosmos engine.
 * - Environment: JSDOM is required to simulate global window/document keyboard events.
 * - Mocking: React Flow state setters are mocked to verify correct canvas hydration.
 * - Factories: Utilizes a custom render helper to manage the hook's positional arguments.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../../src/core/hooks/useHistory';
import type { Node, Edge } from 'reactflow';

describe('useHistory Hook', () => {
    
    const mockSetNodes = vi.fn();
    const mockSetEdges = vi.fn();

    const nodeA: Node[] = [{ id: 'n1', position: { x: 0, y: 0 }, data: {} }];
    const nodeB: Node[] = [{ id: 'n2', position: { x: 0, y: 0 }, data: {} }];
    const edges: Edge[] = [];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createProps = (
        currentNodes = nodeA, 
        currentEdges = edges, 
        past: any[] = [], 
        future: any[] = []
    ) => ({
        initialPast: past,
        initialFuture: future,
        setNodes: mockSetNodes,
        setEdges: mockSetEdges,
        currentNodes,
        currentEdges
    });

    const renderHistoryHook = (props = createProps()) => {
        return renderHook(() => useHistory(
            props.initialPast,
            props.initialFuture,
            props.setNodes,
            props.setEdges,
            props.currentNodes,
            props.currentEdges
        ));
    };

    describe('Stack Management', () => {
        it('initializes with empty stacks by default', () => {
            const { result } = renderHistoryHook();
            
            expect(result.current.past).toHaveLength(0);
            expect(result.current.future).toHaveLength(0);
        });

        it('pushes the current state to the past and clears the future on takeSnapshot', () => {
            const props = createProps(nodeA, edges, [], [ { nodes: nodeB, edges: [] } ]);
            const { result } = renderHistoryHook(props);
            
            act(() => {
                result.current.takeSnapshot();
            });

            expect(result.current.past).toHaveLength(1);
            expect(result.current.past[0].nodes).toBe(nodeA);
            expect(result.current.future).toHaveLength(0);
        });

        it('replaces stacks completely when setHistory is called (context switching)', () => {
            const { result } = renderHistoryHook();
            
            const newPast = [{ nodes: nodeB, edges }];
            
            act(() => {
                result.current.setHistory(newPast, []);
            });

            expect(result.current.past).toBe(newPast);
        });
    });

    describe('Undo & Redo Logic', () => {
        it('safely ignores undo calls if the past stack is empty', () => {
            const { result } = renderHistoryHook();
            
            act(() => {
                result.current.undo();
            });

            expect(mockSetNodes).not.toHaveBeenCalled();
        });

        it('restores previous state, pushes current state to future stack on undo', () => {
            const props = createProps(nodeB, edges, [{ nodes: nodeA, edges }], []);
            const { result } = renderHistoryHook(props);
            
            act(() => {
                result.current.undo();
            });

            expect(mockSetNodes).toHaveBeenCalledWith(nodeA);
            expect(result.current.past).toHaveLength(0);
            expect(result.current.future).toHaveLength(1);
            expect(result.current.future[0].nodes).toBe(nodeB);
        });

        it('restores next state, pushes current state to past stack on redo', () => {
            const props = createProps(nodeA, edges, [], [{ nodes: nodeB, edges }]);
            const { result } = renderHistoryHook(props);
            
            act(() => {
                result.current.redo();
            });

            expect(mockSetNodes).toHaveBeenCalledWith(nodeB);
            expect(result.current.future).toHaveLength(0);
            expect(result.current.past).toHaveLength(1);
            expect(result.current.past[0].nodes).toBe(nodeA);
        });
    });

    describe('Global Keyboard Shortcuts', () => {
        it('triggers undo on Ctrl+Z', () => {
            const props = createProps(nodeB, edges, [{ nodes: nodeA, edges }], []);
            renderHistoryHook(props);
            
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
            });

            expect(mockSetNodes).toHaveBeenCalledWith(nodeA);
        });

        it('triggers redo on Ctrl+Y', () => {
            const props = createProps(nodeA, edges, [], [{ nodes: nodeB, edges }]);
            renderHistoryHook(props);
            
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true }));
            });

            expect(mockSetNodes).toHaveBeenCalledWith(nodeB);
        });

        it('triggers redo on Ctrl+Shift+Z', () => {
            const props = createProps(nodeA, edges, [], [{ nodes: nodeB, edges }]);
            renderHistoryHook(props);
            
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true }));
            });

            expect(mockSetNodes).toHaveBeenCalledWith(nodeB);
        });

        it('ignores keyboard shortcuts if a text input is focused', () => {
            const props = createProps(nodeB, edges, [{ nodes: nodeA, edges }], []);
            renderHistoryHook(props);
            
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();

            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
            });

            expect(mockSetNodes).not.toHaveBeenCalled();

            document.body.removeChild(input);
        });
    });
});