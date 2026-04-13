// src/NodeEditor.tsx
import { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, Panel } from 'reactflow';
import type { NodeChange, EdgeChange, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import type { ShaderGraph, ShaderNode, ShaderConnection, NodeType } from './types/ast';
import { NODE_DEFINITIONS } from './core/NodeDefinitions';
import { BaseNode } from './components/BaseNode';

interface NodeEditorProps {
  onGraphChange: (graph: ShaderGraph) => void;
}

// Dynamically generate the initial state based on definitions
const initialNodes: Node[] = [
  { id: 'out-1', type: 'OUTPUT_FRAG', position: { x: 600, y: 150 }, data: { astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }], outputs: [] } },
];

export default function NodeEditor({ onGraphChange }: NodeEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

  // Update logic to handle slider sliding permanently
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

  // Inject the updater into every node dynamically
  const displayNodes = nodes.map(node => ({
    ...node,
    data: { ...node.data, updateNodeValue }
  }));

  // Dynamically map all definitions to the BaseNode React Component
  const nodeTypes = useMemo(() => {
    return Object.keys(NODE_DEFINITIONS).reduce((acc, key) => {
      acc[key] = (props: any) => <BaseNode {...props} definition={NODE_DEFINITIONS[key]} />;
      return acc;
    }, {} as Record<string, React.ComponentType<any>>);
  }, []);

  // Factory to create new nodes from the Panel
  const addNode = (type: string) => {
    const def = NODE_DEFINITIONS[type];
    if (!def) return;

    const newNode: Node = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type: def.type,
      position: { x: window.innerWidth / 4, y: window.innerHeight / 4 }, // Spawn in view
      data: { 
        astType: def.type,
        inputs: def.inputs.map(i => ({ id: i.id, type: i.type, value: i.default })),
        outputs: def.outputs.map(o => ({ id: o.id, type: o.type }))
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // The Bridge
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

    onGraphChange({ nodes: astNodes, connections: astConnections });
  }, [nodes, edges, onGraphChange]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#121212' }}>
      <ReactFlow nodes={displayNodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
        
        {/* Dynamic Toolbar */}
        <Panel position="top-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
          <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>ADD NODE</div>
          {Object.values(NODE_DEFINITIONS).map(def => (
            <button 
              key={def.type} onClick={() => addNode(def.type)}
              style={{ background: '#1e1e1e', color: def.color, border: `1px solid ${def.color}55`, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', textAlign: 'left', textTransform: 'uppercase' }}>
              + {def.label}
            </button>
          ))}
        </Panel>

        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}