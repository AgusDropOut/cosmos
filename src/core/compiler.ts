import type { ShaderGraph, GLSLType } from '../types/ast';
import { NodeRegistry } from './registry';

function serializeValue(value: any, type: GLSLType): string {
    if (value === undefined) {
        if (type === 'vec3') return 'vec3(0.0)';
        if (type === 'vec2') return 'vec2(0.0)';
        return '0.0';
    }
    
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

        
        const targetNode = graph.nodes.find(n => n.id === nodeId);
        const targetInput = targetNode?.inputs.find(i => i.id === portId);
        const expectedType = targetInput?.type || 'float';

        if (connection) {
            generateNodeCode(connection.sourceNodeId);
            const sourceVarName = getVarName(connection.sourceNodeId);

           
            const sourceNode = graph.nodes.find(n => n.id === connection.sourceNodeId);
            const sourceOutput = sourceNode?.outputs.find(o => o.id === connection.sourcePortId);
            const actualType = sourceOutput?.type || 'float';

           
            if (expectedType === 'vec3' && actualType === 'float') {
                return `vec3(${sourceVarName})`;
            }

            return sourceVarName;
        }

        return serializeValue(targetInput?.value, expectedType as GLSLType);
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