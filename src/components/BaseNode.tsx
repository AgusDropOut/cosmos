// src/components/BaseNode.tsx
import { Handle, Position } from 'reactflow';
import { NodeDefinition } from '../types/ast';

const nodeStyle = {
  backgroundColor: '#1e1e1e', border: '1px solid #4a4a4a', borderRadius: '8px',
  padding: '12px', color: 'white', minWidth: '160px'
};

interface BaseNodeProps {
  id: string;
  data: any; // ReactFlow data containing inputs and the updateNodeValue function
  definition: NodeDefinition;
}

export function BaseNode({ id, data, definition }: BaseNodeProps) {
  const { inputs, updateNodeValue } = data;

  const handleSliderChange = (inputId: string, value: string) => {
    updateNodeValue(id, inputId, parseFloat(value));
  };

  return (
    <div style={nodeStyle}>
      {/* Header */}
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: definition.color, borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '10px' }}>
        {definition.label}
      </div>

      {/* Render Dynamic Inputs based on Definition */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {definition.inputs.map((defInput, index) => {
          const currentVal = inputs.find((i: any) => i.id === defInput.id)?.value ?? defInput.default;
          
          return (
            <div key={defInput.id} style={{ position: 'relative' }}>
              {/* Target Handle */}
              <Handle type="target" position={Position.Left} id={defInput.id} style={{ background: '#fff' }} />
              
              {/* Optional UI Control */}
              {defInput.control && defInput.control.type === 'slider' && (
                <div style={{ fontSize: '11px', paddingLeft: '10px' }}>
                  <label>{defInput.control.label}: {currentVal.toFixed(1)}<br/>
                    <input 
                      className="nodrag" 
                      type="range" 
                      min={defInput.control.min} max={defInput.control.max} step={defInput.control.step}
                      value={currentVal} 
                      onChange={e => handleSliderChange(defInput.id, e.target.value)} 
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Render Dynamic Outputs */}
      {definition.outputs.map(out => (
         <Handle key={out.id} type="source" position={Position.Right} id={out.id} style={{ background: definition.color }} />
      ))}
    </div>
  );
}