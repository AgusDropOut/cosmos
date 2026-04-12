// src/NodeEditor.tsx
import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { NodeChange, EdgeChange, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import type { ShaderGraph, ShaderNode, ShaderConnection, NodeType } from './types/ast';

interface NodeEditorProps {
  onGraphChange: (graph: ShaderGraph) => void;
}


const initialNodes: Node[] = [
  { id: 'color-1', position: { x: 50, y: 100 }, data: { label: 'Color', astType: 'COLOR', inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0.8, g: 0.2, b: 0.1 } }], outputs: [{ id: 'out', type: 'vec3' }] } },
  { id: 'noise-1', position: { x: 50, y: 200 }, data: { label: 'Noise', astType: 'NOISE', inputs: [{ id: 'scale', type: 'float', value: 10.0 }], outputs: [{ id: 'out', type: 'float' }] } },
  { id: 'mult-1', position: { x: 250, y: 150 }, data: { label: 'Multiply', astType: 'MULTIPLY', inputs: [{ id: 'a', type: 'vec3' }, { id: 'b', type: 'float' }], outputs: [{ id: 'out', type: 'vec3' }] } },
  { id: 'out-1', position: { x: 450, y: 150 }, data: { label: 'Output', astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }], outputs: [] } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'color-1', target: 'mult-1' },
  { id: 'e2', source: 'noise-1', target: 'mult-1' },
  { id: 'e3', source: 'mult-1', target: 'out-1' }
];

export default function NodeEditor({ onGraphChange }: NodeEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

 
  useEffect(() => {
    const astNodes: ShaderNode[] = nodes.map(n => ({
      id: n.id,
      type: n.data.astType as NodeType,
      inputs: n.data.inputs || [],
      outputs: n.data.outputs || []
    }));

    const astConnections: ShaderConnection[] = edges.map(e => {
      
      const sourceNode = astNodes.find(n => n.id === e.source);
      const targetNode = astNodes.find(n => n.id === e.target);
      
      let targetPort = 'a'; 
      if (targetNode?.type === 'OUTPUT_FRAG') targetPort = 'color';
      if (targetNode?.type === 'MULTIPLY' && sourceNode?.type === 'NOISE') targetPort = 'b'; 

      return {
        id: e.id,
        sourceNodeId: e.source,
        sourcePortId: 'out',
        targetNodeId: e.target,
        targetPortId: targetPort
      };
    });

    onGraphChange({ nodes: astNodes, connections: astConnections });
  }, [nodes, edges, onGraphChange]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#121212' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}