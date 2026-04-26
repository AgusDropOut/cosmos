// src/NodeEditor.tsx
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, Panel, useReactFlow } from 'reactflow';
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
import { EditorToolbar } from './components/editor/EditorToolbar';
import { NodeSearchModal } from './components/editor/NodeSearchModal';
import { usePresets } from './core/hooks/usePresets';
import { PresetModal } from './components/editor/PresetModal';
import { ConfigModal } from './components/editor/ConfigModal';
import { useIDEConfig } from './core/hooks/useIDEConfig';

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
  const [isNodeMenuOpen, setIsNodeMenuOpen] = useState(false);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const { config, updateConfig } = useIDEConfig();
  const { availablePresets, applyPreset } = usePresets(activeContext.id);
  const { screenToFlowPosition } = useReactFlow();

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

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, []);

  const onNodeDragStart = useCallback(() => {
      history.takeSnapshot();
  }, [history.takeSnapshot]);

  const onNodesDelete = useCallback(() => {
      
      history.takeSnapshot();
  }, [history]);

  const onEdgesDelete = useCallback(() => {
      history.takeSnapshot();
  }, [history]);



  const addNode = (type: string) => {
    const def = NODE_DEFINITIONS[type];
    if (!def) return;
    
    history.takeSnapshot();
    const flowElement = document.getElementById('cosmos-editor');
    
    let spawnPosition = { x: 100, y: 100 }; // Fallback

    if (flowElement) {
        const bounds = flowElement.getBoundingClientRect();
        
        
        const screenCenterX = bounds.left + bounds.width / 2;
        const screenCenterY = bounds.top + bounds.height / 2;

        //  Project those physical pixels through the camera matrix
        spawnPosition = screenToFlowPosition({
            x: screenCenterX,
            y: screenCenterY,
        });
    } else {
        // Fallback: Assume the editor takes up the whole browser window
        spawnPosition = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
    }

    const newNode: Node = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type: def.type,
      position: spawnPosition, 
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
      data: { ...n.data, updateNodeValue, updateNodeData },
    }));
  }, [nodes, updateNodeValue, updateNodeData]);

return (
   <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0e0e0e', overflow: 'hidden' }}>
        
        <EditorToolbar 
            globalSettings={globalSettings}
            onGlobalSettingChange={onGlobalSettingChange}
            activeContext={activeContext}
            availableContexts={availableContexts}
            onContextChange={onContextChange}
            onFlowChange={onFlowChange}
            nodes={nodes}
            edges={edges}
            graph={graph}
            history={history}
            handleGameExport={handleGameExport}
            handleSave={handleSave}
            handleFileUpload={handleFileUpload}
            fileInputRef={fileInputRef}
            onOpenNodeMenu={() => setIsNodeMenuOpen(true)}
            onOpenPresetMenu={() => setIsPresetMenuOpen(true)}
            onOpenConfigMenu={() => setIsConfigMenuOpen(true)}
            contextSettings={contextSettings}
            onSettingChange={onSettingChange}
        />

        {/* Full-width, Full-height Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
            <ReactFlow 
                nodes={flowNodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                deleteKeyCode={config.shortcuts.delete}
                selectionKeyCode={config.shortcuts.boxSelect}          
                multiSelectionKeyCode={config.shortcuts.multiSelect}
                onConnect={onConnect} 
                nodeTypes={nodeTypes} 
                onNodeDragStart={onNodeDragStart} 
                fitView 
                id="cosmos-editor"
            >
                <Background color="#222" gap={16} />
                <Controls position="bottom-right" style={{ background: '#1e1e1e', borderColor: '#333' }} />
            </ReactFlow>

            

            {/* The Overlay Modal */}
            <NodeSearchModal 
                isOpen={isNodeMenuOpen} 
                onClose={() => setIsNodeMenuOpen(false)} 
                activeContext={activeContext} 
                addNode={addNode} 
            />

            <PresetModal 
                isOpen={isPresetMenuOpen}
                onClose={() => setIsPresetMenuOpen(false)}
                availablePresets={availablePresets}
                onSelectPreset={(presetId) => {
                    applyPreset(presetId, setNodes, setEdges, onSettingChange, history.takeSnapshot);
                }}
                activeContext={activeContext}
            />

            <ConfigModal
                isOpen={isConfigMenuOpen}
                onClose={() => setIsConfigMenuOpen(false)}
                config={config}
                updateConfig={updateConfig}
            />

        </div>
    </div>
  );
}