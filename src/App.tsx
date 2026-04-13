import { useState } from 'react';
import NodeEditor from './NodeEditor';
import Canvas3D from './Canvas3D';
import type { ShaderGraph } from './types/ast';

function App() {
  const [graph, setGraph] = useState<ShaderGraph>({ nodes: [], connections: [] });
  const [shape, setShape] = useState<string>('CUBE'); /* State routing */

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <NodeEditor onGraphChange={setGraph} onShapeChange={setShape} />
      </div>
      <div style={{ flex: 1 }}>
        <Canvas3D graph={graph} shape={shape} />
      </div>
    </div>
  );
}

export default App;