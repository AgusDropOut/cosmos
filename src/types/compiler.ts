import type { ShaderNode } from './ast';

export interface CompilerContext {
    node: ShaderNode;
    varName: string;
    resolveInput: (portId: string) => string;
}

export interface NodeStrategy {
    generateCode: (ctx: CompilerContext) => string;
    globalFunctions?: string;
}