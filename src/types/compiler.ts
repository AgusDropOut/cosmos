import type { ShaderNode } from './ast';

export interface CompilerContext {
    node: ShaderNode;
    varName: string;
    resolveInput: (portId: string) => string;
}

export interface NodeStrategy {
    generateCode: (ctx: CompilerContext) => string;
    generateMath?: (ctx: { 
      resolveInput: (id: string) => string;
      node: { 
          id: string; 
          type: string; 
          inputs: Array<{ id: string; type?: string; value?: any }>; 
          outputs: Array<{ id: string; type?: string }>;
      }
  }) => string;
    globalFunctions?: string;
}