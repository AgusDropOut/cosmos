// src/App.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import NodeEditor from './NodeEditor';
import Canvas3D from './Canvas3D';
import { MaterialContext } from './core/contexts/MaterialContext';
import { TrailContext } from './core/contexts/TrailContext';
import type { ShaderGraph, NodeType } from './types/ast';
import type { IWorkspaceStorage } from './core/storage/IWorkspaceStorage';
import type { SavedWorkspace } from './types/workspace';
import { type Node, type Edge, ReactFlowProvider } from 'reactflow';
import type { useHistory } from './core/hooks/useHistory';
import { BeamContext } from './core/contexts/BeamContext';
import { IDEConfigProvider } from './core/hooks/useIDEConfig';

interface AppProps {
    storage: IWorkspaceStorage;
}



const AVAILABLE_CONTEXTS = [MaterialContext, TrailContext, BeamContext]; 

// Synchronous load function prevents empty-state overwrites
const getInitialState = () => {
    try {
        const saved = localStorage.getItem('cosmos_full_state');
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Cosmos: Failed to parse session state", e);
    }
    return null;
};

function App({ storage }: AppProps) {
  const initialState = getInitialState();

  // Initialize state with stored data or fallback to defaults
  const defaultWorkspaces = {
      'MATERIAL': { rfNodes: MaterialContext.getInitialNodes(), rfEdges: [], graph: { nodes: [], connections: [] }, settings: { shape: 'CUBE' }, historyPast: [], historyFuture: [] },
      'TRAIL': { rfNodes: TrailContext.getInitialNodes(), rfEdges: [], graph: { nodes: [], connections: [] }, settings: { segments: 20 }, historyPast: [], historyFuture: [] },
      'BEAM': { rfNodes: BeamContext.getInitialNodes(), rfEdges: [], graph: { nodes: [], connections: [] }, settings: { segments: 20 }, historyPast: [], historyFuture: [] }
  };

  
  const [workspaces, setWorkspaces] = useState<Record<string, any>>({
      ...defaultWorkspaces,
      ...(initialState?.workspaces || {})
  });


  
  const [activeContextId, setActiveContextId] = useState(initialState?.activeContextId || 'MATERIAL');
  const [loadedWorkspace, setLoadedWorkspace] = useState<SavedWorkspace | null>(null);

  const [globalSettings, setGlobalSettings] = useState<{namespace: string, projectName: string}>(
    initialState?.globalSettings || {
      namespace: 'bloodyhell',
      projectName: 'My Cosmos Project'
    }
  );

  

  const activeContext = useMemo(() => 
    AVAILABLE_CONTEXTS.find(c => c.id === activeContextId) || MaterialContext, 
  [activeContextId]);

  const handleFlowChange = useCallback((
    nodes: Node[], edges: Edge[], graph: ShaderGraph , 
    past: {nodes: Node[], edges: Edge[]}[], 
    future: {nodes: Node[], edges: Edge[]}[]) => {
    const enrichedGraph: ShaderGraph = {
        ...graph,
        nodes: graph.nodes.map(sn => {
            const rfNode = nodes.find(n => n.id === sn.id);
            return {
                ...sn,
                position: rfNode ? rfNode.position : { x: 0, y: 0 }
            };
        })
    };

    setWorkspaces(prev => ({
        ...prev,
        [activeContextId]: { 
            ...prev[activeContextId], 
            rfNodes: nodes, 
            rfEdges: edges, 
            graph: enrichedGraph, 
            historyPast: past, 
            historyFuture: future 
        }
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
    try {
        console.log("Cosmos: Loading v2.0 Workspace...", workspace);

        // Restore Global Settings
        if (workspace.globalSettings) {
            setGlobalSettings(workspace.globalSettings);
        }

        // Set the active tab to whatever they were looking at when they saved
        const targetContextId = workspace.activeContextId || 'MATERIAL';
        setActiveContextId(targetContextId);

        // Reconstruct the React Flow state for EVERY tab in the save file
        const reconstructedWorkspaces: Record<string, any> = {};

        Object.keys(workspace.workspaces).forEach(ctxId => {
            const savedTabData = workspace.workspaces[ctxId];

            reconstructedWorkspaces[ctxId] = {
                // Map the saved mathematical nodes back into physical React Flow UI boxes
                rfNodes: savedTabData.graph.nodes.map(n => ({
                    id: n.id,
                    type: n.type,
                    position: n.position || { x: Math.random() * 200, y: Math.random() * 200 },
                    data: {
                        astType: n.type,
                        inputs: n.inputs,
                        outputs: n.outputs,
                        isUniform: n.isUniform, 
                        uniformName: n.uniformName
                    }
                } as Node)),
                
                // Map the saved mathematical connections back into physical React Flow wires
                rfEdges: savedTabData.graph.connections.map(e => ({
                    id: e.id,
                    source: e.sourceNodeId,
                    sourceHandle: e.sourcePortId,
                    target: e.targetNodeId,
                    targetHandle: e.targetPortId
                } as Edge)),
                
                graph: savedTabData.graph,
                settings: savedTabData.settings,
                historyPast: [],
                historyFuture: []
            };
        });

        //  Inject the reconstructed data into the central React state
        setWorkspaces(prev => ({
            ...prev,
            ...reconstructedWorkspaces
        }));
        
        setLoadedWorkspace(workspace);
        console.log("Cosmos: Load Complete!");

    } catch (error) {
        console.error("Cosmos CRITICAL: Failed to unpack workspace data!", error);
        alert("Failed to load project data. Check the console for details.");
    }
  }, []);

  // Debounced session persistence
  useEffect(() => {
    const timer = setTimeout(() => {
        localStorage.setItem('cosmos_full_state', JSON.stringify({ workspaces, activeContextId, globalSettings }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [workspaces, activeContextId, globalSettings]);

  return (
    <IDEConfigProvider>
      <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
        <div style={{ flex: 1 }}>
          <ReactFlowProvider>
            <NodeEditor 
               activeContext={activeContext}
               availableContexts={AVAILABLE_CONTEXTS}
               rfNodes={workspaces[activeContextId].rfNodes}
               rfEdges={workspaces[activeContextId].rfEdges}
               graph={workspaces[activeContextId].graph}
               contextSettings={workspaces[activeContextId].settings}
               onFlowChange={handleFlowChange}
               initialPast={workspaces[activeContextId].historyPast}
               initialFuture={workspaces[activeContextId].historyFuture}
               onSettingChange={handleSettingChange}
               allWorkspaces={workspaces}
               onContextChange={setActiveContextId}
               storage={storage}
               loadedWorkspace={loadedWorkspace}
               onLoadWorkspace={handleLoadWorkspace}
               globalSettings={globalSettings}
               onGlobalSettingChange={(key, value) => setGlobalSettings(prev => ({ ...prev, [key]: value }))}
            />
          </ReactFlowProvider>
        </div>
        <div style={{ flex: 1 }}>
          <Canvas3D 
              graph={workspaces[activeContextId].graph} 
              contextSettings={workspaces[activeContextId].settings} 
              activeContext={activeContext} 
              globalMaterial={workspaces['MATERIAL'].graph} 
              globalMaterialSettings={workspaces['MATERIAL'].settings}
          />
        </div>
      </div>
    </IDEConfigProvider>
  );
}

export default App;