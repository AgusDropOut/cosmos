import type { NodeType } from '../types/ast';
import type { NodeStrategy } from '../types/compiler';

export const NodeRegistry: Record<NodeType, NodeStrategy> = {
    COLOR: {
        generateCode: ({ resolveInput, varName }) =>
            `    vec3 ${varName} = ${resolveInput('rgb')};`
    },
    NOISE: {
        globalFunctions: `float random(vec2 st) {\n    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);\n}`,
        generateCode: ({ resolveInput, varName }) =>
            `    float ${varName} = random(vUv * ${resolveInput('scale')});`
    },
    MULTIPLY: {
        generateCode: ({ resolveInput, varName }) =>
            `    vec3 ${varName} = ${resolveInput('a')} * ${resolveInput('b')};`
    },
    OUTPUT_FRAG: {
        generateCode: ({ resolveInput }) =>
            `    gl_FragColor = vec4(${resolveInput('color')}, 1.0);`
    }
};