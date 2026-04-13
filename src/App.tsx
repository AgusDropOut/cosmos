import { useState } from 'react';
import NodeEditor from './NodeEditor';
import Canvas3D from './Canvas3D';
import { MaterialContext } from './core/contexts/MaterialContext';
import type { ShaderGraph } from './types/ast';

function App() {
  const [graph, setGraph] = useState<ShaderGraph>({ nodes: [], connections: [] });
  
  // App holds the active Context
  const [activeContext, setActiveContext] = useState(MaterialContext);
  
  // App holds the generic settings dict (routing the shape, particle counts, etc)
  const [contextSettings, setContextSettings] = useState<Record<string, any>>({
    shape: 'STAR_LAMP' // Default shape for Material Context
  });

  const handleSettingChange = (key: string, value: any) => {
    setContextSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <NodeEditor 
           activeContext={activeContext}
           contextSettings={contextSettings}
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