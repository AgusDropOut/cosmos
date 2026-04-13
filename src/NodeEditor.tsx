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
import type { TrailExporter } from './core/exporter/TrailExporter';

interface NodeEditorProps {
    activeContext: IProjectContext;
    graph: ShaderGraph;
    contextSettings: Record<string, any>;
    onGraphChange: (graph: ShaderGraph) => void;
    onSettingChange: (key: string, value: any) => void;
    onContextChange: (contextId: string) => void;
    allWorkspaces: Record<string, { graph: ShaderGraph; settings: any }>;
    availableContexts: IProjectContext[];
    storage?: IWorkspaceStorage;
    loadedWorkspace?: SavedWorkspace | null;
    onLoadWorkspace?: (workspace: SavedWorkspace) => void;
}

export default function NodeEditor({ 
    activeContext, 
    onGraphChange, 
    onSettingChange, 
    allWorkspaces, 
    onContextChange,
    availableContexts,
    storage,
    contextSettings,
    loadedWorkspace,
    onLoadWorkspace
}: NodeEditorProps) {
  
  const [nodes, setNodes] = useState<Node[]>(activeContext.getInitialNodes());
  const [edges, setEdges] = useState<Edge[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal ReactFlow state with external context switches or file loads
  useEffect(() => {
    if (loadedWorkspace && loadedWorkspace.contextId === activeContext.id) {
      setNodes(loadedWorkspace.nodes);
      setEdges(loadedWorkspace.edges);
    } else {
      setNodes(activeContext.getInitialNodes());
      setEdges([]);
    }
  }, [activeContext, loadedWorkspace]);

  const handleSave = async (download: boolean) => {
    if (!storage) return;

    const workspace: SavedWorkspace = {
      version: "1.0",
      name: "My Cosmos Project", 
      contextId: activeContext.id,
      settings: contextSettings,
      nodes,
      edges
    };
    
    try {
        await storage.save(workspace); 
        if (download) await storage.exportFile(workspace);
    } catch (err) {
        console.error("Save failed", err);
    }
  };

  const handleGameExport = async () => {
    const exporter = activeContext.getExporter();
    if (!exporter) return;

    const currentGraph: ShaderGraph = {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.astType as NodeType,
        inputs: n.data.inputs || [],
        outputs: n.data.outputs || []
      })),
      connections: edges.map(e => ({
        id: e.id,
        sourceNodeId: e.source,
        sourcePortId: e.sourceHandle || 'out',
        targetNodeId: e.target,
        targetPortId: e.targetHandle || 'in'
      }))
    };

    try {
        let result;
        // Composite Export logic for Trails
        if (activeContext.id === 'TRAIL' && 'exportComposite' in exporter) {
            const materialData = allWorkspaces['MATERIAL'];
            result = await (exporter as any).exportComposite(
                currentGraph, 
                contextSettings, 
                materialData.graph, 
                "MyProject"
            );
        } else {
            result = await exporter.export(currentGraph, contextSettings, "MyProject");
        }
        
        const contentBlob = typeof result.fileContent === 'string' 
            ? new Blob([result.fileContent], { type: result.mimeType })
            : result.fileContent;

        const url = URL.createObjectURL(contentBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        alert("Failed to export: " + e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!storage) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const workspace = await storage.importFile(file);
      onLoadWorkspace?.(workspace);
    } catch (err) {
      alert("Failed to load project: " + err);
    }
  };

  // Compiler Bridge: Syncs local nodes/edges to the App-level RAM state
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

    onGraphChange({ nodes: astNodes, connections: astConnections });
  }, [nodes, edges, onGraphChange]);

  // React Flow logic
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

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
      position: { x: 100, y: 100 },
      data: { 
        astType: def.type,
        inputs: def.inputs.map(i => ({ id: i.id, type: i.type, value: i.default })),
        outputs: def.outputs.map(o => ({ id: o.id, type: o.type }))
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#121212' }}>
      <ReactFlow 
        nodes={nodes.map(n => ({ ...n, data: { ...n.data, updateNodeValue } }))} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
        onConnect={onConnect} 
        nodeTypes={nodeTypes} 
        fitView
      >
        <Panel position="top-center" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', alignItems: 'center' }}>
          <select 
            value={activeContext.id} 
            onChange={(e) => onContextChange(e.target.value)}
            style={{ background: '#121212', color: '#4dabf7', border: '1px solid #4a4a4a', padding: '6px', borderRadius: '4px', fontSize: '12px' }}
          >
            {availableContexts.map(ctx => <option key={ctx.id} value={ctx.id}>{ctx.name}</option>)}
          </select>

          <button onClick={handleGameExport} style={{ background: '#2b8a3e', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold' }}>🚀 Export to Minecraft</button>
          <button onClick={() => handleSave(true)} style={{ background: '#333', color: 'white', border: '1px solid #4a4a4a', padding: '6px 16px', borderRadius: '4px' }}>💾 Export .cosmosproj</button>
          <button onClick={() => fileInputRef.current?.click()} style={{ background: '#333', color: 'white', border: '1px solid #4a4a4a', padding: '6px 16px', borderRadius: '4px' }}>📂 Load</button>
          <input type="file" accept=".cosmosproj" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        </Panel>

        <Panel position="top-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
          <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>ADD NODE</div>
          {Object.values(NODE_DEFINITIONS)
            .filter(def => activeContext.isNodeAllowed(def.type))
            .map(def => (
            <button key={def.type} onClick={() => addNode(def.type)} style={{ background: '#1e1e1e', color: def.color, border: `1px solid ${def.color}55`, padding: '6px 12px', borderRadius: '4px', fontSize: '11px', textAlign: 'left' }}>
              + {def.label}
            </button>
          ))}
        </Panel>

        <Panel position="top-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: '#1e1e1e', borderRadius: '6px', border: '1px solid #333' }}>
          <activeContext.SettingsPanel settings={contextSettings} onSettingChange={onSettingChange} />
        </Panel>

        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}