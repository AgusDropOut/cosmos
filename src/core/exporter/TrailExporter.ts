// src/core/exporter/TrailExporter.ts
import JSZip from 'jszip';
import type { ShaderGraph } from '../../types/ast';
import type { IWorkspaceExporter, ExportResult } from '../../types/export';
import { MaterialExporter } from './MaterialExporter';
import { serializeValue } from '../compiler';
import { MathCompiler } from '../compiler';

export class TrailExporter implements IWorkspaceExporter {
    private matExporter = new MaterialExporter();

    async export(graph: ShaderGraph, settings: Record<string, any>,  globalSettings: { namespace: string; projectName: string }): Promise<ExportResult[]> {
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');
        const defaultMaterialId = `${globalSettings.namespace}:${safeName}`;
        const jsonContent = this.generateTrailJson(graph, settings, safeName, defaultMaterialId, globalSettings);

        return [{
            fileName: `cosmos_data/${safeName}.trail.csm.json`,
            fileContent: jsonContent,
            mimeType: 'application/json'
        }];
    }

    async exportComposite(
        trailGraph: ShaderGraph, 
        trailSettings: any, 
        materialGraph: ShaderGraph, 
        globalSettings: { namespace: string; projectName: string }
    ): Promise<ExportResult> {
        const zip = new JSZip();
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');
        const materialId = `${globalSettings.namespace}:${safeName}`;
        
        const trailJson = this.generateTrailJson(trailGraph, trailSettings, safeName, materialId, globalSettings);
        zip.file(`cosmos_data/${safeName}.trail.csm.json`, trailJson);

        const matResults = await this.matExporter.export(materialGraph, {}, globalSettings);
        
        for (const matFile of matResults) {
            zip.file(matFile.fileName, matFile.fileContent);
        }

        const content = await zip.generateAsync({ type: 'blob' });

        return {
            fileName: `${safeName}.csm.zip`,
            fileContent: content,
            mimeType: 'application/zip'
        };
    }

    private generateTrailJson(graph: ShaderGraph, settings: Record<string, any>, id: string, materialId: string, globalSettings: { namespace: string; projectName: string }): string {
        const endpoint = graph.nodes.find(n => n.type === 'TRAIL_ENDPOINT');
        
      
        const mathCompiler = new MathCompiler(graph);

        const widthCurve = endpoint ? mathCompiler.compilePort(endpoint.id, 'width') : "1.0";
        const orbitOffset = endpoint ? mathCompiler.compilePort(endpoint.id, 'orbit_offset') : "vec3(0.0)";

        return JSON.stringify({
            namespace: globalSettings.namespace,
            id: id,
            type: "cosmos:trail_system",
            config: {
                history_segments: settings.segments || 20,
                width_curve: widthCurve,
                orbit_offset: orbitOffset,
                material_id: materialId
            }
        }, null, 4);
    }
}