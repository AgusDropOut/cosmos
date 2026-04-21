// src/core/presets/PresetRegistry.ts
import type { IPreset } from '../../types/preset';



export const BUILT_IN_PRESETS: IPreset[] = [
   {
        id: 'preset-pulsing-corkscrew',
        name: 'Pulsing Corkscrew',
        description: 'A spiraling trail that pulsates its thickness. A perfect stress-test for the new Java math parser (sin, cos, abs, max).',
        contextId: 'TRAIL',
        settings: { segments: 30 },
        nodes: [
          // --- WIDTH PULSATION LOGIC ---
          { id: "t1", type: "TIME", position: { x: 0, y: 0 }, data: { astType: "TIME", inputs: [{ id: "speed", type: "float", value: 5.0 }], outputs: [{ id: "out", type: "float" }] } },
          { id: "sin_w", type: "MATH_UNARY", position: { x: 200, y: 0 }, data: { astType: "MATH_UNARY", inputs: [{ id: "value", type: "float" }, { id: "func", type: "string", value: "sin" }], outputs: [{ id: "out", type: "float" }] } },
          { id: "abs_w", type: "MATH_UNARY", position: { x: 400, "y": 0 }, data: { astType: "MATH_UNARY", inputs: [{ id: "value", type: "float" }, { id: "func", type: "string", value: "abs" }], outputs: [{ id: "out", type: "float" }] } },
          { id: "max_w", type: "MATH_BINARY", position: { x: 600, "y": 0 }, data: { astType: "MATH_BINARY", inputs: [{ id: "a", type: "float" }, { id: "b", type: "float", value: 0.2 }, { id: "op", type: "string", value: "max" }], outputs: [{ id: "out", type: "float" }] } },
          
          // --- CORKSCREW ORBIT LOGIC ---
          { id: "t2", type: "TIME", position: { x: 0, y: 240 }, data: { astType: "TIME", inputs: [{ id: "speed", type: "float", value: 10.0 }], outputs: [{ id: "out", type: "float" }] } },
          { id: "sin_o", type: "MATH_UNARY", position: { x: 200, y: 160 }, data: { astType: "MATH_UNARY", inputs: [{ id: "value", type: "float" }, { id: "func", type: "string", value: "sin" }], outputs: [{ id: "out", type: "float" }] } },
          { id: "cos_o", type: "MATH_UNARY", position: { x: 200, y: 320 }, data: { astType: "MATH_UNARY", inputs: [{ id: "value", type: "float" }, { id: "func", type: "string", value: "cos" }], outputs: [{ id: "out", type: "float" }] } },
          { id: "pack", type: "PACK_VEC3", position: { x: 400, y: 240 }, data: { astType: "PACK_VEC3", inputs: [{ id: "x", type: "float" }, { id: "y", type: "float" }, { id: "z", type: "float", value: 0.0 }], outputs: [{ id: "out", type: "vec3" }] } },
          { id: "scale", type: "VECTOR_SCALAR_MATH", position: { x: 600, y: 240 }, data: { astType: "VECTOR_SCALAR_MATH", inputs: [{ id: "vec", type: "vec3" }, { id: "scalar", "type": "float", value: 1.5 }, { id: "op", "type": "string", value: "multiply" }], outputs: [{ id: "out", type: "vec3" }] } },
          
          // --- TRAIL OUTPUT ---
          { id: "out", type: "TRAIL_ENDPOINT", position: { x: 900, y: 120 }, data: { astType: "TRAIL_ENDPOINT", inputs: [{ id: "width", type: "float" }, { id: "orbit_offset", "type": "vec3" }], outputs: [] } }
        ],
        edges: [
          // Width wires
          { id: "e1", source: "t1", sourceHandle: "out", target: "sin_w", targetHandle: "value" },
          { id: "e2", source: "sin_w", sourceHandle: "out", target: "abs_w", targetHandle: "value" },
          { id: "e3", source: "abs_w", sourceHandle: "out", target: "max_w", targetHandle: "a" },
          { id: "e4", source: "max_w", sourceHandle: "out", target: "out", targetHandle: "width" },
          
          // Orbit wires
          { id: "e5", source: "t2", sourceHandle: "out", target: "sin_o", targetHandle: "value" },
          { id: "e6", source: "t2", sourceHandle: "out", target: "cos_o", targetHandle: "value" },
          { id: "e7", source: "sin_o", sourceHandle: "out", target: "pack", targetHandle: "x" },
          { id: "e8", "source": "cos_o", sourceHandle: "out", target: "pack", targetHandle: "y" },
          { id: "e9", source: "pack", sourceHandle: "out", target: "scale", targetHandle: "vec" },
          { id: "e10", source: "scale", sourceHandle: "out", target: "out", targetHandle: "orbit_offset" }
        ]
    },
    {
      id: 'preset-fire-material',
      name: 'Bloody Hell Fire',
      description: 'The 1:1 Bloody Hell fire shader, pre-mapped for the Material context (2D Quad).',
      contextId: 'MATERIAL',
      settings: {
        shape: '2D_QUAD'
      },
      nodes: [
        {
          id: 'uv',
          type: 'UV_COORDS',
          position: { x: -385.2, y: 13.9 },
          data: { astType: 'UV_COORDS', inputs: [], outputs: [{ id: 'uv', type: 'vec2' }] }
        },
        {
          id: 'split',
          type: 'SPLIT_VEC2',
          position: { x: 108.9, y: -5.8 },
          data: { astType: 'SPLIT_VEC2', inputs: [{ id: 'vec', type: 'vec2' }], outputs: [{ id: 'x', type: 'float' }, { id: 'y', type: 'float' }] }
        },
        {
          id: 'time',
          type: 'TIME',
          position: { x: 0, y: 200 },
          data: { astType: 'TIME', inputs: [{ id: 'speed', type: 'float', value: 1 }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'uv_y_25',
          type: 'MATH_BINARY',
          position: { x: 402.3, y: -480.3 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 2.5 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 't_5',
          type: 'MATH_BINARY',
          position: { x: 400, y: -300 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 0 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'sub_1',
          type: 'MATH_BINARY',
          position: { x: 618.8, y: -366.1 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'add' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'sin_1',
          type: 'MATH_UNARY',
          position: { x: 800, y: -350 },
          data: { astType: 'MATH_UNARY', inputs: [{ id: 'value', type: 'float' }, { id: 'func', type: 'string', value: 'sin' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'mac1',
          type: 'MATH_BINARY',
          position: { x: 1000, y: -350 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 0.15 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'uv_y_15',
          type: 'MATH_BINARY',
          position: { x: 432.7, y: -152.5 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 1.5 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 't_3',
          type: 'MATH_BINARY',
          position: { x: 400, y: 0 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 3 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'add_1',
          type: 'MATH_BINARY',
          position: { x: 600, y: -50 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'subtract' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'cos_1',
          type: 'MATH_UNARY',
          position: { x: 800, y: -50 },
          data: { astType: 'MATH_UNARY', inputs: [{ id: 'value', type: 'float' }, { id: 'func', type: 'string', value: 'cos' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'mac2',
          type: 'MATH_BINARY',
          position: { x: 1004.7, y: -105.1 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 0.1 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'macro',
          type: 'MATH_BINARY',
          position: { x: 1200, y: -200 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'add' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'uv_y_5',
          type: 'MATH_BINARY',
          position: { x: 453.2, y: 172.5 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 5 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 't_15',
          type: 'MATH_BINARY',
          position: { x: 368.1, y: 363.6 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 15 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'pack_1',
          type: 'PACK_VEC2',
          position: { x: 614.4, y: 470.8 },
          data: { astType: 'PACK_VEC2', inputs: [{ id: 'x', type: 'float' }, { id: 'y', type: 'float' }], outputs: [{ id: 'out', type: 'vec2' }] }
        },
        {
          id: 'fbm_1',
          type: 'FBM_NOISE_2D',
          position: { x: 826, y: 483.4 },
          data: { astType: 'FBM_NOISE_2D', inputs: [{ id: 'uv', type: 'vec2' }, { id: 'scale', type: 'float', value: 1 }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'sub_2',
          type: 'MATH_BINARY',
          position: { x: 1040.5, y: 551.8 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 0.5 }, { id: 'op', type: 'string', value: 'subtract' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'micro',
          type: 'MATH_BINARY',
          position: { x: 1168.1, y: 121.7 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 0.2 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'lx_1',
          type: 'MATH_BINARY',
          position: { x: 1447.2, y: -287.5 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'add' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'local_x',
          type: 'MATH_BINARY',
          position: { x: 1600, y: 0 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'add' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'local_dist',
          type: 'MATH_UNARY',
          position: { x: 1805.3, y: -140.3 },
          data: { astType: 'MATH_UNARY', inputs: [{ id: 'value', type: 'float' }, { id: 'func', type: 'string', value: 'abs' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'bc_1',
          type: 'MATH_BINARY',
          position: { x: 2000, y: -100 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: -22 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'beam_core',
          type: 'MATH_UNARY',
          position: { x: 2200, y: -100 },
          data: { astType: 'MATH_UNARY', inputs: [{ id: 'value', type: 'float' }, { id: 'func', type: 'string', value: 'exp' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'np_x',
          type: 'MATH_BINARY',
          position: { x: 1800, y: 100 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 7 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'np_y',
          type: 'MATH_BINARY',
          position: { x: 1545.3, y: 206.7 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'subtract' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'np_z',
          type: 'MATH_BINARY',
          position: { x: 1571.4, y: 424.4 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 1.5 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'pack_2',
          type: 'PACK_VEC3',
          position: { x: 2000, y: 200 },
          data: { astType: 'PACK_VEC3', inputs: [{ id: 'x', type: 'float' }, { id: 'y', type: 'float' }, { id: 'z', type: 'float' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'ridge',
          type: 'RIDGE_NOISE_3D',
          position: { x: 2200, y: 200 },
          data: { astType: 'RIDGE_NOISE_3D', inputs: [{ id: 'pos', type: 'vec3' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'ridge_pow',
          type: 'MATH_BINARY',
          position: { x: 2400, y: 200 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 2.5 }, { id: 'op', type: 'string', value: 'pow' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'int_1',
          type: 'MATH_BINARY',
          position: { x: 2583.5, y: -1.4 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'int_2',
          type: 'MATH_BINARY',
          position: { x: 2800, y: 0 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 4.5 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'en_x',
          type: 'MATH_BINARY',
          position: { x: 1800, y: 400 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 3 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 't_8',
          type: 'MATH_BINARY',
          position: { x: 1800, y: 500 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 8 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'en_y',
          type: 'MATH_BINARY',
          position: { x: 2000, y: 450 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'subtract' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'pack_3',
          type: 'PACK_VEC2',
          position: { x: 2200, y: 425 },
          data: { astType: 'PACK_VEC2', inputs: [{ id: 'x', type: 'float' }, { id: 'y', type: 'float' }], outputs: [{ id: 'out', type: 'vec2' }] }
        },
        {
          id: 'fbm_2',
          type: 'FBM_NOISE_2D',
          position: { x: 2400, y: 425 },
          data: { astType: 'FBM_NOISE_2D', inputs: [{ id: 'uv', type: 'vec2' }, { id: 'scale', type: 'float', value: 1 }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'erosion',
          type: 'SMOOTHSTEP',
          position: { x: 2600, y: 425 },
          data: { astType: 'SMOOTHSTEP', inputs: [{ id: 'edge0', type: 'float', value: 0.35 }, { id: 'edge1', type: 'float', value: 0.8 }, { id: 'x', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'ero_25',
          type: 'MATH_BINARY',
          position: { x: 2800, y: 200 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 2.5 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'int_3',
          type: 'MATH_BINARY',
          position: { x: 3000, y: 100 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'subtract' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'int_4',
          type: 'MATH_BINARY',
          position: { x: 3197, y: 80.5 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 0 }, { id: 'op', type: 'string', value: 'max' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'vy_abs',
          type: 'MATH_UNARY',
          position: { x: 1000, y: -800 },
          data: { astType: 'MATH_UNARY', inputs: [{ id: 'value', type: 'float' }, { id: 'func', type: 'string', value: 'abs' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'v_fade',
          type: 'SMOOTHSTEP',
          position: { x: 1200, y: -800 },
          data: { astType: 'SMOOTHSTEP', inputs: [{ id: 'edge0', type: 'float', value: 1 }, { id: 'edge1', type: 'float', value: 0.6 }, { id: 'x', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'int_fin',
          type: 'MATH_BINARY',
          position: { x: 3400, y: 0 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'c_blk',
          type: 'COLOR',
          position: { x: 3400, y: -500 },
          data: { astType: 'COLOR', inputs: [{ id: 'rgb', type: 'vec3', value: { r: 1, g: 0, b: 0 } }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'c_red',
          type: 'COLOR',
          position: { x: 3400, y: -400 },
          data: { astType: 'COLOR', inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0.6, g: 0, b: 0 } }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'c_org',
          type: 'COLOR',
          position: { x: 3400, y: -300 },
          data: { astType: 'COLOR', inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0.09, g: 0.33, b: 0 } }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'c_yel',
          type: 'COLOR',
          position: { x: 3400, y: -200 },
          data: { astType: 'COLOR', inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0.12, g: 0.8, b: 0 } }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'c_wht',
          type: 'COLOR',
          position: { x: 3400, y: -100 },
          data: { astType: 'COLOR', inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0, g: 1, b: 0.9 } }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 't1',
          type: 'SMOOTHSTEP',
          position: { x: 3600, y: -600 },
          data: { astType: 'SMOOTHSTEP', inputs: [{ id: 'edge0', type: 'float', value: 0 }, { id: 'edge1', type: 'float', value: 0.1 }, { id: 'x', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'm1',
          type: 'MIX_COLORS',
          position: { x: 3800, y: -500 },
          data: { astType: 'MIX_COLORS', inputs: [{ id: 'a', type: 'vec3' }, { id: 'b', type: 'vec3' }, { id: 't', type: 'float' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 't2',
          type: 'SMOOTHSTEP',
          position: { x: 3600, y: -400 },
          data: { astType: 'SMOOTHSTEP', inputs: [{ id: 'edge0', type: 'float', value: 0.1 }, { id: 'edge1', type: 'float', value: 0.3 }, { id: 'x', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'm2',
          type: 'MIX_COLORS',
          position: { x: 4000, y: -400 },
          data: { astType: 'MIX_COLORS', inputs: [{ id: 'a', type: 'vec3' }, { id: 'b', type: 'vec3' }, { id: 't', type: 'float' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 't3',
          type: 'SMOOTHSTEP',
          position: { x: 3600, y: -200 },
          data: { astType: 'SMOOTHSTEP', inputs: [{ id: 'edge0', type: 'float', value: 0.3 }, { id: 'edge1', type: 'float', value: 0.7 }, { id: 'x', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'm3',
          type: 'MIX_COLORS',
          position: { x: 4200, y: -300 },
          data: { astType: 'MIX_COLORS', inputs: [{ id: 'a', type: 'vec3' }, { id: 'b', type: 'vec3' }, { id: 't', type: 'float' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 't4',
          type: 'SMOOTHSTEP',
          position: { x: 3600, y: 0 },
          data: { astType: 'SMOOTHSTEP', inputs: [{ id: 'edge0', type: 'float', value: 0.7 }, { id: 'edge1', type: 'float', value: 1 }, { id: 'x', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'm4',
          type: 'MIX_COLORS',
          position: { x: 4400, y: -200 },
          data: { astType: 'MIX_COLORS', inputs: [{ id: 'a', type: 'vec3' }, { id: 'b', type: 'vec3' }, { id: 't', type: 'float' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'bm_1',
          type: 'MATH_BINARY',
          position: { x: 2000, y: -300 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: -6 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'bm_2',
          type: 'MATH_UNARY',
          position: { x: 2200, y: -300 },
          data: { astType: 'MATH_UNARY', inputs: [{ id: 'value', type: 'float' }, { id: 'func', type: 'string', value: 'exp' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'bm_3',
          type: 'MATH_BINARY',
          position: { x: 2800, y: 400 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 0.5 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'bm_4',
          type: 'MATH_BINARY',
          position: { x: 3000, y: 400 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float', value: 1 }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'subtract' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'bm_5',
          type: 'MATH_BINARY',
          position: { x: 2600, y: -300 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'bm_fin',
          type: 'MATH_BINARY',
          position: { x: 3200, y: 400 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'al_1',
          type: 'SMOOTHSTEP',
          position: { x: 3800, y: 200 },
          data: { astType: 'SMOOTHSTEP', inputs: [{ id: 'edge0', type: 'float', value: 0.01 }, { id: 'edge1', type: 'float', value: 0.15 }, { id: 'x', type: 'float' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'al_2',
          type: 'MATH_BINARY',
          position: { x: 3800, y: 400 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 0.4 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'al_3',
          type: 'MATH_BINARY',
          position: { x: 4000, y: 300 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float' }, { id: 'op', type: 'string', value: 'add' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'al_fin',
          type: 'MATH_BINARY',
          position: { x: 4200, y: 300 },
          data: { astType: 'MATH_BINARY', inputs: [{ id: 'a', type: 'float' }, { id: 'b', type: 'float', value: 1 }, { id: 'op', type: 'string', value: 'min' }], outputs: [{ id: 'out', type: 'float' }] }
        },
        {
          id: 'fe_1',
          type: 'VECTOR_SCALAR_MATH',
          position: { x: 4600, y: -200 },
          data: { astType: 'VECTOR_SCALAR_MATH', inputs: [{ id: 'vec', type: 'vec3' }, { id: 'scalar', type: 'float', value: 3.5 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'bc_col_1',
          type: 'VECTOR_SCALAR_MATH',
          position: { x: 4600, y: 0 },
          data: { astType: 'VECTOR_SCALAR_MATH', inputs: [{ id: 'vec', type: 'vec3' }, { id: 'scalar', type: 'float' }, { id: 'op', type: 'string', value: 'add' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'bc_col_2',
          type: 'VECTOR_SCALAR_MATH',
          position: { x: 4800, y: 0 },
          data: { astType: 'VECTOR_SCALAR_MATH', inputs: [{ id: 'vec', type: 'vec3' }, { id: 'scalar', type: 'float', value: 0.7 }, { id: 'op', type: 'string', value: 'multiply' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'fe_fin',
          type: 'VECTOR_MATH',
          position: { x: 5073.2, y: -172.1 },
          data: { astType: 'VECTOR_MATH', inputs: [{ id: 'a', type: 'vec3' }, { id: 'b', type: 'vec3' }, { id: 'op', type: 'string', value: 'add' }], outputs: [{ id: 'out', type: 'vec3' }] }
        },
        {
          id: 'out',
          type: 'OUTPUT_FRAG',
          position: { x: 5200, y: 100 },
          data: { astType: 'OUTPUT_FRAG', inputs: [{ id: 'color', type: 'vec3' }, { id: 'alpha', type: 'float' }], outputs: [] }
        },
        {
          id: 'mapping_2d-1776636386216',
          type: 'MAPPING_2D',
          position: { x: -132.6, y: -88.8 },
          data: { astType: 'MAPPING_2D', inputs: [{ id: 'uv', type: 'vec2', value: { x: 0, y: 0 } }, { id: 'scale_x', type: 'float', value: 2 }, { id: 'scale_y', type: 'float', value: 3 }, { id: 'offset_x', type: 'float', value: 0 }, { id: 'offset_y', type: 'float', value: -0.5 }], outputs: [{ id: 'out', type: 'vec2' }] }
        },
        {
          id: 'output_vert-1776639258472',
          type: 'OUTPUT_VERT',
          position: { x: 5159.8, y: 299.6 },
          data: { astType: 'OUTPUT_VERT', inputs: [{ id: 'position_offset', type: 'vec3', value: { r: 0, g: 0, b: 0 } }, { id: 'scale', type: 'float', value: 1 }], outputs: [] }
        }
      ],
      edges: [
        { id: 'e_3', source: 'split', sourceHandle: 'y', target: 'uv_y_25', targetHandle: 'a' },
        { id: 'e_4', source: 'time', sourceHandle: 'out', target: 't_5', targetHandle: 'a' },
        { id: 'e_5', source: 'uv_y_25', sourceHandle: 'out', target: 'sub_1', targetHandle: 'a' },
        { id: 'e_6', source: 't_5', sourceHandle: 'out', target: 'sub_1', targetHandle: 'b' },
        { id: 'e_7', source: 'sub_1', sourceHandle: 'out', target: 'sin_1', targetHandle: 'value' },
        { id: 'e_8', source: 'sin_1', sourceHandle: 'out', target: 'mac1', targetHandle: 'a' },
        { id: 'e_9', source: 'split', sourceHandle: 'y', target: 'uv_y_15', targetHandle: 'a' },
        { id: 'e_10', source: 'time', sourceHandle: 'out', target: 't_3', targetHandle: 'a' },
        { id: 'e_11', source: 'uv_y_15', sourceHandle: 'out', target: 'add_1', targetHandle: 'a' },
        { id: 'e_12', source: 't_3', sourceHandle: 'out', target: 'add_1', targetHandle: 'b' },
        { id: 'e_13', source: 'add_1', sourceHandle: 'out', target: 'cos_1', targetHandle: 'value' },
        { id: 'e_14', source: 'cos_1', sourceHandle: 'out', target: 'mac2', targetHandle: 'a' },
        { id: 'e_15', source: 'mac1', sourceHandle: 'out', target: 'macro', targetHandle: 'a' },
        { id: 'e_16', source: 'mac2', sourceHandle: 'out', target: 'macro', targetHandle: 'b' },
        { id: 'e_17', source: 'split', sourceHandle: 'y', target: 'uv_y_5', targetHandle: 'a' },
        { id: 'e_18', source: 'time', sourceHandle: 'out', target: 't_15', targetHandle: 'a' },
        { id: 'e_19', source: 'uv_y_5', sourceHandle: 'out', target: 'pack_1', targetHandle: 'x' },
        { id: 'e_20', source: 't_15', sourceHandle: 'out', target: 'pack_1', targetHandle: 'y' },
        { id: 'e_21', source: 'pack_1', sourceHandle: 'out', target: 'fbm_1', targetHandle: 'uv' },
        { id: 'e_22', source: 'fbm_1', sourceHandle: 'out', target: 'sub_2', targetHandle: 'a' },
        { id: 'e_23', source: 'sub_2', sourceHandle: 'out', target: 'micro', targetHandle: 'a' },
        { id: 'e_25', source: 'macro', sourceHandle: 'out', target: 'lx_1', targetHandle: 'b' },
        { id: 'e_26', source: 'lx_1', sourceHandle: 'out', target: 'local_x', targetHandle: 'a' },
        { id: 'e_27', source: 'micro', sourceHandle: 'out', target: 'local_x', targetHandle: 'b' },
        { id: 'e_28', source: 'local_x', sourceHandle: 'out', target: 'local_dist', targetHandle: 'value' },
        { id: 'e_29', source: 'local_dist', sourceHandle: 'out', target: 'bc_1', targetHandle: 'a' },
        { id: 'e_30', source: 'bc_1', sourceHandle: 'out', target: 'beam_core', targetHandle: 'value' },
        { id: 'e_31', source: 'local_x', sourceHandle: 'out', target: 'np_x', targetHandle: 'a' },
        { id: 'e_32', source: 'uv_y_15', sourceHandle: 'out', target: 'np_y', targetHandle: 'a' },
        { id: 'e_33', source: 't_15', sourceHandle: 'out', target: 'np_y', targetHandle: 'b' },
        { id: 'e_34', source: 'time', sourceHandle: 'out', target: 'np_z', targetHandle: 'a' },
        { id: 'e_35', source: 'np_x', sourceHandle: 'out', target: 'pack_2', targetHandle: 'x' },
        { id: 'e_36', source: 'np_y', sourceHandle: 'out', target: 'pack_2', targetHandle: 'y' },
        { id: 'e_37', source: 'np_z', sourceHandle: 'out', target: 'pack_2', targetHandle: 'z' },
        { id: 'e_38', source: 'pack_2', sourceHandle: 'out', target: 'ridge', targetHandle: 'pos' },
        { id: 'e_39', source: 'ridge', sourceHandle: 'out', target: 'ridge_pow', targetHandle: 'a' },
        { id: 'e_40', source: 'beam_core', sourceHandle: 'out', target: 'int_1', targetHandle: 'a' },
        { id: 'e_41', source: 'ridge_pow', sourceHandle: 'out', target: 'int_1', targetHandle: 'b' },
        { id: 'e_42', source: 'int_1', sourceHandle: 'out', target: 'int_2', targetHandle: 'a' },
        { id: 'e_43', source: 'local_x', sourceHandle: 'out', target: 'en_x', targetHandle: 'a' },
        { id: 'e_44', source: 'time', sourceHandle: 'out', target: 't_8', targetHandle: 'a' },
        { id: 'e_45', source: 'uv_y_15', sourceHandle: 'out', target: 'en_y', targetHandle: 'a' },
        { id: 'e_46', source: 't_8', sourceHandle: 'out', target: 'en_y', targetHandle: 'b' },
        { id: 'e_47', source: 'en_x', sourceHandle: 'out', target: 'pack_3', targetHandle: 'x' },
        { id: 'e_48', source: 'en_y', sourceHandle: 'out', target: 'pack_3', targetHandle: 'y' },
        { id: 'e_49', source: 'pack_3', sourceHandle: 'out', target: 'fbm_2', targetHandle: 'uv' },
        { id: 'e_50', source: 'fbm_2', sourceHandle: 'out', target: 'erosion', targetHandle: 'x' },
        { id: 'e_51', source: 'erosion', sourceHandle: 'out', target: 'ero_25', targetHandle: 'a' },
        { id: 'e_52', source: 'int_2', sourceHandle: 'out', target: 'int_3', targetHandle: 'a' },
        { id: 'e_53', source: 'ero_25', sourceHandle: 'out', target: 'int_3', targetHandle: 'b' },
        { id: 'e_54', source: 'int_3', sourceHandle: 'out', target: 'int_4', targetHandle: 'a' },
        { id: 'e_55', source: 'split', sourceHandle: 'y', target: 'vy_abs', targetHandle: 'value' },
        { id: 'e_56', source: 'vy_abs', sourceHandle: 'out', target: 'v_fade', targetHandle: 'x' },
        { id: 'e_57', source: 'int_4', sourceHandle: 'out', target: 'int_fin', targetHandle: 'a' },
        { id: 'e_58', source: 'v_fade', sourceHandle: 'out', target: 'int_fin', targetHandle: 'b' },
        { id: 'e_59', source: 'int_fin', sourceHandle: 'out', target: 't1', targetHandle: 'x' },
        { id: 'e_60', source: 'int_fin', sourceHandle: 'out', target: 't2', targetHandle: 'x' },
        { id: 'e_61', source: 'int_fin', sourceHandle: 'out', target: 't3', targetHandle: 'x' },
        { id: 'e_62', source: 'int_fin', sourceHandle: 'out', target: 't4', targetHandle: 'x' },
        { id: 'e_63', source: 'c_blk', sourceHandle: 'out', target: 'm1', targetHandle: 'a' },
        { id: 'e_64', source: 'c_red', sourceHandle: 'out', target: 'm1', targetHandle: 'b' },
        { id: 'e_65', source: 't1', sourceHandle: 'out', target: 'm1', targetHandle: 't' },
        { id: 'e_66', source: 'm1', sourceHandle: 'out', target: 'm2', targetHandle: 'a' },
        { id: 'e_67', source: 'c_org', sourceHandle: 'out', target: 'm2', targetHandle: 'b' },
        { id: 'e_68', source: 't2', sourceHandle: 'out', target: 'm2', targetHandle: 't' },
        { id: 'e_69', source: 'm2', sourceHandle: 'out', target: 'm3', targetHandle: 'a' },
        { id: 'e_70', source: 'c_yel', sourceHandle: 'out', target: 'm3', targetHandle: 'b' },
        { id: 'e_71', source: 't3', sourceHandle: 'out', target: 'm3', targetHandle: 't' },
        { id: 'e_72', source: 'm3', sourceHandle: 'out', target: 'm4', targetHandle: 'a' },
        { id: 'e_73', source: 'c_wht', sourceHandle: 'out', target: 'm4', targetHandle: 'b' },
        { id: 'e_74', source: 't4', sourceHandle: 'out', target: 'm4', targetHandle: 't' },
        { id: 'e_75', source: 'local_dist', sourceHandle: 'out', target: 'bm_1', targetHandle: 'a' },
        { id: 'e_76', source: 'bm_1', sourceHandle: 'out', target: 'bm_2', targetHandle: 'value' },
        { id: 'e_77', source: 'erosion', sourceHandle: 'out', target: 'bm_3', targetHandle: 'a' },
        { id: 'e_78', source: 'bm_3', sourceHandle: 'out', target: 'bm_4', targetHandle: 'b' },
        { id: 'e_79', source: 'bm_2', sourceHandle: 'out', target: 'bm_5', targetHandle: 'a' },
        { id: 'e_80', source: 'v_fade', sourceHandle: 'out', target: 'bm_5', targetHandle: 'b' },
        { id: 'e_81', source: 'bm_5', sourceHandle: 'out', target: 'bm_fin', targetHandle: 'a' },
        { id: 'e_82', source: 'bm_4', sourceHandle: 'out', target: 'bm_fin', targetHandle: 'b' },
        { id: 'e_83', source: 'int_fin', sourceHandle: 'out', target: 'al_1', targetHandle: 'x' },
        { id: 'e_84', source: 'bm_fin', sourceHandle: 'out', target: 'al_2', targetHandle: 'a' },
        { id: 'e_85', source: 'al_1', sourceHandle: 'out', target: 'al_3', targetHandle: 'a' },
        { id: 'e_86', source: 'al_2', sourceHandle: 'out', target: 'al_3', targetHandle: 'b' },
        { id: 'e_87', source: 'al_3', sourceHandle: 'out', target: 'al_fin', targetHandle: 'a' },
        { id: 'e_88', source: 'm4', sourceHandle: 'out', target: 'fe_1', targetHandle: 'vec' },
        { id: 'e_89', source: 'c_org', sourceHandle: 'out', target: 'bc_col_1', targetHandle: 'vec' },
        { id: 'e_90', source: 'bm_fin', sourceHandle: 'out', target: 'bc_col_1', targetHandle: 'scalar' },
        { id: 'e_91', source: 'bc_col_1', sourceHandle: 'out', target: 'bc_col_2', targetHandle: 'vec' },
        { id: 'e_92', source: 'fe_1', sourceHandle: 'out', target: 'fe_fin', targetHandle: 'a' },
        { id: 'e_93', source: 'bc_col_2', sourceHandle: 'out', target: 'fe_fin', targetHandle: 'b' },
        { id: 'e_94', source: 'fe_fin', sourceHandle: 'out', target: 'out', targetHandle: 'color' },
        { id: 'e_95', source: 'al_fin', sourceHandle: 'out', target: 'out', targetHandle: 'alpha' },
        { id: 'reactflow__edge-splitx-lx_1a', source: 'split', sourceHandle: 'x', target: 'lx_1', targetHandle: 'a' },
        { id: 'reactflow__edge-uvuv-mapping_2d-1776636386216uv', source: 'uv', sourceHandle: 'uv', target: 'mapping_2d-1776636386216', targetHandle: 'uv' },
        { id: 'reactflow__edge-mapping_2d-1776636386216out-splitvec', source: 'mapping_2d-1776636386216', sourceHandle: 'out', target: 'split', targetHandle: 'vec' }
      ]
    }
];