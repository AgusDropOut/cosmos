// src/App.tsx
import { useState } from 'react';
import Canvas3D from './Canvas3D';
import NodeEditor from './NodeEditor';
import type { ShaderGraph } from './types/ast';

function App() {
  // App holds the central truth of the graph. We start it empty.
  const [graph, setGraph] = useState<ShaderGraph>({ nodes: [], connections: [] });

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      
      <div style={{ flex: 1, borderRight: '2px solid #2a2a2a' }}>
        {/* Pass the setter function to the Editor */}
        <NodeEditor onGraphChange={setGraph} />
      </div>

      <div style={{ flex: 1 }}>
        {/* Pass the data to the Canvas */}
        <Canvas3D graph={graph} />
      </div>
      
    </div>
  );
}

export default App;