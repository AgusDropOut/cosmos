// src/core/exporter/BeamExporter.ts
import JSZip from 'jszip';
import type { ShaderGraph } from '../../types/ast';
import type { IWorkspaceExporter, ExportResult } from '../../types/export';
import { MaterialExporter } from './MaterialExporter';
import { MathCompiler } from '../compiler';

export class BeamExporter implements IWorkspaceExporter {
    private matExporter = new MaterialExporter();

    async export(graph: ShaderGraph, settings: Record<string, any>, globalSettings: { namespace: string; projectName: string }): Promise<ExportResult[]> {
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');
        const defaultMaterialId = `${globalSettings.namespace}:${safeName}`;
        const jsonContent = this.generateBeamJson(graph, settings, safeName, defaultMaterialId, globalSettings);

        return [{
            fileName: `cosmos_data/${safeName}.beam.csm.json`,
            fileContent: jsonContent,
            mimeType: 'application/json'
        }];
    }

    async exportComposite(
        beamGraph: ShaderGraph, 
        beamSettings: any, 
        materialGraph: ShaderGraph, 
        globalSettings: { namespace: string; projectName: string }
    ): Promise<ExportResult> {
        const zip = new JSZip();
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');
        const materialId = `${globalSettings.namespace}:${safeName}`;
        
        const beamJson = this.generateBeamJson(beamGraph, beamSettings, safeName, materialId, globalSettings);
        zip.file(`cosmos_data/${safeName}.beam.csm.json`, beamJson);

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

    private generateBeamJson(graph: ShaderGraph, settings: Record<string, any>, id: string, materialId: string, globalSettings: { namespace: string; projectName: string }): string {
        const endpoint = graph.nodes.find(n => n.type === 'BEAM_ENDPOINT');
        const mathCompiler = new MathCompiler(graph);

        // Compile the raw Java math strings for the runtime engine
        const radiusCurve = endpoint ? mathCompiler.compilePort(endpoint.id, 'radius_curve') : "1.0";
        

        const offsetX = endpoint ? mathCompiler.compilePort(endpoint.id, 'offset_x') : "0.0";
        const offsetY = endpoint ? mathCompiler.compilePort(endpoint.id, 'offset_y') : "0.0";
        const offsetZ = endpoint ? mathCompiler.compilePort(endpoint.id, 'offset_z') : "0.0";

        return JSON.stringify({
            namespace: globalSettings.namespace,
            id: id,
            type: "cosmos:beam_system",
            config: {
                radial_segments: settings.radialSegments || 6,
                length_segments: settings.lengthSegments || 20,
                radius_curve: radiusCurve,
                offset_x: offsetX,
                offset_y: offsetY,
                offset_z: offsetZ,
                material_id: materialId
            }
        }, null, 4);
    }
}