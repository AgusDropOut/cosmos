// src/core/hooks/useHistory.ts
import { useState, useCallback, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';

interface HistoryState {
    nodes: Node[];
    edges: Edge[];
}



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

    // Sync local state when context switches (initialPast changes)
    const setHistory = useCallback((newPast: HistoryState[], newFuture: HistoryState[]) => {
        setPast(newPast || []);
        setFuture(newFuture || []);
    }, []);
    
   
    const takeSnapshot = useCallback(() => {
        setPast((p = []) => [...p, { nodes: currentNodes, edges: currentEdges }]);
        setFuture([]);
    }, [currentNodes, currentEdges]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        
        setPast(newPast);
       
        setFuture((f) => [{ nodes: currentNodes, edges: currentEdges }, ...f]);
        
        // Apply the previous state
        setNodes(previous.nodes);
        setEdges(previous.edges);
    }, [past, currentNodes, currentEdges, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        // Save where we are right now into the past stack
        setPast((p) => [...p, { nodes: currentNodes, edges: currentEdges }]);
        setFuture(newFuture);

        // Apply the next state
        setNodes(next.nodes);
        setEdges(next.edges);
    }, [future, currentNodes, currentEdges, setNodes, setEdges]);

    // Keyboard Listeners for Ctrl+Z and Ctrl+Y
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return;
            }

            

            if (event.ctrlKey || event.metaKey) {
                if (event.key.toLowerCase() === 'z') {
                    event.preventDefault();
                    if (event.shiftKey) redo();
                    else undo();
                } else if (event.key.toLowerCase() === 'y') {
                    console.log('Redo triggered');
                    event.preventDefault();
                    redo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return { past, future, takeSnapshot, undo, redo , setHistory};
}