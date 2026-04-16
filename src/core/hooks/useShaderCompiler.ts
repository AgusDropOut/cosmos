import { useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import type { ShaderNode, NodeType, ShaderConnection } from '../../types/ast';

interface UseShaderCompilerProps {
    nodes: Node[];
    edges: Edge[];
    past: any[];   
    future: any[]; 
    onFlowChange: (nodes: Node[], edges: Edge[], graph: any, past: any[], future: any[]) => void;
}

export function useShaderCompiler({ nodes, edges, past, future, onFlowChange }: UseShaderCompilerProps, ) {
    useEffect(() => {
        if (nodes.length === 0) return;

            const astNodes: ShaderNode[] = nodes.map(n => ({
              id: n.id,
              type: n.data.astType as NodeType,
              inputs: n.data.inputs || [],
              outputs: n.data.outputs || []
            }));
        
            const astConnections: ShaderConnection[] = edges.map(e => ({
              id: e.id,
              sourceNodeId: e.source,
              sourcePortId: e.sourceHandle || 'out',
              targetNodeId: e.target,
              targetPortId: e.targetHandle || 'in'
            }));

            onFlowChange(nodes, edges, { nodes: astNodes, connections: astConnections }, past, future);
        
   }, [nodes, edges, past, future, onFlowChange]);
}