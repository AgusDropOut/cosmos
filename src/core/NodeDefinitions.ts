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
      generateCode: ({ resolveInput, varName }) => `    float ${varName} = u_time * ${resolveInput('speed')};`
    }
  },
  OUTPUT_FRAG: {
    type: 'OUTPUT_FRAG',
    label: 'Fragment Output',
    color: '#51cf66',
    inputs: [{ id: 'color', type: 'vec3', default: {r:0, g:0, b:0} },
    { id: 'alpha', type: 'float', default: 1.0, control: { id: 'alpha', label: 'Alpha', type: 'slider', min: 0, max: 1, step: 0.05 } }],
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
  UV_COORDS: {
    type: 'UV_COORDS',
    label: 'UV Coordinates',
    color: '#20c997',
    inputs: [],
    outputs: [{ id: 'uv', type: 'vec2' }],
    strategy: {
      // vUv is provided by your TreeCompiler wrapper
      generateCode: ({ varName }) => `    vec2 ${varName} = vUv;`
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
    float ${varName}_y = ${varName}_in.y;`
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
      generateCode: ({ resolveInput, varName }) => 
        `    vec3 ${varName} = vec3(${resolveInput('x')}, ${resolveInput('y')}, ${resolveInput('z')});`
    }
  },

  MATH_UNARY: {
    type: 'MATH_UNARY',
    label: 'Math Function',
    color: '#868e96',
    inputs: [
      { id: 'value', type: 'float', default: 1.0 },
      { id: 'func', type: 'string', default: 'abs', control: { id: 'func', label: 'Function', type: 'select', options: ['abs', 'exp', 'sin', 'cos', 'fract', 'floor'] } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
     generateCode: ({ resolveInput, varName, node }) => {
        const funcInput = node.inputs.find(i => i.id === 'func');
        const funcName = funcInput?.value || 'abs'; 
        return `    float ${varName} = ${funcName}(${resolveInput('value')});`;
      }
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
      generateCode: ({ resolveInput, varName }) => 
        `    float ${varName} = smoothstep(${resolveInput('edge0')}, ${resolveInput('edge1')}, ${resolveInput('x')});`
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
      generateCode: ({ resolveInput, varName }) => 
        `    vec3 ${varName} = mix(${resolveInput('a')}, ${resolveInput('b')}, clamp(${resolveInput('t')}, 0.0, 1.0));`
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
      globalFunctions: `
float hash12(vec2 p) {
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
               mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm2D(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * noise2D(p); p *= 2.0; a *= 0.5;
    }
    return v;
}`,
      generateCode: ({ resolveInput, varName }) => 
        `    float ${varName} = fbm2D(${resolveInput('uv')} * ${resolveInput('scale')});`
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
      globalFunctions: `
float hash(vec3 p) {
    p  = fract(p * .1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
}
float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix( hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix( hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix( hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float ridge3D(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
        float n = 1.0 - abs(noise3D(p) - 0.5) * 2.0;
        v += a * n;
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}`,
      generateCode: ({ resolveInput, varName }) => 
        `    float ${varName} = ridge3D(${resolveInput('pos')});`
    }
  },
  MATH_BINARY: {
    type: 'MATH_BINARY',
    label: 'Math (Binary)',
    color: '#868e96',
    inputs: [
      { id: 'a', type: 'float', default: 1.0 },
      { id: 'b', type: 'float', default: 1.0 },
      { id: 'op', type: 'string', default: 'multiply', control: { id: 'op', label: 'Operation', type: 'select', options: ['add', 'subtract', 'multiply', 'divide', 'pow', 'max', 'min'] } }
    ],
    outputs: [{ id: 'out', type: 'float' }],
    strategy: {
      generateCode: ({ resolveInput, varName, node }) => {
        const opInput = node.inputs.find(i => i.id === 'op');
        const op = opInput?.value || 'multiply';
        const a = resolveInput('a');
        const b = resolveInput('b');
        
        // Handle GLSL built-in functions
        if (op === 'pow') return `    float ${varName} = pow(${a}, ${b});`;
        if (op === 'max') return `    float ${varName} = max(${a}, ${b});`;
        if (op === 'min') return `    float ${varName} = min(${a}, ${b});`;
        
        // Handle standard operators
        let operator = '*';
        if (op === 'add') operator = '+';
        else if (op === 'subtract') operator = '-';
        else if (op === 'divide') operator = '/';
        
        return `    float ${varName} = ${a} ${operator} ${b};`;
      }
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
      generateCode: ({ resolveInput, varName }) => 
        `    vec2 ${varName} = vec2(${resolveInput('x')}, ${resolveInput('y')});`
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
        const opInput = node.inputs.find(i => i.id === 'op');
        const op = opInput?.value || 'multiply';
        
        let operator = '*';
        if (op === 'add') operator = '+';
        else if (op === 'subtract') operator = '-';
        else if (op === 'divide') operator = '/';
        
        return `    vec3 ${varName} = ${resolveInput('vec')} ${operator} ${resolveInput('scalar')};`;
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
        const op = node.inputs.find(i => i.id === 'op')?.value || 'add';
        let operator = '+';
        if (op === 'subtract') operator = '-';
        else if (op === 'multiply') operator = '*';
        else if (op === 'divide') operator = '/';
        return `    vec3 ${varName} = ${resolveInput('a')} ${operator} ${resolveInput('b')};`;
      }
    }
  }
};