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
import { useWorkspaceIO } from './core/hooks/useWorkSpaceIO';
import { useShaderCompiler } from './core/hooks/useShaderCompiler';
import { useHistory } from './core/hooks/useHistory';

const nodeTypes = Object.keys(NODE_DEFINITIONS).reduce((acc, key) => {
    acc[key] = (props: any) => <BaseNode {...props} definition={NODE_DEFINITIONS[key]} />;
    return acc;
}, {} as Record<string, React.ComponentType<any>>);

interface NodeEditorProps {
    activeContext: IProjectContext;
    rfNodes: Node[];
    rfEdges: Edge[];
    graph: ShaderGraph;
    contextSettings: Record<string, any>;
    onFlowChange: (nodes: Node[], edges: Edge[], graph: ShaderGraph, past: any[], future: any[]) => void;
    initialPast: {nodes: Node[], edges: Edge[]}[];
    initialFuture: {nodes: Node[], edges: Edge[]}[];
    onSettingChange: (key: string, value: any) => void;
    onContextChange: (contextId: string) => void;
    allWorkspaces: Record<string, { graph: ShaderGraph; settings: any }>;
    availableContexts: IProjectContext[];
    storage?: IWorkspaceStorage;
    loadedWorkspace?: SavedWorkspace | null;
    onLoadWorkspace?: (workspace: SavedWorkspace) => void;
    globalSettings: { namespace: string; projectName: string };
    onGlobalSettingChange: (key: string, value: any) => void;
}

export default function NodeEditor({ 
    activeContext,
    rfNodes,
    rfEdges,
    graph,
    onFlowChange, 
    initialPast,
    initialFuture,
    onSettingChange, 
    allWorkspaces, 
    onContextChange,
    availableContexts,
    storage,
    contextSettings,
    loadedWorkspace,
    onLoadWorkspace,
    globalSettings,
    onGlobalSettingChange
}: NodeEditorProps) {
  
  const [nodes, setNodes] = useState<Node[]>(rfNodes);
  const [edges, setEdges] = useState<Edge[]>(rfEdges);

  const history = useHistory(
    initialPast,
    initialFuture,
    setNodes,
    setEdges,
    nodes,
    edges
  );

  // Restore Local Nodes when Context Swaps
  useEffect(() => {

    history.setHistory(initialPast, initialFuture);

    if (loadedWorkspace && loadedWorkspace.contextId === activeContext.id) {
      setNodes(loadedWorkspace.nodes);
      setEdges(loadedWorkspace.edges);
    } else {
      // Pull strictly from the RAM state passed via props
      setNodes(rfNodes);
      setEdges(rfEdges);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContext.id, loadedWorkspace]); 

  const { fileInputRef, handleSave, handleGameExport, handleFileUpload } = useWorkspaceIO({
      activeContext, nodes, edges, contextSettings, globalSettings, allWorkspaces, storage, onLoadWorkspace
  });

  


  useShaderCompiler({ 
      nodes, 
      edges, 
      past: history.past, 
      future: history.future, 
      onFlowChange 
  });

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => {
      history.takeSnapshot(); 
      setEdges((eds) => addEdge(params, eds)); 
  }, [history.takeSnapshot]);

  const updateNodeValue = useCallback((nodeId: string, inputId: string, newValue: any) => {
    setNodes((nds) => nds.map((node) => {
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

  const onNodeDragStart = useCallback(() => {
      history.takeSnapshot();
  }, [history.takeSnapshot]);



  const addNode = (type: string) => {
    const def = NODE_DEFINITIONS[type];
    if (!def) return;
    history.takeSnapshot();
    const newNode: Node = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type: def.type,
      position: { x: 100, y: 100 },
      data: { 
        astType: def.type,
        inputs: def.inputs.map(i => ({ id: i.id, type: i.type, value: i.default })),
        outputs: def.outputs.map(o => ({ id: o.id, type: o.type }))
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const flowNodes = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: { ...n.data, updateNodeValue },
    }));
  }, [nodes, updateNodeValue]);

  return (
    
    <div style={{ width: '100%', height: '100%', backgroundColor: '#121212' }}>
      {/* TODO: Evaluate moving this to a proper 
        standalone header component in the future */}

        <ReactFlow nodes={flowNodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} onNodeDragStart={onNodeDragStart} fitView >
        
        <Panel position="top-center" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>MOD ID</span>
    <input 
        type="text" 
        value={globalSettings.namespace}
        onChange={(e) => onGlobalSettingChange('namespace', e.target.value)}
        placeholder="namespace"
        style={{ background: '#121212', color: '#4dabf7', border: '1px solid #4a4a4a', borderRadius: '4px', padding: '4px 6px', fontSize: '12px', width: '90px', outline: 'none' }}
    />
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>PROJECT</span>
    <input 
        type="text" 
        value={globalSettings.projectName}
        onChange={(e) => onGlobalSettingChange('projectName', e.target.value)}
        style={{ background: 'transparent', color: 'white', border: '1px dashed #4a4a4a', borderRadius: '4px', padding: '4px 6px', fontWeight: 'bold', fontSize: '12px', width: '130px', outline: 'none' }}
    />
</div>
          <select value={activeContext.id} onChange={(e) => {onFlowChange(nodes, edges, graph ,history.past, history.future);onContextChange(e.target.value)}} style={{ background: '#121212', color: '#4dabf7', border: '1px solid #4a4a4a', padding: '6px', borderRadius: '4px', fontSize: '12px' }}>
            {availableContexts.map(ctx => <option key={ctx.id} value={ctx.id}>{ctx.name}</option>)}
          </select>
          <button onClick={handleGameExport} style={{ background: '#2b8a3e', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold' }}>🚀 Export to Minecraft</button>
          <button onClick={() => handleSave(true)} style={{ background: '#333', color: 'white', border: '1px solid #4a4a4a', padding: '6px 16px', borderRadius: '4px' }}>💾 Export .cosmosproj</button>
          <button onClick={() => fileInputRef.current?.click()} style={{ background: '#333', color: 'white', border: '1px solid #4a4a4a', padding: '6px 16px', borderRadius: '4px' }}>📂 Load</button>
          <input type="file" accept=".cosmosproj" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        </Panel>
        <Panel position="top-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', marginTop : '100px' }}>
          <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>ADD NODE</div>
          {Object.values(NODE_DEFINITIONS).filter(def => activeContext.isNodeAllowed(def.type)).map(def => (
            <button key={def.type} onClick={() => addNode(def.type)} style={{ background: '#1e1e1e', color: def.color, border: `1px solid ${def.color}55`, padding: '6px 12px', borderRadius: '4px', fontSize: '11px', textAlign: 'left' }}>
              + {def.label}
            </button>
          ))}
        </Panel>
      
        <Panel position="top-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: '#1e1e1e', borderRadius: '6px', border: '1px solid #333', marginTop: '100px' }}>
          <activeContext.SettingsPanel settings={contextSettings} onSettingChange={onSettingChange} />
        </Panel>
        <Background color="#333" gap={16} />
        <Controls position="bottom-right"  />
      </ReactFlow>
    </div>
  );
}