// src/core/compiler.ts
import type { ShaderGraph, GLSLType, NodeType } from '../types/ast';
import { NodeRegistry } from './registry';

export function serializeValue(value: any, type: GLSLType): string {
    if (value === undefined || value === null) {
        if (type === 'vec3') return 'vec3(0.0)';
        if (type === 'vec2') return 'vec2(0.0)';
        return '0.0';
    }
    
    switch (type) {
        case 'float': return Number.isInteger(value) ? `${value}.0` : `${value}`;
        case 'vec3': 
            if (typeof value === 'object') {
                return `vec3(${value.r.toFixed(3)}, ${value.g.toFixed(3)}, ${value.b.toFixed(3)})`;
            }
            return `vec3(${value})`;
        default: return '0.0';
    }
}

/**
 * Traverses backwards from a specific Endpoint Node,
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
        
        // Fallbacks if the user deleted the output nodes
        if (!endpointNode) {
            return isVertex 
                ? `varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
                : `varying vec2 vUv;\nvoid main() { gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }`; // Magenta missing texture
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
        if (this.generatedNodes.has(nodeId)) return; 

        const node = this.graph.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const strategy = NodeRegistry[node.type];
        if (!strategy) {
            console.warn(`No compiler strategy found for node type: ${node.type}`);
            return;
        }

        // Ensure upstream nodes are generated FIRST (Backwards Traversal)
        node.inputs.forEach(input => {
            const connection = this.graph.connections.find(
                c => c.targetNodeId === nodeId && c.targetPortId === input.id
            );
            if (connection) {
                this.traverseNode(connection.sourceNodeId);
            }
        });

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

        const nodeCode = strategy.generateCode({ node, varName, resolveInput });
        this.mainBodyCode.push(nodeCode);
        
        this.generatedNodes.add(nodeId);
    }
}

/**
 * Master Entry Point. Spawns two independent tree traversals.
 */
export function compileShader(graph: ShaderGraph) {
    const vertexCompiler = new TreeCompiler(graph);
    const fragmentCompiler = new TreeCompiler(graph);

    return {
        vertexShader: vertexCompiler.compileTree('OUTPUT_VERT', true),
        fragmentShader: fragmentCompiler.compileTree('OUTPUT_FRAG', false)
    };
}