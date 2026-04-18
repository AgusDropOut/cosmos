// src/core/export/ExportService.ts
import { compileShader } from '../compiler';
import type { ShaderGraph } from '../../types/ast';
import type { ExportConfig, IMetadataExtractor } from '../../types/export';

export interface ExportPackage {
    vsh: string;
    fsh: string;
    json: string;
}

export class ExportService {
    private extractor: IMetadataExtractor;

    constructor(extractor: IMetadataExtractor) {
        this.extractor = extractor;
    }

    public generatePackage(graph: ShaderGraph, config: ExportConfig): ExportPackage {
        const shaders = compileShader(graph, 'minecraft');
        const metadata = this.extractor.extract(graph, config);

        // Future syntax adaptation (Three.js -> Vanilla GLSL) is injected here
        const adaptedVsh = this.adaptSyntax(shaders.vertexShader);
        const adaptedFsh = this.adaptSyntax(shaders.fragmentShader);

        return {
            vsh: adaptedVsh,
            fsh: adaptedFsh,
            json: JSON.stringify(metadata, null, 2)
        };
    }

    private adaptSyntax(code: string): string {
        // Minimal replacement mapping WebGL globals to Core Shader globals
        return code
            .replace(/projectionMatrix/g, 'ProjMat')
            .replace(/modelViewMatrix/g, 'ModelViewMat')
            .replace(/gl_FragColor/g, 'fragColor')
            .replace(/varying/g, 'out'); 
    }
}