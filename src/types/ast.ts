// src/types/ast.ts

/**
 * Defines the available classifications for node instances within the engine.
 * Every visual node placed on the canvas must map to one of these predefined registry types.
 */
export type NodeType = 
  | 'OUTPUT_FRAG' 
  | 'OUTPUT_VERT' 
  | 'COLOR' 
  | 'NOISE' 
  | 'MULTIPLY' 
  | 'TIME' 
  | 'FLOAT'
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
  | 'BEAM_ENDPOINT'
  ;

/**
 * Specifies the supported GLSL data types used for mathematical evaluation and port connections.
 */
export type GLSLType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'string';

/**
 * Represents an input or output connection point on a node instance.
 * * @property id - The specific identifier for the port (e.g., 'color', 'uv_coords').
 * @property type - The GLSL data type expected or emitted by this port.
 * @property value - An optional constant value used if the input port has no active connection.
 */
export interface NodePort {
    id: string;
    type: GLSLType;
    value?: any;
}

/**
 * Represents an active instance of a node placed within the visual editor.
 * * @property id - The globally unique identifier for this specific node instance (e.g., 'noise-16843000').
 * @property type - The overarching structural classification of the node.
 * @property inputs - The array of available input ports and their current constant values.
 * @property outputs - The array of available output ports.
 * @property data - Optional arbitrary data required for specific node logic.
 * @property isUniform - Flag indicating if this node instance should be compiled into a GLSL uniform.
 * @property uniformName - The declared variable name used in the shader program if the node is a uniform.
 * @property position - The physical X/Y coordinates of the node on the React Flow canvas, used for layout restoration.
 */
export interface ShaderNode {
    id: string;
    type: NodeType;
    inputs: NodePort[];
    outputs: NodePort[];
    data?: Record<string, any>; 
    isUniform?: boolean;
    uniformName?: string;
    position?: { x: number; y: number };
}

/**
 * Represents a directed structural link (wire) between an output port of one node and an input port of another.
 * * @property id - The globally unique identifier for the connection wire.
 * @property sourceNodeId - The instance ID of the node emitting data.
 * @property sourcePortId - The specific port ID on the emitting node.
 * @property targetNodeId - The instance ID of the node receiving data.
 * @property targetPortId - The specific port ID on the receiving node.
 */
export interface ShaderConnection {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
}

/**
 * The root Abstract Syntax Tree (AST) structure encapsulating the entire visual logic.
 * This is the primary data structure passed to the Compilers and Evaluators.
 * * @property nodes - The complete collection of active node instances in the current workspace.
 * @property connections - The collection of wires linking the node instances together.
 */
export interface ShaderGraph {
    nodes: ShaderNode[];
    connections: ShaderConnection[];
}