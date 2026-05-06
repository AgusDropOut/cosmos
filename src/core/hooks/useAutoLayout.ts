// src/core/hooks/useAutoLayout.ts
import { useCallback } from 'react';
import type { Node, Edge } from 'reactflow';
import dagre from 'dagre';

interface UseAutoLayoutProps {
    nodes: Node[];
    edges: Edge[];
    setNodes: (nodes: Node[]) => void;
    takeSnapshot: () => void;
}

const NODE_WIDTH = 220; 
const NODE_HEIGHT = 150;

/**
 * Automatically organizes the visual graph using the Dagre directed acyclic graph layout algorithm.
 * Translates Dagre's center-based coordinates into React Flow's top-left based coordinates.
 *
 * @param props.nodes - The current array of nodes to be measured.
 * @param props.edges - The current array of edges to determine layout hierarchy.
 * @param props.setNodes - State setter to apply the newly calculated coordinates.
 * @param props.takeSnapshot - History callback invoked before mutation to allow user undo.
 */
export function useAutoLayout({ nodes, edges, setNodes, takeSnapshot }: UseAutoLayoutProps) {
    
    /**
     * Executes the layout algorithm.
     * @param direction - The flow direction of the graph. 'LR' (Left-to-Right) or 'TB' (Top-to-Bottom).
     */
    const autoLayout = useCallback((direction = 'LR') => {
        
        /* Captures state for the undo stack before overwriting coordinates */
        takeSnapshot();

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        
        dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 60 });

        /* Feeds the nodes and expected dimensions into the engine */
        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
        });
        
        /* Feeds the hierarchy/connections */
        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        /* Executes the mathematical layout calculation */
        dagre.layout(dagreGraph);

        /* Translates the coordinates back to the React Flow format */
        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                position: {
                    /* Dagre returns the exact center. React Flow requires the top-left corner. */
                    x: nodeWithPosition.x - NODE_WIDTH / 2,
                    y: nodeWithPosition.y - NODE_HEIGHT / 2,
                },
            };
        });

        setNodes(layoutedNodes);
        
    }, [nodes, edges, setNodes, takeSnapshot]);

    return { autoLayout };
}