import { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, Panel } from 'reactflow';
import type { NodeChange, EdgeChange, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import type { ShaderGraph, ShaderNode, ShaderConnection, NodeType } from './types/ast';
import { NODE_DEFINITIONS } from './core/NodeDefinitions';
import { BaseNode } from './components/BaseNode';

interface NodeEditorProps {
  onGraphChange: (graph: ShaderGraph) => void;
  onShapeChange: (shape: string) => void; /* New property for shape routing */
}

/* Initial state includes both fragment and vertex outputs */
const initialNodes: Node[] = [
  { id: 'out-1', type: 'OUTPUT_FRAG', position: { x: 600, y: 150 }, data: { astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }], outputs: [] } },
  { id: 'out-vert-1', type: 'OUTPUT_VERT', position: { x: 600, y: 300 }, data: { astType: 'OUTPUT_VERT', inputs: [{ id: 'position_offset', type: 'vec3' }, { id: 'scale', type: 'float', value: 1.0 }], outputs: [] } }
];

export default function NodeEditor({ onGraphChange, onShapeChange }: NodeEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedShape, setSelectedShape] = useState<string>('CUBE');

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

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

  const nodeTypes = useMemo(() => {
    return Object.keys(NODE_DEFINITIONS).reduce((acc, key) => {
      acc[key] = (props: any) => <BaseNode {...props} definition={NODE_DEFINITIONS[key]} />;
      return acc;
    }, {} as Record<string, React.ComponentType<any>>);
  }, []);

  const addNode = (type: string) => {
    const def = NODE_DEFINITIONS[type];
    if (!def) return;

    const newNode: Node = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type: def.type,
      position: { x: window.innerWidth / 4, y: window.innerHeight / 4 },
      data: { 
        astType: def.type,
        inputs: def.inputs.map(i => ({ id: i.id, type: i.type, value: i.default })),
        outputs: def.outputs.map(o => ({ id: o.id, type: o.type }))
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleShapeSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedShape(val);
    onShapeChange(val);
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

    onGraphChange({ nodes: astNodes, connections: astConnections });
  }, [nodes, edges, onGraphChange]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#121212' }}>
      <ReactFlow nodes={displayNodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
        
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

        {/* Geometry Selector Panel */}
        <Panel position="top-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: '#1e1e1e', borderRadius: '6px', border: '1px solid #333' }}>
          <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>BASE SHAPE</div>
          <select value={selectedShape} onChange={handleShapeSelection} style={{ background: '#121212', color: 'white', border: '1px solid #4a4a4a', padding: '4px', borderRadius: '4px', fontSize: '11px', outline: 'none' }}>
            <option value="CUBE">Cube</option>
            <option value="SPHERE">Sphere</option>
            <option value="ICOSAHEDRON">Icosahedron</option>
            <option value="CYLINDER">Cylinder</option>
          </select>
        </Panel>

        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}