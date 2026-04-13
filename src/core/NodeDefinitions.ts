// src/core/NodeDefinitions.ts
import type { NodeDefinition } from '../types/node-def';

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  COLOR: {
    type: 'COLOR',
    label: 'Color',
    color: '#ff6b6b',
    inputs: [
      { 
        id: 'rgb', 
        type: 'vec3', 
        default: { r: 0.8, g: 0.2, b: 0.1 },
        control: { id: 'rgb', label: 'Color', type: 'color-rgb' } 
      }
    ],
    outputs: [{ id: 'out', type: 'vec3' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `    vec3 ${varName} = ${resolveInput('rgb')};`
    }
  },
  NOISE: {
    type: 'NOISE',
    label: 'Procedural Noise',
    color: '#4dabf7',
    inputs: [
      { 
        id: 'scale', 
        type: 'float', 
        default: 10.0,
        control: { id: 'scale', label: 'Scale', type: 'slider', min: 1, max: 50, step: 0.5 }
      }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      globalFunctions: `float random(vec2 st) {\n    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);\n}`,
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = random(vUv * ${resolveInput('scale')});`
    }
  },
  MULTIPLY: {
    type: 'MULTIPLY',
    label: 'Multiply',
    color: '#ffd43b',
    inputs: [
      { id: 'a', type: 'vec3', default: {r:1, g:1, b:1} },
      { id: 'b', type: 'float', default: 1.0 }
    ],
    outputs: [{ id: 'out', type: 'vec3' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `    vec3 ${varName} = ${resolveInput('a')} * ${resolveInput('b')};`
    }
  },
  TIME: {
    type: 'TIME',
    label: 'Time',
    color: '#f06595',
    inputs: [
      { 
        id: 'speed', 
        type: 'float', 
        default: 1.0,
        control: { id: 'speed', label: 'Speed', type: 'slider', min: 0.1, max: 10.0, step: 0.1 }
      }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      globalFunctions: `uniform float u_time;`,
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = abs(sin(u_time * ${resolveInput('speed')}));`
    }
  },
  OUTPUT_FRAG: {
    type: 'OUTPUT_FRAG',
    label: 'Fragment Output',
    color: '#51cf66',
    inputs: [{ id: 'color', type: 'vec3', default: {r:0, g:0, b:0} }],
    outputs: [],
    strategy: {
      generateCode: ({ resolveInput }) => `    gl_FragColor = vec4(vec3(${resolveInput('color')}), 1.0);`
    }
  },
  OUTPUT_VERT: {
    type: 'OUTPUT_VERT',
    label: 'Vertex Displacement (Shape)',
    color: '#ae3bff',
    inputs: [
      { id: 'position_offset', type: 'vec3', default: {r:0, g:0, b:0} },
      { id: 'scale', type: 'float', default: 1.0 }
    ],
    outputs: [],
    strategy: {
      
      generateCode: ({ resolveInput }) => `
        vec3 displacedPosition = position * ${resolveInput('scale')} + ${resolveInput('position_offset')};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
      `
    }
  }
};