// src/components/BaseNode.tsx
import { Handle, Position, useEdges } from 'reactflow';
import type { NodeDefinition } from '../types/node-def';
import { useState } from 'react';
import { PortPreviewCanvas } from './editor/PortPreviewCanvas';

const nodeStyle = {
  backgroundColor: '#1e1e1e',
  border: '1px solid #4a4a4a',
  borderRadius: '8px',
  padding: '16px 12px 12px 12px',
  color: 'white',
  minWidth: '180px', 
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  position: 'relative' as const,
};

const TYPE_COLORS: Record<string, string> = {
  float: '#adb5bd',   
  vec2: '#63e6be',    
  vec3: '#fcc419',    
  vec4: '#b197fc',    
  string: '#ffa8a8',  
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
  const [showPreview, setShowPreview] = useState(false);

  const canBeUniform = definition.type === 'COLOR' || definition.type === 'FLOAT';

  const handleValueChange = (inputId: string, value: any) => {
    updateNodeValue(id, inputId, value);
  };

  const handleRgbChange = (inputId: string, currentRgb: any, axis: 'r'|'g'|'b', val: string) => {
    handleValueChange(inputId, { ...currentRgb, [axis]: parseFloat(val) });
  };

  const primaryOutput = definition.outputs[0];

  return (
    <div style={{ ...nodeStyle, borderColor: definition.color }}>
      
      {/* Header Icon */}
      {definition.canHavePreview && primaryOutput && (
        <button 
          className="nodrag"
          onClick={() => setShowPreview(!showPreview)}
          style={{ 
              position: 'absolute', top: '8px', right: '8px', 
              background: showPreview ? '#333' : 'transparent', border: 'none', 
              cursor: 'pointer', opacity: showPreview ? 1 : 0.4, fontSize: '14px', 
              padding: '4px', borderRadius: '4px', zIndex: 10 
          }}
        >
          👁️
        </button>
      )}

      {/* Header */}
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: definition.color, borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {definition.label}
      </div>

      {/* Uniform Section */}
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

      {/* Inputs Map */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px' }}>
        {definition.inputs.map((defInput, index) => {
          const topPos = `${((index + 1) / (definition.inputs.length + 1)) * 100}%`;
          const currentVal = inputs?.find((i: any) => i.id === defInput.id)?.value ?? defInput.default;
          const isConnected = edges.some(edge => edge.target === id && edge.targetHandle === defInput.id);
          const controlOpacity = isConnected ? 0.3 : 1.0;
          const portColor = getTypeColor(defInput.type);

          return (
            <div key={defInput.id} style={{ position: 'relative', paddingLeft: '10px' }}>
              <Handle type="target" position={Position.Left} id={defInput.id} style={{ background: portColor, top: topPos, width: '10px', height: '10px', border: 'none', left: '-6px' }} />
              
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
                  <input className="nodrag" type="range" min={defInput.control.min} max={defInput.control.max} step={defInput.control.step} value={currentVal} onChange={e => handleValueChange(defInput.id, parseFloat(e.target.value))} disabled={isConnected} style={{ width: '100%' }} />
                </div>
              )}

              {/* Number Control */}
              {defInput.control?.type === 'number' && (
                <div style={{ opacity: controlOpacity }}>
                  <input className="nodrag" type="number" step={defInput.control.step || 0.1} value={currentVal} onChange={e => handleValueChange(defInput.id, parseFloat(e.target.value) || 0)} disabled={isConnected} style={{ background: '#0a0a0a', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '11px', padding: '4px 6px', width: '100%', outline: 'none' }} />
                </div>
              )}

              {/* RGB Sliders  */}
              {defInput.control?.type === 'color-rgb' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: controlOpacity }}>
                  {['r', 'g', 'b'].map((axis) => (
                    <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: axis === 'r' ? '#ff6b6b' : axis === 'g' ? '#51cf66' : '#339af0', width: '10px', fontSize: '9px', fontWeight: 'bold' }}>{axis.toUpperCase()}</span>
                      <input 
                        className="nodrag" type="range" min="0" max="1" step="0.01" 
                        value={currentVal[axis as 'r'|'g'|'b']} 
                        onChange={e => handleRgbChange(defInput.id, currentVal, axis as 'r'|'g'|'b', e.target.value)} 
                        disabled={isConnected} style={{ flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Outputs */}
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
                    <Handle type="source" position={Position.Right} id={out.id} style={{ background: portColor, top: topPos, width: '10px', height: '10px', border: 'none', right: '-6px' }} />
                </div>
              );
            })}
          </div>
      )}

      {/* Port Preview  */}
      {showPreview && definition.canHavePreview && primaryOutput && (
        <PortPreviewCanvas 
            nodeId={id} 
            outputId={primaryOutput.id} 
            outputType={primaryOutput.type} 
        />
      )}
    </div>
  );
}