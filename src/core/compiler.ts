import type { ShaderGraph, GLSLType } from '../types/ast';
import { NodeRegistry } from './registry';

function serializeValue(value: any, type: GLSLType): string {
    if (value === undefined) return '0.0';
    switch (type) {
        case 'float': return Number.isInteger(value) ? `${value}.0` : `${value}`;
        case 'vec3': return `vec3(${value.r.toFixed(1)}, ${value.g.toFixed(1)}, ${value.b.toFixed(1)})`;
        default: return '0.0';
    }
}

function getVarName(nodeId: string): string {
    return `node_${nodeId.replace(/-/g, '_')}`;
}

export function compileShader(graph: ShaderGraph): { vertexShader: string, fragmentShader: string } {
    const generatedNodes = new Set<string>();
    const codeLines: string[] = [];
    const injectedGlobals = new Set<string>();

    function resolveInput(nodeId: string, portId: string): string {
        const connection = graph.connections.find(
            c => c.targetNodeId === nodeId && c.targetPortId === portId
        );

        if (connection) {
            generateNodeCode(connection.sourceNodeId);
            return getVarName(connection.sourceNodeId);
        }

        const node = graph.nodes.find(n => n.id === nodeId);
        const input = node?.inputs.find(i => i.id === portId);
        return serializeValue(input?.value, input?.type as GLSLType);
    }

    function generateNodeCode(nodeId: string) {
        if (generatedNodes.has(nodeId)) return;

        const node = graph.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const strategy = NodeRegistry[node.type];
        if (!strategy) {
            console.warn(`No compiler strategy found for node type: ${node.type}`);
            return;
        }

        if (strategy.globalFunctions && !injectedGlobals.has(strategy.globalFunctions)) {
            injectedGlobals.add(strategy.globalFunctions);
        }

        const code = strategy.generateCode({
            node,
            varName: getVarName(node.id),
            resolveInput: (portId) => resolveInput(node.id, portId)
        });

        codeLines.push(code);
        generatedNodes.add(nodeId);
    }

    const outputNode = graph.nodes.find(n => n.type === 'OUTPUT_FRAG');
    if (outputNode) {
        generateNodeCode(outputNode.id);
    }

    let fragmentCode = `varying vec2 vUv;\n\n`;

    injectedGlobals.forEach(func => {
        fragmentCode += `${func}\n\n`;
    });

    fragmentCode += `void main() {\n`;
    fragmentCode += codeLines.join('\n');
    fragmentCode += `\n}\n`;

    const vertexShader = `varying vec2 vUv;\nvoid main() {\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}\n`;

    return { vertexShader, fragmentShader: fragmentCode };
}