// src/NodeEditor.tsx
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, Panel } from 'reactflow';
import type { NodeChange, EdgeChange, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import type { ShaderGraph, ShaderNode, ShaderConnection, NodeType } from './types/ast';
import { NODE_DEFINITIONS } from './core/NodeDefinitions';
import { BaseNode } from './components/BaseNode';
import type { IProjectContext } from './types/context';
import type { IWorkspaceStorage } from './core/storage/IWorkspaceStorage';
import type { SavedWorkspace } from './types/workspace';

interface NodeEditorProps {
  storage: IWorkspaceStorage;
  activeContext: IProjectContext;
  contextSettings: Record<string, any>; 
  loadedWorkspace: SavedWorkspace | null;               
  onLoadWorkspace: (workspace: SavedWorkspace) => void; 
  onSettingChange: (key: string, value: any) => void;
  onGraphChange: (graph: ShaderGraph) => void;
}

export default function NodeEditor({ 
  storage,
  activeContext, 
  contextSettings,
  loadedWorkspace, 
  onLoadWorkspace, 
  onSettingChange, 
  onGraphChange 
}: NodeEditorProps) {
  
  const [nodes, setNodes] = useState<Node[]>(activeContext.getInitialNodes());
  const [edges, setEdges] = useState<Edge[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. SMART GRAPH RESET / LOAD
  useEffect(() => {
    if (loadedWorkspace && loadedWorkspace.contextId === activeContext.id) {
      setNodes(loadedWorkspace.nodes);
      setEdges(loadedWorkspace.edges);
    } else {
      setNodes(activeContext.getInitialNodes());
      setEdges([]);
    }
  }, [activeContext, loadedWorkspace]);

  // 2. STORAGE LOGIC
  const handleSave = async (download: boolean) => {
    const workspace: SavedWorkspace = {
      version: "1.0",
      name: "My Cosmos Shader", // In the future, you can add a text input for the user to name this!
      contextId: activeContext.id,
      settings: contextSettings,
      nodes,
      edges
    };
    
    await storage.save(workspace); 
    if (download) {
        await storage.exportFile(workspace);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const workspace = await storage.importFile(file);
      onLoadWorkspace(workspace);
    } catch (err) {
      alert("Failed to load project: " + err);
    }
  };

  // 3. AUTOSAVE TRIGGER
  useEffect(() => {
    // Only autosave if we actually have nodes (prevents saving a blank screen on first load)
    if (nodes.length > 0) {
      handleSave(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, contextSettings]);


  // 4. REACT FLOW LOGIC
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

  // 5. COMPILER BRIDGE
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
        
        {/* IDE TOOLBAR */}
        <Panel position="top-center" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <button onClick={() => handleSave(true)} style={{ background: '#2b8a3e', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            💾 Export .cosmosproj
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{ background: '#4dabf7', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            📂 Load Project
          </button>
          <input type="file" accept=".cosmosproj" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        </Panel>

        {/* DYNAMIC LEFT PANEL */}
        <Panel position="top-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
          <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>ADD NODE</div>
         {Object.values(NODE_DEFINITIONS)
            .filter(def => activeContext.isNodeAllowed(def.type))
            .map(def => (
            <button 
              key={def.type} onClick={() => addNode(def.type)}
              style={{ background: '#1e1e1e', color: def.color, border: `1px solid ${def.color}55`, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', textAlign: 'left', textTransform: 'uppercase' }}>
              + {def.label}
            </button>
          ))}
        </Panel>

        {/* DYNAMIC RIGHT PANEL */}
        <Panel position="top-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: '#1e1e1e', borderRadius: '6px', border: '1px solid #333' }}>
          <activeContext.SettingsPanel 
            settings={contextSettings} 
            onSettingChange={onSettingChange} 
          />
        </Panel>

        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}