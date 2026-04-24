// src/core/NodeDefinitions.ts
import type { NodeDefinition } from '../types/node-def';
import { MathHelper } from './utils/MathHelper';
import { GLSL_RANDOM_2D, GLSL_FBM_2D, GLSL_RIDGE_3D, GLSL_FBM_3D } from './utils/GLSLSnippets';

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
      generateCode: ({ resolveInput, varName }) => `    vec3 ${varName} = ${resolveInput('rgb')};`,
      evaluate: ({ resolveInput }) => resolveInput('rgb')
    }
  },
  
  NOISE: {
    type: 'NOISE',
    label: 'Procedural Noise',
    color: '#4dabf7',
    inputs: [
      { id: 'scale', type: 'float', default: 10.0, control: { id: 'scale', label: 'Scale', type: 'slider', min: 1, max: 50, step: 0.5 } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      globalFunctions: GLSL_RANDOM_2D,
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = random(vUv * ${resolveInput('scale')});`
    }
  },

  FBM_NOISE_2D: {
    type: 'FBM_NOISE_2D',
    label: 'FBM Noise 2D',
    color: '#4dabf7',
    inputs: [
      { id: 'uv', type: 'vec2', default: { x: 0, y: 0 } },
      { id: 'scale', type: 'float', default: 5.0, control: { id: 'scale', label: 'Scale', type: 'slider', min: 1, max: 20, step: 0.1 } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      globalFunctions: GLSL_FBM_2D,
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = fbm2D(${resolveInput('uv')} * ${resolveInput('scale')});`
    }
  },

  RIDGE_NOISE_3D: {
    type: 'RIDGE_NOISE_3D',
    label: 'Ridge Noise 3D',
    color: '#3bc9db',
    inputs: [
      { id: 'pos', type: 'vec3', default: { r: 0, g: 0, b: 0 } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      globalFunctions: GLSL_RIDGE_3D,
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = ridge3D(${resolveInput('pos')});`
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
      generateCode: ({ resolveInput, varName }) => `    vec3 ${varName} = ${resolveInput('a')} * ${resolveInput('b')};`,
      evaluate: ({ resolveInput }) => MathHelper.evaluateVectorScalar('multiply', resolveInput('a'), resolveInput('b'))
    }
  },
  
  TIME: {
    type: 'TIME',
    label: 'Time',
    color: '#f06595',
    inputs: [
      { id: 'speed', type: 'float', default: 1.0, control: { id: 'speed', label: 'Speed', type: 'slider', min: 0.1, max: 10.0, step: 0.1 } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      globalFunctions: `uniform float u_time;`,
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = u_time * ${resolveInput('speed')};`,
      generateMath: ({ resolveInput }) => {
          const speed = resolveInput('speed');
          return speed === '1.0' ? 'time' : `(time * ${speed})`;
      },
      evaluate: ({ resolveInput, time }) => time * resolveInput('speed')
    }
  },

  MATH_UNARY: {
    type: 'MATH_UNARY',
    label: 'Math Function',
    color: '#868e96',
    inputs: [
      { id: 'value', type: 'float', default: 1.0, control: { type: 'number', label: 'Val', step: 0.1 } },
      { id: 'func', type: 'string', default: 'abs', control: { id: 'func', label: 'Function', type: 'select', options: ['abs', 'exp', 'sin', 'cos', 'fract', 'floor'] } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
     generateCode: ({ resolveInput, varName, node }) => {
        const funcName = node.inputs.find(i => i.id === 'func')?.value || 'abs'; 
        return `    float ${varName} = ${funcName}(${resolveInput('value')});`;
      },
      generateMath: ({ resolveInput, node }) => {
        const funcName = node.inputs.find(i => i.id === 'func')?.value || 'abs'; 
        return `${funcName}(${resolveInput('value')})`;
      },
      evaluate: ({ resolveInput, node }) => {
        const funcName = node.inputs.find(i => i.id === 'func')?.value || 'abs'; 
        return MathHelper.evaluateUnary(funcName, resolveInput('value'));
      }
    }
  },

  MATH_BINARY: {
    type: 'MATH_BINARY',
    label: 'Math (Binary)',
    color: '#868e96',
    inputs: [
      { id: 'a', type: 'float', default: 1.0, control: { type: 'number', label: 'A', step: 0.1 } },
      { id: 'b', type: 'float', default: 1.0, control: { type: 'number', label: 'B', step: 0.1 } },
      { id: 'op', type: 'string', default: 'multiply', control: { id: 'op', label: 'Operation', type: 'select', options: ['add', 'subtract', 'multiply', 'divide', 'pow', 'max', 'min'] } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      generateCode: ({ resolveInput, varName, node }) => {
        const op = node.inputs.find(i => i.id === 'op')?.value || 'multiply';
        return MathHelper.generateBinaryGLSL(op, resolveInput('a'), resolveInput('b'), varName);
      },
      generateMath: ({ resolveInput, node }) => {
        const op = node.inputs.find(i => i.id === 'op')?.value || 'multiply';
        return MathHelper.generateBinaryMath(op, resolveInput('a'), resolveInput('b'));
      },
      evaluate: ({ resolveInput, node }) => {
        const op = node.inputs.find(i => i.id === 'op')?.value || 'multiply';
        return MathHelper.evaluateBinary(op, resolveInput('a'), resolveInput('b'));
      }
    }
  },

  VECTOR_SCALAR_MATH: {
    type: 'VECTOR_SCALAR_MATH',
    label: 'Vector & Scalar Math',
    color: '#4c6ef5',
    inputs: [
      { id: 'vec', type: 'vec3', default: { r: 1.0, g: 1.0, b: 1.0 } },
      { id: 'scalar', type: 'float', default: 1.0 },
      { id: 'op', type: 'string', default: 'multiply', control: { id: 'op', label: 'Operation', type: 'select', options: ['multiply', 'divide', 'add', 'subtract'] } }
    ],
    outputs: [{ id: 'out', type: 'vec3' }],
    strategy: {
      generateCode: ({ resolveInput, varName, node }) => {
        const opStr = node.inputs.find(i => i.id === 'op')?.value || 'multiply';
        return `    vec3 ${varName} = ${resolveInput('vec')} ${MathHelper.getOperator(opStr)} ${resolveInput('scalar')};`;
      },
      generateMath: ({ resolveInput, node }) => {
        const opStr = node.inputs.find(i => i.id === 'op')?.value || 'multiply';
        return MathHelper.operateScalar(opStr, resolveInput('vec'), resolveInput('scalar'));
      },
      evaluate: ({ resolveInput, node }) => {
        const opStr = node.inputs.find(i => i.id === 'op')?.value || 'multiply';
        return MathHelper.evaluateVectorScalar(opStr, resolveInput('vec'), resolveInput('scalar'));
      }
    }
  },

  VECTOR_MATH: {
    type: 'VECTOR_MATH',
    label: 'Vector Math',
    color: '#4c6ef5',
    inputs: [
      { id: 'a', type: 'vec3', default: { r: 0, g: 0, b: 0 } },
      { id: 'b', type: 'vec3', default: { r: 0, g: 0, b: 0 } },
      { id: 'op', type: 'string', default: 'add', control: { id: 'op', label: 'Operation', type: 'select', options: ['add', 'subtract', 'multiply', 'divide'] } }
    ],
    outputs: [{ id: 'out', type: 'vec3' }],
    strategy: {
      generateCode: ({ resolveInput, varName, node }) => {
        const opStr = node.inputs.find(i => i.id === 'op')?.value || 'add';
        return `    vec3 ${varName} = ${resolveInput('a')} ${MathHelper.getOperator(opStr)} ${resolveInput('b')};`;
      },
      generateMath: ({ resolveInput, node }) => {
        const opStr = node.inputs.find(i => i.id === 'op')?.value || 'add';
        return MathHelper.operateVector(opStr, resolveInput('a'), resolveInput('b'));
      },
      evaluate: ({ resolveInput, node }) => {
        const opStr = node.inputs.find(i => i.id === 'op')?.value || 'add';
        return MathHelper.evaluateVector(opStr, resolveInput('a'), resolveInput('b'));
      }
    }
  },

  OUTPUT_FRAG: {
    type: 'OUTPUT_FRAG',
    label: 'Fragment Output',
    color: '#51cf66',
    inputs: [
      { id: 'color', type: 'vec3', default: {r:0, g:0, b:0} },
      { id: 'alpha', type: 'float', default: 1.0, control: { id: 'alpha', label: 'Alpha', type: 'slider', min: 0, max: 1, step: 0.05 } }
    ],
    outputs: [],
    strategy: {
      generateCode: ({ resolveInput }) => `    gl_FragColor = vec4(vec3(${resolveInput('color')}), ${resolveInput('alpha')});`
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
  },

  TRAIL_ENDPOINT: {
    type: 'TRAIL_ENDPOINT',
    label: 'Trail System Output',
    color: '#e03131',
    inputs: [
      { id: 'width', type: 'float', default: 1.0, control: { id: 'width', label: 'Base Width', type: 'slider', min: 0.1, max: 5.0, step: 0.1 } },
      { id: 'orbit_offset', type: 'vec3', default: { r: 0, g: 0, b: 0 } }
    ],
    outputs: [],
    strategy: {
      generateCode: () => `// Trail System Definition Marker`
    }
  },
  BEAM_ENDPOINT: {
    type: 'BEAM_ENDPOINT',
    label: 'Beam System Output',
    color: '#cc5de8', 
    inputs: [
      { 
        id: 'radius_curve', 
        type: 'float', 
        default: 1.0, 
        control: { id: 'radius', label: 'Base Radius', type: 'slider', min: 0.1, max: 10.0, step: 0.1 } 
      },
      { id: 'offset_x', type: 'float', default: 0.0 },
      { id: 'offset_y', type: 'float', default: 0.0 },
      { id: 'offset_z', type: 'float', default: 0.0 }
    ],
    outputs: [],
    strategy: {
      generateCode: () => `// Beam System Definition Marker`,
      
    }
  },

  MATERIAL_REF: {
    type: 'MATERIAL_REF',
    label: 'Material: Pulsating Core',
    color: '#ff922b',
    inputs: [
      { id: 'intensity', type: 'float', default: 1.0 }
    ],
    outputs: [{ id: 'out_color', type: 'vec3' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `
        // --- START SUB-GRAPH: Pulsating Core ---
        float internal_time = abs(sin(u_time * 2.0));
        vec3 internal_color = vec3(1.0, 0.2, 0.0); // Orange fire
        vec3 ${varName} = internal_color * internal_time * ${resolveInput('intensity')};
        // --- END SUB-GRAPH ---
      `,
      generateMath: () => `v`
    }
  },

  UV_COORDS: {
    type: 'UV_COORDS',
    label: 'UV Coordinates',
    color: '#20c997',
    inputs: [],
    outputs: [{ id: 'uv', type: 'vec2' }],
    strategy: {
      generateCode: ({ varName }) => `    vec2 ${varName} = vUv;`,
      evaluate: ({ node, time, globals }) => ({ x: globals?.u ?? 0, y: globals?.v ?? 0 })
    }
  },

  VERTEX_COLOR: {
    type: 'VERTEX_COLOR',
    label: 'Vertex Color (Alpha Fade)',
    color: '#e64980',
    inputs: [],
    outputs: [{ id: 'color', type: 'vec4' }],
    strategy: {
      generateCode: ({ varName }) => `    vec4 ${varName} = vertexColor;`
    }
  },

  SPLIT_VEC2: {
    type: 'SPLIT_VEC2',
    label: 'Split Vec2',
    color: '#15aabf',
    inputs: [{ id: 'vec', type: 'vec2', default: {x: 0, y: 0} }],
    outputs: [
      { id: 'x', type: 'float' },
      { id: 'y', type: 'float' }
    ],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `
        vec2 ${varName}_in = ${resolveInput('vec')};
        float ${varName}_x = ${varName}_in.x;
        float ${varName}_y = ${varName}_in.y;
      `,
      evaluate: ({ resolveInput }) => {
        const v = resolveInput('vec') || { x: 0, y: 0 };
        return { x: v.x ?? 0, y: v.y ?? 0 }; 
      },
      generateMath: () => `v`
    }
  },

  PACK_VEC2: {
    type: 'PACK_VEC2',
    label: 'Pack Vec2',
    color: '#12b886',
    inputs: [
      { id: 'x', type: 'float', default: 0.0 },
      { id: 'y', type: 'float', default: 0.0 }
    ],
    outputs: [{ id: 'out', type: 'vec2' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `    vec2 ${varName} = vec2(${resolveInput('x')}, ${resolveInput('y')});`,
      evaluate: ({ resolveInput }) => ({ x: resolveInput('x'), y: resolveInput('y') })
    }
  },

  PACK_VEC3: {
    type: 'PACK_VEC3',
    label: 'Pack Vec3',
    color: '#12b886',
    inputs: [
      { id: 'x', type: 'float', default: 0.0 },
      { id: 'y', type: 'float', default: 0.0 },
      { id: 'z', type: 'float', default: 0.0 }
    ],
    outputs: [{ id: 'out', type: 'vec3' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `    vec3 ${varName} = vec3(${resolveInput('x')}, ${resolveInput('y')}, ${resolveInput('z')});`,
      generateMath: ({ resolveInput }) => `vec3(${resolveInput('x')}, ${resolveInput('y')}, ${resolveInput('z')})`,
      evaluate: ({ resolveInput }) => ({
        x: resolveInput('x'),
        y: resolveInput('y'),
        z: resolveInput('z')
      })
    }
  },

  SMOOTHSTEP: {
    type: 'SMOOTHSTEP',
    label: 'Smoothstep',
    color: '#fab005',
    inputs: [
      { id: 'edge0', type: 'float', default: 0.0 },
      { id: 'edge1', type: 'float', default: 1.0 },
      { id: 'x', type: 'float', default: 0.5 }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = smoothstep(${resolveInput('edge0')}, ${resolveInput('edge1')}, ${resolveInput('x')});`
    }
  },

  MIX_COLORS: {
    type: 'MIX_COLORS',
    label: 'Mix (Lerp)',
    color: '#be4bdb',
    inputs: [
      { id: 'a', type: 'vec3', default: { r: 0, g: 0, b: 0 } },
      { id: 'b', type: 'vec3', default: { r: 1, g: 1, b: 1 } },
      { id: 't', type: 'float', default: 0.5 }
    ],
    outputs: [{ id: 'out', type: 'vec3' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `    vec3 ${varName} = mix(${resolveInput('a')}, ${resolveInput('b')}, clamp(${resolveInput('t')}, 0.0, 1.0));`
    }
  },

  MAPPING_2D: {
    type: 'MAPPING_2D',
    label: 'UV Mapping',
    color: '#20c997',
    inputs: [
      { id: 'uv', type: 'vec2', default: { x: 0, y: 0 } },
      { id: 'scale_x', type: 'float', default: 1.0, control: { type: 'number', label: 'Scale X', step: 0.1 } },
      { id: 'scale_y', type: 'float', default: 1.0, control: { type: 'number', label: 'Scale Y', step: 0.1 } },
      { id: 'offset_x', type: 'float', default: 0.0, control: { type: 'number', label: 'Off X', step: 0.1 } },
      { id: 'offset_y', type: 'float', default: 0.0, control: { type: 'number', label: 'Off Y', step: 0.1 } }
    ],
    outputs: [{ id: 'out', type: 'vec2' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `    vec2 ${varName} = (${resolveInput('uv')} + vec2(${resolveInput('offset_x')}, ${resolveInput('offset_y')})) * vec2(${resolveInput('scale_x')}, ${resolveInput('scale_y')});`
    }
  },
  FBM_NOISE_3D: {
    type: 'FBM_NOISE_3D',
    label: 'FBM Noise 3D',
    color: '#4dabf7',
    inputs: [
      { id: 'pos', type: 'vec3', default: { r: 0, g: 0, b: 0 } },
      { id: 'octaves', type: 'float', default: 4.0, control: { type: 'number', label: 'Octaves', step: 1.0 } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      globalFunctions: GLSL_FBM_3D,
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = atomic_fbm3D(${resolveInput('pos')}, int(${resolveInput('octaves')}));`,
      generateMath: () => `0.0`,
      evaluate: ({ resolveInput }) => {
         const p = resolveInput('pos') || {x:0, y:0, z:0};
         const px = p.x ?? p.r ?? 0;
         return Math.sin(px * 10.0) * 0.5; 
      }
    }
  },

  DOT_PRODUCT: {
    type: 'DOT_PRODUCT',
    label: 'Dot Product',
    color: '#4c6ef5',
    inputs: [
      { id: 'a', type: 'vec3', default: { r: 0, g: 0, b: 0 } },
      { id: 'b', type: 'vec3', default: { r: 0, g: 0, b: 0 } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = dot(${resolveInput('a')}, ${resolveInput('b')});`,
      generateMath: () => `0.0`, 
      evaluate: ({ resolveInput }) => {
        const a = resolveInput('a') || {x:0, y:0, z:0};
        const b = resolveInput('b') || {x:0, y:0, z:0};
        const ax = a.x ?? a.r ?? 0, ay = a.y ?? a.g ?? 0, az = a.z ?? a.b ?? 0;
        const bx = b.x ?? b.r ?? 0, by = b.y ?? b.g ?? 0, bz = b.z ?? b.b ?? 0;
        return ax*bx + ay*by + az*bz;
      }
    }
  }
};