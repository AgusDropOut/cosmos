// src/CustomNodes.tsx
import { Handle, Position, useReactFlow } from 'reactflow';


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
  const { setNodes } = useReactFlow();

  // When a slider moves, update this specific node's data in the React Flow state
  const handleColorChange = (axis: 'r' | 'g' | 'b', value: string) => {
    const num = parseFloat(value);
    setNodes((nds) => nds.map(node => {
      if (node.id === id) {
        const newInputs = [...node.data.inputs];
        newInputs[0].value = { ...newInputs[0].value, [axis]: num };
        return { ...node, data: { ...node.data, inputs: newInputs } };
      }
      return node;
    }));
  };

  const rgb = data.inputs[0].value;

  return (
    <div style={nodeStyle}>
      <div style={{ ...headerStyle, color: '#ff6b6b' }}>Color</div>
      
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
        <label>R: <input type="range" min="0" max="1" step="0.01" value={rgb.r} onChange={e => handleColorChange('r', e.target.value)} /></label>
        <label>G: <input type="range" min="0" max="1" step="0.01" value={rgb.g} onChange={e => handleColorChange('g', e.target.value)} /></label>
        <label>B: <input type="range" min="0" max="1" step="0.01" value={rgb.b} onChange={e => handleColorChange('b', e.target.value)} /></label>
      </div>
      
      
      <Handle type="source" position={Position.Right} id="out" style={{ background: '#ff6b6b' }} />
    </div>
  );
}

// --- 2. NOISE NODE ---
export function NoiseNode({ id, data }: any) {
  const { setNodes } = useReactFlow();

  const handleScaleChange = (value: string) => {
    setNodes((nds) => nds.map(node => {
      if (node.id === id) {
        const newInputs = [...node.data.inputs];
        newInputs[0].value = parseFloat(value);
        return { ...node, data: { ...node.data, inputs: newInputs } };
      }
      return node;
    }));
  };

  const scale = data.inputs[0].value;

  return (
    <div style={nodeStyle}>
      <div style={{ ...headerStyle, color: '#4dabf7' }}>Procedural Noise</div>
      <div style={{ fontSize: '11px' }}>
        <label>Scale: {scale.toFixed(1)}<br/>
          <input type="range" min="1" max="50" step="0.5" value={scale} onChange={e => handleScaleChange(e.target.value)} />
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
      
      {/* Two input ports */}
      <Handle type="target" position={Position.Left} id="a" style={{ top: '30%', background: '#fff' }} />
      <Handle type="target" position={Position.Left} id="b" style={{ top: '70%', background: '#fff' }} />
      
      {/* One output port */}
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
  const { setNodes } = useReactFlow();

  const handleSpeedChange = (value: string) => {
    setNodes((nds) => nds.map(node => {
      if (node.id === id) {
        const newInputs = [...node.data.inputs];
        newInputs[0].value = parseFloat(value);
        return { ...node, data: { ...node.data, inputs: newInputs } };
      }
      return node;
    }));
  };

  const speed = data.inputs[0].value;

  return (
    <div style={nodeStyle}>
      <div style={{ ...headerStyle, color: '#f06595' }}>Time</div>
      <div style={{ fontSize: '11px' }}>
        <label>Speed: {speed.toFixed(1)}<br/>
          <input type="range" min="0.1" max="10.0" step="0.1" value={speed} onChange={e => handleSpeedChange(e.target.value)} />
        </label>
      </div>
      <Handle type="source" position={Position.Right} id="out" style={{ background: '#f06595' }} />
    </div>
  );
}