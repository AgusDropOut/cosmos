// src/CustomNodes.tsx
import { Handle, Position } from 'reactflow';

const nodeStyle = {
  backgroundColor: '#1e1e1e',
  border: '1px solid #4a4a4a',
  borderRadius: '8px',
  padding: '12px',
  color: 'white',
  minWidth: '160px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
};

const headerStyle = {
  fontSize: '12px',
  fontWeight: 'bold',
  marginBottom: '10px',
  borderBottom: '1px solid #333',
  paddingBottom: '4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

// --- 1. COLOR NODE ---
export function ColorNode({ id, data }: any) {
  const rgb = data.inputs[0].value;
  const inputId = data.inputs[0].id; // Dynamic ID (color or rgb)

  const handleColorChange = (axis: 'r' | 'g' | 'b', value: string) => {
    const num = parseFloat(value);
    // Tell the parent to update the state permanently
    data.updateNodeValue(id, inputId, { ...rgb, [axis]: num });
  };

  return (
    <div style={nodeStyle}>
      <div style={{ ...headerStyle, color: '#ff6b6b' }}>Color</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
        {/* Added className="nodrag" to stop React Flow from dragging the node when you slide */}
        <label>R: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={rgb.r} onChange={e => handleColorChange('r', e.target.value)} /></label>
        <label>G: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={rgb.g} onChange={e => handleColorChange('g', e.target.value)} /></label>
        <label>B: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={rgb.b} onChange={e => handleColorChange('b', e.target.value)} /></label>
      </div>
      <Handle type="source" position={Position.Right} id="out" style={{ background: '#ff6b6b' }} />
    </div>
  );
}

// --- 2. NOISE NODE ---
export function NoiseNode({ id, data }: any) {
  const scale = data.inputs[0].value;
  const inputId = data.inputs[0].id;

  const handleScaleChange = (value: string) => {
    data.updateNodeValue(id, inputId, parseFloat(value));
  };

  return (
    <div style={nodeStyle}>
      <div style={{ ...headerStyle, color: '#4dabf7' }}>Procedural Noise</div>
      <div style={{ fontSize: '11px' }}>
        <label>Scale: {scale.toFixed(1)}<br/>
          <input className="nodrag" type="range" min="1" max="50" step="0.5" value={scale} onChange={e => handleScaleChange(e.target.value)} />
        </label>
      </div>
      <Handle type="target" position={Position.Left} id="scale" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} id="out" style={{ background: '#4dabf7' }} />
    </div>
  );
}

// --- 3. MULTIPLY NODE ---
export function MultiplyNode() {
  return (
    <div style={nodeStyle}>
      <div style={{ ...headerStyle, color: '#ffd43b' }}>Multiply</div>
      <div style={{ fontSize: '11px', textAlign: 'center' }}>A × B</div>
      <Handle type="target" position={Position.Left} id="a" style={{ top: '30%', background: '#fff' }} />
      <Handle type="target" position={Position.Left} id="b" style={{ top: '70%', background: '#fff' }} />
      <Handle type="source" position={Position.Right} id="out" style={{ background: '#ffd43b' }} />
    </div>
  );
}

// --- 4. OUTPUT NODE ---
export function OutputNode() {
  return (
    <div style={{ ...nodeStyle, border: '2px solid #51cf66' }}>
      <div style={{ ...headerStyle, color: '#51cf66', marginBottom: 0 }}>Fragment Output</div>
      <Handle type="target" position={Position.Left} id="color" style={{ background: '#51cf66', width: '10px', height: '10px' }} />
    </div>
  );
}

// --- 5. TIME NODE ---
export function TimeNode({ id, data }: any) {
  const speed = data.inputs[0].value;
  const inputId = data.inputs[0].id;

  const handleSpeedChange = (value: string) => {
    data.updateNodeValue(id, inputId, parseFloat(value));
  };

  return (
    <div style={nodeStyle}>
      <div style={{ ...headerStyle, color: '#f06595' }}>Time</div>
      <div style={{ fontSize: '11px' }}>
        <label>Speed: {speed.toFixed(1)}<br/>
          <input className="nodrag" type="range" min="0.1" max="10.0" step="0.1" value={speed} onChange={e => handleSpeedChange(e.target.value)} />
        </label>
      </div>
      <Handle type="source" position={Position.Right} id="out" style={{ background: '#f06595' }} />
    </div>
  );
}