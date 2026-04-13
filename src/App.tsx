
import { useState, useEffect } from 'react';
import NodeEditor from './NodeEditor';
import Canvas3D from './Canvas3D';
import { MaterialContext } from './core/contexts/MaterialContext';
import type { ShaderGraph } from './types/ast';
import type { IWorkspaceStorage } from './core/storage/IWorkspaceStorage';
import type { SavedWorkspace } from './types/workspace';


interface AppProps {
    storage: IWorkspaceStorage;
}

const AVAILABLE_CONTEXTS = [MaterialContext];

function App({ storage }: AppProps) {
  
  const [graph, setGraph] = useState<ShaderGraph>({ nodes: [], connections: [] });
  const [activeContext, setActiveContext] = useState(MaterialContext);
  const [contextSettings, setContextSettings] = useState<Record<string, any>>({
    shape: 'STAR_LAMP' 
  });

  const [loadedWorkspace, setLoadedWorkspace] = useState<SavedWorkspace | null>(null);

  const handleLoadWorkspace = (workspace: SavedWorkspace) => {
    const ctx = AVAILABLE_CONTEXTS.find(c => c.id === workspace.contextId) || MaterialContext;
    setActiveContext(ctx);
    setContextSettings(workspace.settings);
    setLoadedWorkspace(workspace);
  };

  useEffect(() => {
    storage.load().then(autosave => {
      if (autosave) handleLoadWorkspace(autosave);
    });
  }, [storage]);

  

  const handleSettingChange = (key: string, value: any) => {
    setContextSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <NodeEditor 
           storage={storage}
           activeContext={activeContext}
           contextSettings={contextSettings}
           loadedWorkspace={loadedWorkspace}       
           onLoadWorkspace={handleLoadWorkspace}  
           onSettingChange={handleSettingChange}
           onGraphChange={setGraph} 
        />
      </div>
      <div style={{ flex: 1 }}>
        {/* Pass settings directly so Canvas3D can read settings.shape or settings.particleCount */}
        <Canvas3D graph={graph} contextSettings={contextSettings} activeContext={activeContext} />
      </div>
    </div>
  );
}
export default App;