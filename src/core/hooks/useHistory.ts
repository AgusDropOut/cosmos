// src/core/hooks/useHistory.ts
import { useState, useCallback, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';

/**
 * Represents a single point in time for the visual graph.
 */
interface HistoryState {
    nodes: Node[];
    edges: Edge[];
}

/**
 * Manages the Undo and Redo stacks for the node editor, including history tracking, 
 * state restoration, context-switching population, and global keyboard shortcuts.
 * @param initialPast - The pre-existing history stack to load (used during context switching).
 * @param initialFuture - The pre-existing redo stack to load.
 * @param setNodes - State setter to visually restore the nodes on the canvas.
 * @param setEdges - State setter to visually restore the connections on the canvas.
 * @param currentNodes - The live, current state of the nodes array.
 * @param currentEdges - The live, current state of the edges array.
 * @returns An object containing the history stacks and the interaction controllers.
 */
export function useHistory(
    initialPast: HistoryState[] = [],   
    initialFuture: HistoryState[] = [], 
    setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void,
    setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void,
    currentNodes: Node[],
    currentEdges: Edge[],
) {
    const [past, setPast] = useState<HistoryState[]>(initialPast || []);
    const [future, setFuture] = useState<HistoryState[]>(initialFuture || []);

    /**
     * Silently replaces the internal history stacks. Used primarily when swapping 
     * between different contexts (e.g., Material to Trail) to load the correct history.
     */
    const setHistory = useCallback((newPast: HistoryState[], newFuture: HistoryState[]) => {
        setPast(newPast || []);
        setFuture(newFuture || []);
    }, []);
    
    /**
     * Captures the current graph state and pushes it to the past stack.
     * Automatically clears the future (redo) stack, as a new divergent timeline has begun.
     */
    const takeSnapshot = useCallback(() => {
        setPast((p = []) => [...p, { nodes: currentNodes, edges: currentEdges }]);
        setFuture([]);
    }, [currentNodes, currentEdges]);

    /**
     * Pops the most recent state from the past stack, pushes the current state to the future stack, 
     * and forces the React Flow canvas to render the past state.
     */
    const undo = useCallback(() => {
        if (past.length === 0) return;
        
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        
        setPast(newPast);
        setFuture((f) => [{ nodes: currentNodes, edges: currentEdges }, ...f]);
        
        setNodes(previous.nodes);
        setEdges(previous.edges);
    }, [past, currentNodes, currentEdges, setNodes, setEdges]);

    /**
     * Pops the next available state from the future stack, pushes the current state to the past stack,
     * and forces the React Flow canvas to render the future state.
     */
    const redo = useCallback(() => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast((p) => [...p, { nodes: currentNodes, edges: currentEdges }]);
        setFuture(newFuture);

        setNodes(next.nodes);
        setEdges(next.edges);
    }, [future, currentNodes, currentEdges, setNodes, setEdges]);

    // Keyboard Listeners for Ctrl+Z and Ctrl+Y
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            
            // Prevent intercepting standard text editing inside input fields or textareas
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                if (event.key.toLowerCase() === 'z') {
                    event.preventDefault();
                    if (event.shiftKey) redo();
                    else undo();
                } else if (event.key.toLowerCase() === 'y') {
                    event.preventDefault();
                    redo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return { past, future, takeSnapshot, undo, redo, setHistory };
}