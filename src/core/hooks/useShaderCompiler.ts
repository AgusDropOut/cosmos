// src/core/hooks/useShaderCompiler.ts
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

/**
 * Listens to changes in the logical structure of the graph (nodes and edges) and triggers the compilation process.
 * * Computes a "logical hash" of the graph that only considers the relevant properties for compilation 
 * (ignoring UI states like x/y coordinate positions) to act as a dependency for the compilation effect.
 * This prevents unnecessary recompilations when irrelevant visual properties change.
 * @param props - Hook configuration properties.
 * @param props.nodes - The current array of React Flow nodes on the canvas.
 * @param props.edges - The current array of React Flow edges connecting the nodes.
 * @param props.past - The history stack of previous graph states for undo functionality.
 * @param props.future - The history stack of reverted graph states for redo functionality.
 * @param props.onFlowChange - Callback executed when a logical change is detected, receiving the newly compiled AST.
 */
export function useShaderCompiler({ nodes, edges, past, future, onFlowChange }: UseShaderCompilerProps) {
    
    // THE LOGICAL HASH
    const compilerHash = useMemo(() => {
        const logicalNodes = nodes.map(n => ({
            id: n.id,
            type: n.data.astType,
            inputs: n.data.inputs,
            outputs: n.data.outputs,
            isUniform: n.data.isUniform,     
            uniformName: n.data.uniformName   
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
            outputs: n.data.outputs || [],
            isUniform: n.data.isUniform,
            uniformName: n.data.uniformName
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