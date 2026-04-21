export type NodeType = 
  | 'OUTPUT_FRAG' 
  | 'OUTPUT_VERT' 
  | 'COLOR' 
  | 'NOISE' 
  | 'MULTIPLY' 
  | 'TIME' 
  | 'MATERIAL_REF' 
  | 'TRAIL_ENDPOINT'
  | 'UV_COORDS'
  | 'VERTEX_COLOR'
  | 'SPLIT_VEC2'
  | 'PACK_VEC3'
  | 'MATH_UNARY'
  | 'MATH_BINARY'
  | 'SMOOTHSTEP'
  | 'MIX_COLORS'
  | 'FBM_NOISE_2D'
  | 'RIDGE_NOISE_3D'
  | 'PACK_VEC2'
  | 'VECTOR_SCALAR_MATH'
  | 'VECTOR_MATH'
  | 'MAPPING_2D'
  | 'FBM_NOISE_3D'
  | 'DOT_PRODUCT'
  ;

export type GLSLType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'string';

export interface NodePort {
    id: string;
    type: GLSLType;
    value?: any;
}

export interface ShaderNode {
    id: string;
    type: NodeType;
    inputs: NodePort[];
    outputs: NodePort[];
    data?: Record<string, any>; 
}

export interface ShaderConnection {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
}

export interface ShaderGraph {
    nodes: ShaderNode[];
    connections: ShaderConnection[];
}