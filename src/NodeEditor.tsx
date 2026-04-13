import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, Panel} from 'reactflow';
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

const NODE_TEMPLATES: Record<string, any> = {
  COLOR: {
    type: 'COLOR',
    data: { 
      astType: 'COLOR', 
      inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0.5, g: 0.5, b: 0.5 } }], 
      outputs: [{ id: 'out', type: 'vec3' }] 
    }
  },
  NOISE: {
    type: 'NOISE',
    data: { 
      astType: 'NOISE', 
      inputs: [{ id: 'scale', type: 'float', value: 10.0 }], 
      outputs: [{ id: 'out', type: 'float' }] 
    }
  },
  MULTIPLY: {
    type: 'MULTIPLY',
    data: { 
      astType: 'MULTIPLY', 
      inputs: [{ id: 'a', type: 'vec3' }, { id: 'b', type: 'float' }], 
      outputs: [{ id: 'out', type: 'vec3' }] 
    }
  },
  TIME: {
    type: 'TIME',
    data: { 
      astType: 'TIME', 
      inputs: [{ id: 'speed', type: 'float', value: 1.0 }], 
      outputs: [{ id: 'out', type: 'float' }] 
    }
  }
};



interface NodeEditorProps {
  onGraphChange: (graph: ShaderGraph) => void;
}

const initialNodes: Node[] = [
  { id: 'color-1', type: 'COLOR', position: { x: 50, y: 100 }, data: { astType: 'COLOR', inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0.8, g: 0.2, b: 0.1 } }], outputs: [{ id: 'out', type: 'vec3' }] } },
  { id: 'noise-1', type: 'NOISE', position: { x: 50, y: 250 }, data: { astType: 'NOISE', inputs: [{ id: 'scale', type: 'float', value: 10.0 }], outputs: [{ id: 'out', type: 'float' }] } },
  { id: 'mult-1', type: 'MULTIPLY', position: { x: 300, y: 150 }, data: { astType: 'MULTIPLY', inputs: [{ id: 'a', type: 'vec3' }, { id: 'b', type: 'float' }], outputs: [{ id: 'out', type: 'vec3' }] } },
  { id: 'out-1', type: 'OUTPUT_FRAG', position: { x: 550, y: 150 }, data: { astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }], outputs: [] } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'color-1', sourceHandle: 'out', target: 'mult-1', targetHandle: 'a' },
  { id: 'e2', source: 'noise-1', sourceHandle: 'out', target: 'mult-1', targetHandle: 'b' },
  { id: 'e3', source: 'mult-1', sourceHandle: 'out', target: 'out-1', targetHandle: 'color' }
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


  const updateNodeValue = useCallback((nodeId: string, inputId: string, newValue: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
         
          const newInputs = node.data.inputs.map((inp: any) =>
            inp.id === inputId ? { ...inp, value: newValue } : inp
          );
          
          return { ...node, data: { ...node.data, inputs: newInputs } };
        }
        return node;
      })
    );
  }, []);

 
  const displayNodes = nodes.map(node => ({
    ...node,
    data: { ...node.data, updateNodeValue }
  }));

   const addNode = (type: string) => {
    const template = NODE_TEMPLATES[type];
    if (!template) return;

    const newNode: Node = {
      id: `${type.toLowerCase()}-${Date.now()}`, // Unique ID
      type: template.type,
      position: { x: 100, y: 100 }, // Default spawn position
      data: { ...template.data }
    };

    setNodes((nds) => [...nds, newNode]);
  };

  
  useEffect(() => {

   

    
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

    const fullGraph = { nodes: astNodes, connections: astConnections };
    

    console.log("Bridge sending graph to App:", fullGraph);
    
    
    onGraphChange(fullGraph);
  }, [nodes, edges, onGraphChange]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#121212' }}>
      <ReactFlow 
        nodes={displayNodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
        onConnect={onConnect} 
        nodeTypes={nodeTypes} 
        fitView
      >
        <Panel position="top-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>ADD NODE</div>
          {Object.keys(NODE_TEMPLATES).map(type => (
            <button 
              key={type} 
              onClick={() => addNode(type)}
              style={{
                background: '#1e1e1e',
                color: 'white',
                border: '1px solid #4a4a4a',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                textAlign: 'left'
              }}
            >
              + {type}
            </button>
          ))}
        </Panel>

        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

