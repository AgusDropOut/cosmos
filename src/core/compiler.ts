import type { ShaderGraph, GLSLType, NodeType } from '../types/ast';
import { NodeRegistry } from './registry';

export function serializeValue(value: any, type: GLSLType): string {
    if (value === undefined || value === null) {
        if (type === 'vec3') return 'vec3(0.0)';
        if (type === 'vec2') return 'vec2(0.0)';
        if (type === 'string') return '';
        return '0.0';
    }
    
    switch (type) {
        case 'float': 
            return Number.isInteger(value) ? `${value}.0` : `${value}`;
        case 'vec2': 
            if (typeof value === 'object') {
                return `vec2(${(value.x || 0).toFixed(3)}, ${(value.y || 0).toFixed(3)})`;
            }
            return `vec2(${value})`;
        case 'vec3': 
            if (typeof value === 'object') {
                return `vec3(${(value.r || 0).toFixed(3)}, ${(value.g || 0).toFixed(3)}, ${(value.b || 0).toFixed(3)})`;
            }
            return `vec3(${value})`;
        case 'string':
            return value;
        default: return '0.0';
    }
}

export type CompilerTarget = 'web' | 'minecraft';

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
    
    public compileTree(endpointType: NodeType, isVertex: boolean, target: CompilerTarget): string {
        const endpointNode = this.graph.nodes.find(n => n.type === endpointType);
        
        if (endpointNode) {
            this.traverseNode(endpointNode.id);
        }

        if (target === 'minecraft') {
            return this.assembleMinecraft(isVertex, !!endpointNode);
        } else {
            return this.assembleWeb(isVertex, !!endpointNode);
        }
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
                
                
                let sourceVarName = `node_${connection.sourceNodeId.replace(/-/g, '_')}`;
                if (sourceNode && sourceNode.outputs.length > 1) {
                    sourceVarName = `${sourceVarName}_${connection.sourcePortId}`;
                }

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

    private assembleWeb(isVertex: boolean, hasEndpoint: boolean): string {
        if (!hasEndpoint) {
            return isVertex 
                ? `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
                : `void main() { gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }`;
        }

        const globalsString = Array.from(this.globalFunctions).join('\n\n');
        const mainString = this.mainBodyCode.join('\n');

        return `
varying vec2 vUv;
// FIX 2: Web Preview Stub for Vertex Colors
vec4 vertexColor = vec4(1.0, 1.0, 1.0, 1.0); 

${globalsString}

void main() {
    ${isVertex ? 'vUv = uv;' : ''}
    ${mainString}
}
        `.trim();
    }

   private assembleMinecraft(isVertex: boolean, hasEndpoint: boolean): string {
        if (!hasEndpoint) {
            return isVertex 
                ? `#version 150\nin vec3 Position; uniform mat4 ProjMat; uniform mat4 ModelViewMat; void main() { gl_Position = ProjMat * ModelViewMat * vec4(Position, 1.0); }`
                : `#version 150\nout vec4 fragColor; void main() { fragColor = vec4(1.0, 0.0, 1.0, 1.0); }`;
        }

        let globalsString = Array.from(this.globalFunctions).join('\n\n');
        let mainString = this.mainBodyCode.join('\n');

        /* Minecraft's shader environment has some hardcoded uniforms and varying semantics.
         * We need to adapt our generated GLSL to fit those constraints. 
         * By applying global string replacements  
        */

        globalsString = globalsString.replace(/uniform float u_time;/g, '');

        mainString = mainString.replace(/\bu_time\b/g, '(CosmosTime * 1000.0)');
        mainString = mainString.replace(/\buv\b/g, 'UV0');
        mainString = mainString.replace(/\bposition\b/g, 'Position');
        mainString = mainString.replace(/\bprojectionMatrix\b/g, 'ProjMat');
        mainString = mainString.replace(/\bmodelViewMatrix\b/g, 'ModelViewMat');
        
        globalsString = globalsString.replace(/\bgl_FragColor\b/g, 'fragColor');
        mainString = mainString.replace(/\bgl_FragColor\b/g, 'fragColor');

        if (isVertex) {
            return `
#version 150
in vec3 Position;
in vec4 Color;
in vec2 UV0;

uniform mat4 ModelViewMat;
uniform mat4 ProjMat;
uniform float CosmosTime;

out vec2 vUv;
out vec4 vertexColor;

${globalsString}

void main() {
    vUv = UV0;
    vertexColor = Color;
${mainString}
}
            `.trim();
        } else {
            return `
#version 150

in vec2 vUv;
in vec4 vertexColor;
out vec4 fragColor;

uniform float CosmosTime;

${globalsString}

void main() {
${mainString}
}
            `.trim();
        }
    }
}

/**
 * Master Entry Point. Spawns two independent tree traversals. 
 * One for the webgl previewer and the other for minecraft.
 */
export function compileShader(graph: ShaderGraph, target: CompilerTarget = 'web') {
    const vertexCompiler = new TreeCompiler(graph);
    const fragmentCompiler = new TreeCompiler(graph);

    return {
        vertexShader: vertexCompiler.compileTree('OUTPUT_VERT', true, target),
        fragmentShader: fragmentCompiler.compileTree('OUTPUT_FRAG', false, target)
    };
}