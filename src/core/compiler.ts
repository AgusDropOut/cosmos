import { ShaderGraph, GLSLType } from './ast';

// Translates raw JS objects into GLSL string representations
function serializeValue(value: any, type: GLSLType): string {
    if (value === undefined) return '0.0';
    
    switch (type) {
        case 'float': 
            return Number.isInteger(value) ? `${value}.0` : `${value}`;
        case 'vec3': 
            return `vec3(${value.r.toFixed(1)}, ${value.g.toFixed(1)}, ${value.b.toFixed(1)})`;
        default: 
            return '0.0';
    }
}

export function compileShader(graph: ShaderGraph): { vertexShader: string, fragmentShader: string } {
    let fragmentCode = `varying vec2 vUv;\n\n`;
    
    // Injected utility functions
    fragmentCode += `float random(vec2 st) {\n    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);\n}\n\n`;
    
    fragmentCode += `void main() {\n`;

    const generatedNodes = new Set<string>();
    const codeLines: string[] = [];

    // Finds connected node or returns static value
    function resolveInput(nodeId: string, portId: string): string {
        const connection = graph.connections.find(
            c => c.targetNodeId === nodeId && c.targetPortId === portId
        );
        
        if (connection) {
            generateNodeCode(connection.sourceNodeId);
            return `node_${connection.sourceNodeId.replace(/-/g, '_')}`;
        }
        
        const node = graph.nodes.find(n => n.id === nodeId);
        const input = node?.inputs.find(i => i.id === portId);
        return serializeValue(input?.value, input?.type as GLSLType);
    }

    // Recursively generates node variables
    function generateNodeCode(nodeId: string) {
        if (generatedNodes.has(nodeId)) return;
        
        const node = graph.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const varName = `node_${nodeId.replace(/-/g, '_')}`;

        switch (node.type) {
            case 'COLOR':
                const colorVal = resolveInput(node.id, 'rgb');
                codeLines.push(`    vec3 ${varName} = ${colorVal};`);
                break;
            case 'NOISE':
                const scale = resolveInput(node.id, 'scale');
                codeLines.push(`    float ${varName} = random(vUv * ${scale});`);
                break;
            case 'MULTIPLY':
                const a = resolveInput(node.id, 'a');
                const b = resolveInput(node.id, 'b');
                // Prototype assumes vec3 * float
                codeLines.push(`    vec3 ${varName} = ${a} * ${b};`);
                break;
            case 'OUTPUT_FRAG':
                const finalColor = resolveInput(node.id, 'color');
                codeLines.push(`    gl_FragColor = vec4(${finalColor}, 1.0);`);
                break;
        }

        generatedNodes.add(nodeId);
    }

    // Execution starts at the output node
    const outputNode = graph.nodes.find(n => n.type === 'OUTPUT_FRAG');
    if (outputNode) {
        generateNodeCode(outputNode.id);
    }

    fragmentCode += codeLines.join('\n');
    fragmentCode += `\n}\n`;

    // Static vertex shader for 2D/3D coordinate passing
    const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

    return { vertexShader, fragmentShader: fragmentCode };
}