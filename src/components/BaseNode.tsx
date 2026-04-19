// src/components/BaseNode.tsx
import { Handle, Position, useEdges } from 'reactflow'; // <-- Import useEdges
import type { NodeDefinition } from '../types/node-def';

const nodeStyle = {
  backgroundColor: '#1e1e1e',
  border: '1px solid #4a4a4a',
  borderRadius: '8px',
  padding: '12px',
  color: 'white',
  minWidth: '160px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
};

interface BaseNodeProps {
  id: string;
  data: {
    inputs: any[];
    updateNodeValue: (nodeId: string, inputId: string, value: any) => void;
  };
  definition: NodeDefinition;
}

export function BaseNode({ id, data, definition }: BaseNodeProps) {
  const { inputs, updateNodeValue } = data;
  const edges = useEdges(); // <-- Grab the global edges state

  const handleValueChange = (inputId: string, value: any) => {
    updateNodeValue(id, inputId, value);
  };

  const handleRgbChange = (inputId: string, currentRgb: any, axis: 'r'|'g'|'b', val: string) => {
    handleValueChange(inputId, { ...currentRgb, [axis]: parseFloat(val) });
  };

  return (
    <div style={{ ...nodeStyle, borderColor: definition.color }}>
      {/* Header */}
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: definition.color, borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {definition.label}
      </div>

      {/* Dynamic Inputs & Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
        {definition.inputs.map((defInput, index) => {
          const topPos = `${((index + 1) / (definition.inputs.length + 1)) * 100}%`;
          const currentVal = inputs?.find((i: any) => i.id === defInput.id)?.value ?? defInput.default;

          // --- NEW: Check if this specific port has an incoming connection ---
          const isConnected = edges.some(edge => edge.target === id && edge.targetHandle === defInput.id);
          const controlOpacity = isConnected ? 0.3 : 1.0; // Dim the control if connected

          return (
            <div key={defInput.id} style={{ position: 'relative', paddingLeft: '10px' }}>
              <Handle type="target" position={Position.Left} id={defInput.id} style={{ background: '#fff', top: topPos }} />
              
              {/* Slider Control */}
              {defInput.control?.type === 'slider' && (
                <label style={{ opacity: controlOpacity }}>
                  {defInput.control.label}: {currentVal.toFixed(1)}<br/>
                  <input 
                    className="nodrag" 
                    type="range" 
                    min={defInput.control.min} 
                    max={defInput.control.max} 
                    step={defInput.control.step} 
                    value={currentVal} 
                    onChange={e => handleValueChange(defInput.id, parseFloat(e.target.value))} 
                    disabled={isConnected} // <-- Disable if connected
                  />
                </label>
              )}

              {/* RGB Sliders Control */}
              {defInput.control?.type === 'color-rgb' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', opacity: controlOpacity }}>
                  <label>R: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.r} onChange={e => handleRgbChange(defInput.id, currentVal, 'r', e.target.value)} disabled={isConnected} /></label>
                  <label>G: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.g} onChange={e => handleRgbChange(defInput.id, currentVal, 'g', e.target.value)} disabled={isConnected} /></label>
                  <label>B: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.b} onChange={e => handleRgbChange(defInput.id, currentVal, 'b', e.target.value)} disabled={isConnected} /></label>
                </div>
              )}

              {/* Number Input Control */}
              {defInput.control?.type === 'number' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', opacity: controlOpacity }}>
                  <span style={{ width: '15px' }}>{defInput.control.label}:</span>
                  <input 
                    className="nodrag" 
                    type="number" 
                    step={defInput.control.step || 0.1}
                    value={currentVal} 
                    onChange={e => handleValueChange(defInput.id, parseFloat(e.target.value) || 0)}
                    disabled={isConnected} // <-- Disable if connected
                    style={{ 
                      background: '#333', color: 'white', border: '1px solid #555', 
                      borderRadius: '4px', fontSize: '11px', padding: '2px 4px', 
                      width: '50px', outline: 'none'
                    }}
                  />
                </div>
              )}

              {/* Select Control (Dropdown) */}
              {defInput.control?.type === 'select' && defInput.control.options && (
                <label style={{ display: 'block' }}>
                  {defInput.control.label || defInput.id.toUpperCase()}: <br/>
                  <select 
                    className="nodrag" 
                    value={currentVal} 
                    onChange={e => handleValueChange(defInput.id, e.target.value)}
                    style={{ 
                      background: '#333', color: 'white', border: '1px solid #555', 
                      borderRadius: '4px', fontSize: '11px', padding: '4px', 
                      marginTop: '4px', width: '100%', outline: 'none'
                    }}
                  >
                    {defInput.control.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
              )}

              {/* Pure Math Port (No UI Control) */}
              {!defInput.control && (
                <div style={{ color: '#aaa', padding: '4px 0' }}>{defInput.id.toUpperCase()}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Outputs */}
      {definition.outputs.map((out, index) => {
        const topPos = `${((index + 1) / (definition.outputs.length + 1)) * 100}%`;
        return (
          <Handle key={out.id} type="source" position={Position.Right} id={out.id} style={{ background: definition.color, top: topPos }} />
        );
      })}
    </div>
  );
}