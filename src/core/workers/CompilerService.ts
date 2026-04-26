import type { ShaderGraph } from '../../types/ast';
import CompilerWorker from './compiler.worker?worker';

export type CompileResult = { success: true; vertexShader: string; fragmentShader: string; uniforms: Record<string, any> } 
                          | { success: false; error: string };

class AsyncCompiler {
    private worker: Worker;
    private isBusy: boolean = false;
    
  
    private pendingGraph: ShaderGraph | null = null;
    
    
    private onComplete: ((result: CompileResult) => void) | null = null;

    constructor() {
        this.worker = new CompilerWorker();
        
        this.worker.onmessage = (e: MessageEvent<CompileResult>) => {
            this.isBusy = false;
            
            // Deliver to Canvas3D
            if (this.onComplete) {
                this.onComplete(e.data);
            }

            //  Check if another request queued up 
            if (this.pendingGraph) {
                const nextGraph = this.pendingGraph;
                this.pendingGraph = null;
                this.executeCompile(nextGraph);
            }
        };
    }

    /* Asynchronous compile request. If the worker is busy, it will queue the latest graph and drop any previously queued one.
    * The callback will be called with the compilation result once ready. 
    */
    public requestCompile(graph: ShaderGraph, callback: (result: CompileResult) => void) {
        this.onComplete = callback;

        if (this.isBusy) {
            this.pendingGraph = graph;
        } else {
            this.executeCompile(graph);
        }
    }

    private executeCompile(graph: ShaderGraph) {
        this.isBusy = true;
        this.worker.postMessage(graph);
    }

    public dispose() {
        this.worker.terminate();
    }
}

// SINGLETONEEEEEE
export const CompilerService = new AsyncCompiler();