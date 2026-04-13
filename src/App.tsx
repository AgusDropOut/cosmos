// src/App.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import NodeEditor from './NodeEditor';
import Canvas3D from './Canvas3D';
import { MaterialContext } from './core/contexts/MaterialContext';
import { TrailContext } from './core/contexts/TrailContext';
import type { ShaderGraph } from './types/ast';
import type { IWorkspaceStorage } from './core/storage/IWorkspaceStorage';
import type { SavedWorkspace } from './types/workspace';

interface AppProps {
    storage: IWorkspaceStorage;
}

const AVAILABLE_CONTEXTS = [MaterialContext, TrailContext]; 

function App({ storage }: AppProps) {
  const [workspaces, setWorkspaces] = useState<Record<string, { graph: ShaderGraph, settings: any }>>({
    'MATERIAL': { graph: { nodes: [], connections: [] }, settings: { shape: 'CUBE' } },
    'TRAIL': { graph: { nodes: [], connections: [] }, settings: { segments: 20 } }
  });
  
  const [activeContextId, setActiveContextId] = useState('MATERIAL');
  const [loadedWorkspace, setLoadedWorkspace] = useState<SavedWorkspace | null>(null);

  const activeContext = useMemo(() => 
    AVAILABLE_CONTEXTS.find(c => c.id === activeContextId) || MaterialContext, 
  [activeContextId]);

  // Memoized handlers to prevent infinite update loops in child components
  const handleLoadWorkspace = useCallback((workspace: SavedWorkspace) => {
    const ctx = AVAILABLE_CONTEXTS.find(c => c.id === workspace.contextId) || MaterialContext;
    setActiveContextId(ctx.id);
    setWorkspaces(prev => ({
        ...prev,
        [ctx.id]: { graph: { nodes: [], connections: [] }, settings: workspace.settings }
    }));
    setLoadedWorkspace(workspace);
  }, []);

  const updateCurrentWorkspace = useCallback((graph: ShaderGraph) => {
    setWorkspaces(prev => {
        // Deep comparison check to break potential update loops
        const currentGraph = prev[activeContextId].graph;
        if (JSON.stringify(currentGraph) === JSON.stringify(graph)) return prev;
        
        return {
            ...prev,
            [activeContextId]: { ...prev[activeContextId], graph }
        };
    });
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

  // Persistence logic
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
           graph={workspaces[activeContextId].graph}
           contextSettings={workspaces[activeContextId].settings}
           onGraphChange={updateCurrentWorkspace}
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