// src/core/exporter/MaterialExporter.ts
import type { ShaderGraph } from '../../types/ast';
import type { IWorkspaceExporter, ExportResult } from '../../types/export';
import { compileShader } from '../compiler';
import JSZip from 'jszip';

export class MaterialExporter implements IWorkspaceExporter {
    async export(graph: ShaderGraph, settings: Record<string, any>, globalSettings: { namespace: string; projectName: string }): Promise<ExportResult[]> {
        
        const { vertexShader, fragmentShader, uniforms } = compileShader(graph, 'minecraft');
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');

        const exposedParameters: Record<string, string> = {};
        if (uniforms) {
            Object.entries(uniforms).forEach(([name, data]: [string, any]) => {
                exposedParameters[name] = data.type; 
            });
        }

        const manifest = JSON.stringify({
            namespace: globalSettings.namespace,
            id: safeName,
            type: "cosmos:material",
            config: {
                exposed_parameters: exposedParameters,
                render_state: {
                    blend_mode: settings.blend_mode || 'OPAQUE',
                    cull_mode: settings.cull_mode || 'BACK',
                    depth_test: settings.depth_test || 'LEQUAL',
                    depth_write: settings.depth_write !== undefined ? settings.depth_write : true,
                    alpha_cutoff: settings.alpha_cutoff || 0.0
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

    async exportComposite(
        graph: ShaderGraph, 
        settings: any, 
        _materialGraph: ShaderGraph | null,
        globalSettings: { namespace: string; projectName: string }
    ): Promise<ExportResult> {
        
        const zip = new JSZip();
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');
        
       
        const rawFiles = await this.export(graph, settings, globalSettings);
        
       
        for (const file of rawFiles) {
            zip.file(file.fileName, file.fileContent);
        }

        
        const content = await zip.generateAsync({ type: 'blob' });

        return {
            fileName: `${safeName}_material.csm.zip`,
            fileContent: content,
            mimeType: 'application/zip'
        };
    }
}