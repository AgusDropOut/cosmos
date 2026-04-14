// src/App.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import NodeEditor from './NodeEditor';
import Canvas3D from './Canvas3D';
import { MaterialContext } from './core/contexts/MaterialContext';
import { TrailContext } from './core/contexts/TrailContext';
import type { ShaderGraph, NodeType } from './types/ast';
import type { IWorkspaceStorage } from './core/storage/IWorkspaceStorage';
import type { SavedWorkspace } from './types/workspace';
import type { Node, Edge } from 'reactflow';

interface AppProps {
    storage: IWorkspaceStorage;
}

const AVAILABLE_CONTEXTS = [MaterialContext, TrailContext]; 

function App({ storage }: AppProps) {
  // Global RAM State now explicitly stores ReactFlow Nodes & Edges to prevent layout loss!
  const [workspaces, setWorkspaces] = useState<Record<string, { rfNodes: Node[], rfEdges: Edge[], graph: ShaderGraph, settings: any }>>({
    'MATERIAL': { rfNodes: MaterialContext.getInitialNodes(), rfEdges: [], graph: { nodes: [], connections: [] }, settings: { shape: 'CUBE' } },
    'TRAIL': { rfNodes: TrailContext.getInitialNodes(), rfEdges: [], graph: { nodes: [], connections: [] }, settings: { segments: 20 } }
  });
  
  const [activeContextId, setActiveContextId] = useState('MATERIAL');
  const [loadedWorkspace, setLoadedWorkspace] = useState<SavedWorkspace | null>(null);

  const activeContext = useMemo(() => 
    AVAILABLE_CONTEXTS.find(c => c.id === activeContextId) || MaterialContext, 
  [activeContextId]);

  // Sync the child's local React Flow state up to the App-level RAM
  const handleFlowChange = useCallback((nodes: Node[], edges: Edge[], graph: ShaderGraph) => {
    setWorkspaces(prev => ({
        ...prev,
        [activeContextId]: { ...prev[activeContextId], rfNodes: nodes, rfEdges: edges, graph }
    }));
  }, [activeContextId]);

  const handleSettingChange = useCallback((key: string, value: any) => {
    setWorkspaces(prev => ({
        ...prev,
        [activeContextId]: { 
            ...prev[activeContextId], 
            settings: { ...prev[activeContextId].settings, [key]: value } 
        }
    }));
  }, [activeContextId]);

  const handleLoadWorkspace = useCallback((workspace: SavedWorkspace) => {
    const ctx = AVAILABLE_CONTEXTS.find(c => c.id === workspace.contextId) || MaterialContext;
    
    const mappedGraph: ShaderGraph = {
        nodes: workspace.nodes.map(n => ({
            id: n.id,
            type: n.data.astType as NodeType,
            inputs: n.data.inputs || [],
            outputs: n.data.outputs || []
        })),
        connections: workspace.edges.map(e => ({
            id: e.id,
            sourceNodeId: e.source,
            sourcePortId: e.sourceHandle || 'out',
            targetNodeId: e.target,
            targetPortId: e.targetHandle || 'in'
        }))
    };

    setActiveContextId(ctx.id);
    setWorkspaces(prev => ({
        ...prev,
        [ctx.id]: { 
            rfNodes: workspace.nodes, 
            rfEdges: workspace.edges, 
            graph: mappedGraph, 
            settings: workspace.settings 
        }
    }));
    setLoadedWorkspace(workspace);
  }, []);

  // F5 Persistence
  useEffect(() => {
    const timer = setTimeout(() => {
        localStorage.setItem('cosmos_full_state', JSON.stringify({ workspaces, activeContextId }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [workspaces, activeContextId]);

  useEffect(() => {
    storage.load().then(autosave => {
      if (autosave) handleLoadWorkspace(autosave);
    });
  }, [storage, handleLoadWorkspace]);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <NodeEditor 
           activeContext={activeContext}
           availableContexts={AVAILABLE_CONTEXTS}
           rfNodes={workspaces[activeContextId].rfNodes}
           rfEdges={workspaces[activeContextId].rfEdges}
           graph={workspaces[activeContextId].graph}
           contextSettings={workspaces[activeContextId].settings}
           onFlowChange={handleFlowChange}
           onSettingChange={handleSettingChange}
           allWorkspaces={workspaces}
           onContextChange={setActiveContextId}
           storage={storage}
           loadedWorkspace={loadedWorkspace}
           onLoadWorkspace={handleLoadWorkspace}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Canvas3D 
            graph={workspaces[activeContextId].graph} 
            contextSettings={workspaces[activeContextId].settings} 
            activeContext={activeContext} 
            globalMaterial={workspaces['MATERIAL'].graph} 
        />
      </div>
    </div>
  );
}

export default App;