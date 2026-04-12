export type NodeType = 'OUTPUT_FRAG' | 'COLOR' | 'NOISE' | 'MULTIPLY';

export type GLSLType = 'float' | 'vec2' | 'vec3' | 'vec4';

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