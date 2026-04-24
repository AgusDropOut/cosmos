import type { ShaderNode } from './ast';


export interface CompilerContext {
    node: ShaderNode;
    varName: string;
    resolveInput: (portId: string) => string;
}

export interface NodeStrategy {
    // WebGL String Generation
    generateCode: (ctx: CompilerContext) => string;
    
    // Java Backend String Generation
    generateMath?: (ctx: { 
        resolveInput: (id: string) => string;
        node: ShaderNode; 
    }) => string;
    
    // Live 60fps JavaScript Evaluation
    evaluate?: (ctx: { 
        resolveInput: (id: string) => any; 
        node: ShaderNode;
        time: number;
        globals: any;
    }) => any;
    
    globalFunctions?: string;
}