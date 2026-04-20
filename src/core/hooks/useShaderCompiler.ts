import { useEffect, useMemo } from 'react';
import type { Node, Edge } from 'reactflow';
import type { ShaderNode, NodeType, ShaderConnection } from '../../types/ast';

interface UseShaderCompilerProps {
    nodes: Node[];
    edges: Edge[];
    past: any[];   
    future: any[]; 
    onFlowChange: (nodes: Node[], edges: Edge[], graph: any, past: any[], future: any[]) => void;
}

/* This hook listens to changes in the logical structure of the graph (nodes and edges) and triggers the compilation process. 
*  It computes a "logical hash" of the graph that only considers the relevant properties for compilation (no x and y positions, no UI state), 
*  and uses that as a dependency to trigger the compilation effect. 
*  If an attributte of the relevant ones changes, the hash changes and the effect runs, recompiling the shader.
*  This way, we avoid unnecessary recompilations when irrelevant properties change. */

export function useShaderCompiler({ nodes, edges, past, future, onFlowChange }: UseShaderCompilerProps) {
    
    // THE LOGICAL HASH
    const compilerHash = useMemo(() => {
        const logicalNodes = nodes.map(n => ({
            id: n.id,
            type: n.data.astType,
            inputs: n.data.inputs,
            outputs: n.data.outputs
        }));
        
        const logicalEdges = edges.map(e => ({
            id: e.id,
            source: e.source,
            sourceHandle: e.sourceHandle,
            target: e.target,
            targetHandle: e.targetHandle
        }));

        return JSON.stringify({ nodes: logicalNodes, edges: logicalEdges });
    }, [nodes, edges]);

    //  THE COMPILER
    useEffect(() => {
        if (nodes.length === 0) return;

        console.log("Cosmos: Logical AST changed, recompiling...");

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
        
    

    }, [compilerHash]); 
}