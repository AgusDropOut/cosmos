// src/components/BaseNode.tsx
import { Handle, Position, useEdges } from 'reactflow';
import type { NodeDefinition } from '../types/node-def';

const nodeStyle = {
  backgroundColor: '#1e1e1e',
  border: '1px solid #4a4a4a',
  borderRadius: '8px',
  padding: '12px',
  color: 'white',
  minWidth: '180px', 
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
};


const TYPE_COLORS: Record<string, string> = {
  float: '#adb5bd',   // Gray
  vec2: '#63e6be',    // Teal
  vec3: '#fcc419',    // Yellow
  vec4: '#b197fc',    // Purple
  string: '#ffa8a8',  // Pink (for dropdowns/ops)
  default: '#ffffff'
};

const getTypeColor = (type?: string) => TYPE_COLORS[type || 'default'] || TYPE_COLORS.default;

interface BaseNodeProps {
  id: string;
  data: {
    inputs: any[];
    isUniform?: boolean;      
    uniformName?: string;     
    updateNodeValue: (nodeId: string, inputId: string, value: any) => void;
    updateNodeData: (nodeId: string, newData: any) => void; 
  };
  definition: NodeDefinition;
}

export function BaseNode({ id, data, definition }: BaseNodeProps) {
  const { inputs, updateNodeValue } = data;
  const edges = useEdges();

  const canBeUniform = definition.type === 'COLOR' || definition.type === 'FLOAT';

  const handleValueChange = (inputId: string, value: any) => {
    updateNodeValue(id, inputId, value);
  };

  const handleRgbChange = (inputId: string, currentRgb: any, axis: 'r'|'g'|'b', val: string) => {
    handleValueChange(inputId, { ...currentRgb, [axis]: parseFloat(val) });
  };

  return (
    <div style={{ ...nodeStyle, borderColor: definition.color }}>
      {/* Header */}
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: definition.color, borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {definition.label}
      </div>

      {/* Expose as Parameter UI */}
              {canBeUniform && (
                  <div style={{ marginBottom: '12px', padding: '6px', background: '#111', borderRadius: '4px', border: '1px solid #333' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#ccc', cursor: 'pointer' }}>
                          <input 
                              type="checkbox" 
                              className="nodrag"
                              checked={data.isUniform || false}
                              onChange={(e) => data.updateNodeData(id, { isUniform: e.target.checked })}
                          />
                          Expose as Parameter
                      </label>
                      
                      {data.isUniform && (
                          <input 
                              type="text" 
                              className="nodrag"
                              placeholder="Param_Name"
                              value={data.uniformName || ''}
                              onChange={(e) => data.updateNodeData(id, { uniformName: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                              style={{ marginTop: '6px', width: '100%', background: '#000', color: '#4dabf7', border: '1px solid #444', padding: '4px', fontSize: '10px', borderRadius: '2px', outline: 'none' }}
                          />
                      )}
                  </div>
              )}

      {/* Dynamic Inputs & Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px' }}>
        {definition.inputs.map((defInput, index) => {
          const topPos = `${((index + 1) / (definition.inputs.length + 1)) * 100}%`;
          const currentVal = inputs?.find((i: any) => i.id === defInput.id)?.value ?? defInput.default;
          const isConnected = edges.some(edge => edge.target === id && edge.targetHandle === defInput.id);
          const controlOpacity = isConnected ? 0.3 : 1.0;
          const portColor = getTypeColor(defInput.type);

          return (
            <div key={defInput.id} style={{ position: 'relative', paddingLeft: '10px' }}>
              
              {/* THE INPUT PORT (Colored) */}
              <Handle 
                type="target" 
                position={Position.Left} 
                id={defInput.id} 
                style={{ 
                    background: portColor, 
                    top: topPos, 
                    width: '10px', 
                    height: '10px', 
                    border: 'none', 
                    left: '-6px' 
                }} 
              />
              
              

              {/* Type Indicator & Label */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#ccc', fontWeight: 'bold' }}>{defInput.control?.label || defInput.id.toUpperCase()}</span>
                  <span style={{ color: portColor, fontSize: '9px', letterSpacing: '0.5px' }}>{defInput.type}</span>
              </div>

              {/* Slider Control */}
              {defInput.control?.type === 'slider' && (
                <div style={{ opacity: controlOpacity }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '10px' }}>
                      <span>{defInput.control.min}</span>
                      <span>{currentVal.toFixed(1)}</span>
                      <span>{defInput.control.max}</span>
                  </div>
                  <input 
                    className="nodrag" type="range" min={defInput.control.min} max={defInput.control.max} step={defInput.control.step} 
                    value={currentVal} onChange={e => handleValueChange(defInput.id, parseFloat(e.target.value))} disabled={isConnected}
                    style={{ width: '100%', cursor: isConnected ? 'not-allowed' : 'pointer' }}
                  />
                </div>
              )}

              {/* RGB Sliders Control */}
              {defInput.control?.type === 'color-rgb' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', opacity: controlOpacity }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#ff6b6b', width: '10px' }}>R</span>
                    <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.r} onChange={e => handleRgbChange(defInput.id, currentVal, 'r', e.target.value)} disabled={isConnected} style={{ flex: 1 }}/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#51cf66', width: '10px' }}>G</span>
                    <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.g} onChange={e => handleRgbChange(defInput.id, currentVal, 'g', e.target.value)} disabled={isConnected} style={{ flex: 1 }}/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#339af0', width: '10px' }}>B</span>
                    <input className="nodrag" type="range" min="0" max="1" step="0.01" value={currentVal.b} onChange={e => handleRgbChange(defInput.id, currentVal, 'b', e.target.value)} disabled={isConnected} style={{ flex: 1 }}/>
                  </div>
                </div>
              )}

              {/* Number Input Control */}
              {defInput.control?.type === 'number' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: controlOpacity }}>
                  <input 
                    className="nodrag" type="number" step={defInput.control.step || 0.1} value={currentVal} 
                    onChange={e => handleValueChange(defInput.id, parseFloat(e.target.value) || 0)} disabled={isConnected}
                    style={{ background: '#0a0a0a', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '11px', padding: '4px 6px', width: '100%', outline: 'none' }}
                  />
                </div>
              )}

              {/* Select Control (Dropdown) */}
              {defInput.control?.type === 'select' && defInput.control.options && (
                <select 
                  className="nodrag" value={currentVal} onChange={e => handleValueChange(defInput.id, e.target.value)}
                  style={{ background: '#0a0a0a', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '11px', padding: '4px', width: '100%', outline: 'none' }}
                >
                  {defInput.control.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Outputs  */}
      {definition.outputs.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #333', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {definition.outputs.map((out, index) => {
              const portColor = getTypeColor(out.type);
              const topPos = `${((index + 1) / (definition.outputs.length + 1)) * 100}%`;
              
              return (
                <div key={out.id} style={{ position: 'relative', textAlign: 'right', paddingRight: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: portColor, fontSize: '9px', letterSpacing: '0.5px' }}>{out.type}</span>
                        <span style={{ color: '#ccc', fontWeight: 'bold', fontSize: '11px' }}>{out.id.toUpperCase()}</span>
                    </div>
                    {/* THE OUTPUT PORT (Colored) */}
                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id={out.id} 
                        style={{ 
                            background: portColor, 
                            top: topPos, 
                            width: '10px', 
                            height: '10px', 
                            border: 'none', 
                            right: '-6px' 
                        }} 
                    />
                </div>
              );
            })}
          </div>
      )}
    </div>
  );
}