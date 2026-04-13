// src/core/exporter/MaterialExporter.ts
import type { ShaderGraph } from '../../types/ast';
import type { IWorkspaceExporter, ExportResult } from '../../types/export';
import { compileShader } from '../compiler';

export class MaterialExporter implements IWorkspaceExporter {
    async export(graph: ShaderGraph, settings: Record<string, any>, projectName: string): Promise<ExportResult> {
        
        const { vertexShader, fragmentShader } = compileShader(graph);

        const safeName = projectName.toLowerCase().replace(/\s+/g, '_');

        const manifest = JSON.stringify({
            namespace: "bloodyhell",
            id: safeName,
            type: "cosmos:material",
            config: {
                vertex: vertexShader,
                fragment: fragmentShader,
                render_state: {
                    transparency: settings.isTranslucent ? 'TRANSLUCENT' : 'OPAQUE',
                    depth_test: 'LEQUAL'
                }
            }
        }, null, 4);

        return {
            fileName: `${safeName}.mat.csm.json`,
            fileContent: manifest,
            mimeType: 'application/json'
        };
    }
}