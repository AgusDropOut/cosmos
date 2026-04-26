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

export function useAutoLayout({ nodes, edges, setNodes, takeSnapshot }: UseAutoLayoutProps) {
    
    const autoLayout = useCallback((direction = 'LR') => {
       
        takeSnapshot();

        
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        
        dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 60 });

      
        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
        });
        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        
        dagre.layout(dagreGraph);

        
        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - NODE_WIDTH / 2,
                    y: nodeWithPosition.y - NODE_HEIGHT / 2,
                },
            };
        });

        setNodes(layoutedNodes);
        
    }, [nodes, edges, setNodes, takeSnapshot]);

    return { autoLayout };
}