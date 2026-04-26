import { compileShader } from '../compiler'; 
import type { ShaderGraph } from '../../types/ast';

self.onmessage = (event: MessageEvent<ShaderGraph>) => {
    try {
        const graph = event.data;
        const { vertexShader, fragmentShader, uniforms } = compileShader(graph);
        
        // Send success back 
        self.postMessage({ 
            success: true, 
            vertexShader, 
            fragmentShader,
            uniforms 
        });
    } catch (error: any) {
        // Send compilation errors 
        self.postMessage({ 
            success: false, 
            error: error.message || 'Unknown compilation error' 
        });
    }
};