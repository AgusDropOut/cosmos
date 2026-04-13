// src/components/BaseNode.tsx
import { Handle, Position } from 'reactflow';
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
          // Calculate port positioning evenly
          const topPos = `${((index + 1) / (definition.inputs.length + 1)) * 100}%`;
          const currentVal = inputs?.find((i: any) => i.id === defInput.id)?.value ?? defInput.default;

          return (
            <div key={defInput.id} style={{ position: 'relative', paddingLeft: '10px' }}>
              <Handle type="target" position={Position.Left} id={defInput.id} style={{ background: '#fff', top: topPos }} />
              
              {/* Slider Control */}
              {defInput.control?.type === 'slider' && (
                <label>{defInput.control.label}: {currentVal.toFixed(1)}<br/>
                  <input className="nodrag" type="range" min={defInput.control.min} max={defInput.control.max} step={defInput.control.step} value={currentVal} onChange={e => handleValueChange(defInput.id, parseFloat(e.target.value))} />
                </label>
              )}

              {/* RGB Sliders Control */}
              {defInput.control?.type === 'color-rgb' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label>R: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.r} onChange={e => handleRgbChange(defInput.id, currentVal, 'r', e.target.value)} /></label>
                  <label>G: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.g} onChange={e => handleRgbChange(defInput.id, currentVal, 'g', e.target.value)} /></label>
                  <label>B: <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.b} onChange={e => handleRgbChange(defInput.id, currentVal, 'b', e.target.value)} /></label>
                </div>
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