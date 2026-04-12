import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge} from 'reactflow';
import type { NodeChange, EdgeChange, Node, Edge , Connection  } from 'reactflow';
import 'reactflow/dist/style.css';
import type { ShaderGraph, ShaderNode, ShaderConnection, NodeType } from './types/ast';

import { ColorNode, NoiseNode, MultiplyNode, OutputNode, TimeNode } from './CustomNodes';

const nodeTypes = {
  COLOR: ColorNode,
  NOISE: NoiseNode,
  MULTIPLY: MultiplyNode,
  OUTPUT_FRAG: OutputNode,
  TIME: TimeNode,
};

interface NodeEditorProps {
  onGraphChange: (graph: ShaderGraph) => void;
}

const initialNodes: Node[] = [
  { id: 'color-1', type: 'COLOR', position: { x: 100, y: 150 }, data: { astType: 'COLOR', inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0.0, g: 0.8, b: 0.2 } }], outputs: [{ id: 'out', type: 'vec3' }] } },
  { id: 'out-1', type: 'OUTPUT_FRAG', position: { x: 400, y: 150 }, data: { astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }], outputs: [] } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'color-1', sourceHandle: 'out', target: 'out-1', targetHandle: 'color' }
];

export default function NodeEditor({ onGraphChange }: NodeEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => {
      const newEdges = addEdge(params, eds);
      return newEdges;
    });
  }, []);

  // THE BRIDGE: This MUST transform React Flow state into our AST format
  useEffect(() => {
    // 1. Map React Flow nodes to our ShaderNodes
    const astNodes: ShaderNode[] = nodes.map(n => ({
      id: n.id,
      type: n.data.astType as NodeType,
      inputs: n.data.inputs || [],
      outputs: n.data.outputs || []
    }));

    // 2. Map React Flow edges to our ShaderConnections
    const astConnections: ShaderConnection[] = edges.map(e => ({
      id: e.id,
      sourceNodeId: e.source,
      sourcePortId: e.sourceHandle || 'out',
      targetNodeId: e.target,
      targetPortId: e.targetHandle || 'in'
    }));

    const fullGraph = { nodes: astNodes, connections: astConnections };
    
    // Debug: Check if the graph is actually populated before sending
    console.log("Bridge sending graph to App:", fullGraph);
    
    onGraphChange(fullGraph);
  }, [nodes, edges, onGraphChange]);
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#121212' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
        onConnect={onConnect} 
        nodeTypes={nodeTypes} 
        fitView
      >
        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}