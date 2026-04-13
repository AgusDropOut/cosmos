// src/core/compiler.ts
import type { ShaderGraph, GLSLType, NodeType } from '../types/ast';
import { NodeRegistry } from './registry'; 

// Safe value serialization based on GLSL types
function serializeValue(value: any, type: GLSLType): string {
    if (value === undefined || value === null) {
        if (type === 'vec3') return 'vec3(0.0)';
        if (type === 'vec2') return 'vec2(0.0)';
        return '0.0';
    }
    switch (type) {
        case 'float': return Number.isInteger(value) ? `${value}.0` : `${value}`;
        case 'vec3': return typeof value === 'object' 
            ? `vec3(${value.r.toFixed(3)}, ${value.g.toFixed(3)}, ${value.b.toFixed(3)})` 
            : `vec3(${value})`;
        default: return '0.0';
    }
}

/**
 * A dedicated class that traverses backwards from a specific Endpoint Node,
 * generating GLSL only for the nodes connected to that specific tree.
 */
class TreeCompiler {
    private graph: ShaderGraph;
    private generatedNodes = new Set<string>();
    private globalFunctions = new Set<string>();
    private mainBodyCode: string[] = [];

    constructor(graph: ShaderGraph) {
        this.graph = graph;
    }

    public compileTree(endpointType: NodeType, isVertex: boolean): string {
        const endpointNode = this.graph.nodes.find(n => n.type === endpointType);
        
        // If the graph doesn't have this endpoint, return the default WebGL fallback
        if (!endpointNode) {
            return isVertex 
                ? `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
                : `void main() { gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }`; // Magenta missing texture
        }

        // 1. Traverse backwards from the endpoint
        this.traverseNode(endpointNode.id);

        // 2. Assemble the final shader string
        const globalsString = Array.from(this.globalFunctions).join('\n\n');
        const mainString = this.mainBodyCode.join('\n');

        return `
    varying vec2 vUv;
    ${globalsString}

    void main() {
            ${isVertex ? '    vUv = uv;' : ''}
            ${mainString}
        }
        `.trim();
    }

    private traverseNode(nodeId: string) {
        if (this.generatedNodes.has(nodeId)) return; // Prevent duplicate code generation

        const node = this.graph.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const strategy = NodeRegistry[node.type];
        if (!strategy) throw new Error(`Missing strategy for node type: ${node.type}`);

        // Ensure upstream nodes are generated FIRST (Backwards Traversal)
        node.inputs.forEach(input => {
            const connection = this.graph.connections.find(
                c => c.targetNodeId === nodeId && c.targetPortId === input.id
            );
            if (connection) {
                this.traverseNode(connection.sourceNodeId);
            }
        });

        // Add global functions if this node requires them 
        if (strategy.globalFunctions) {
            this.globalFunctions.add(strategy.globalFunctions);
        }

        const varName = `node_${node.id.replace(/-/g, '_')}`;

        // The Smart Resolver
        const resolveInput = (portId: string): string => {
            const inputDef = node.inputs.find(i => i.id === portId);
            const expectedType = inputDef?.type || 'float';

            const connection = this.graph.connections.find(
                c => c.targetNodeId === nodeId && c.targetPortId === portId
            );

            if (connection) {
                const sourceNode = this.graph.nodes.find(n => n.id === connection.sourceNodeId);
                const sourceOutput = sourceNode?.outputs.find(o => o.id === connection.sourcePortId);
                const actualType = sourceOutput?.type || 'float';
                const sourceVarName = `node_${connection.sourceNodeId.replace(/-/g, '_')}`;

                
                if (expectedType === 'vec3' && actualType === 'float') {
                    return `vec3(${sourceVarName})`;
                }
                return sourceVarName;
            }

            return serializeValue(inputDef?.value, expectedType as GLSLType);
        };

        // Generate and store the line of GLSL for this node
        const nodeCode = strategy.generateCode({ node, varName, resolveInput });
        this.mainBodyCode.push(nodeCode);
        
        this.generatedNodes.add(nodeId);
    }
}

/**
 * The Master Entry Point used by Canvas3D.
 * It spawns two independent tree traversals.
 */
export function compileShader(graph: ShaderGraph) {
    const vertexCompiler = new TreeCompiler(graph);
    const fragmentCompiler = new TreeCompiler(graph);

    return {
        vertexShader: vertexCompiler.compileTree('OUTPUT_VERT', true),
        fragmentShader: fragmentCompiler.compileTree('OUTPUT_FRAG', false)
    };
}