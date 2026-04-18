// src/core/exporter/MaterialExporter.ts
import type { ShaderGraph } from '../../types/ast';
import type { IWorkspaceExporter, ExportResult } from '../../types/export';
import { compileShader } from '../compiler';

export class MaterialExporter implements IWorkspaceExporter {
    async export(graph: ShaderGraph, settings: Record<string, any>, globalSettings: { namespace: string; projectName: string }): Promise<ExportResult[]> {
        
        const { vertexShader, fragmentShader } = compileShader(graph, 'minecraft');
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');

        const manifest = JSON.stringify({
            namespace: globalSettings.namespace,
            id: safeName,
            type: "cosmos:material",
            config: {
                render_state: {
                    transparency: settings.isTranslucent ? 'TRANSLUCENT' : 'OPAQUE',
                    depth_test: 'LEQUAL'
                }
            }
        }, null, 4);

        return [
            {
                fileName: `cosmos_data/${safeName}.mat.csm.json`,
                fileContent: manifest,
                mimeType: 'application/json'
            },
            {
                fileName: `shaders/core/${safeName}.vsh`,
                fileContent: vertexShader,
                mimeType: 'text/plain'
            },
            {
                fileName: `shaders/core/${safeName}.fsh`,
                fileContent: fragmentShader,
                mimeType: 'text/plain'
            }
        ];
    }
}