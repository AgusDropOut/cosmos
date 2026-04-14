// src/core/exporter/TrailExporter.ts
import JSZip from 'jszip';
import type { ShaderGraph } from '../../types/ast';
import type { IWorkspaceExporter, ExportResult } from '../../types/export';
import { MaterialExporter } from './MaterialExporter';
import { serializeValue } from '../compiler';

export class TrailExporter implements IWorkspaceExporter {
    private matExporter = new MaterialExporter();

    async export(graph: ShaderGraph, settings: Record<string, any>,  globalSettings: { namespace: string; projectName: string }): Promise<ExportResult> {
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');
        // Fallback material ID for standalone exports
        const defaultMaterialId = `bloodyhell:${safeName}_mat`;
        const jsonContent = this.generateTrailJson(graph, settings, safeName, defaultMaterialId, globalSettings);

        return {
            fileName: `${safeName}.trail.csm.json`,
            fileContent: jsonContent,
            mimeType: 'application/json'
        };
    }

    async exportComposite(
        trailGraph: ShaderGraph, 
        trailSettings: any, 
        materialGraph: ShaderGraph, 
        globalSettings: { namespace: string; projectName: string }
    ): Promise<ExportResult> {
        const zip = new JSZip();
        const safeName = globalSettings.projectName.toLowerCase().replace(/\s+/g, '_');
        const materialId = `bloodyhell:${safeName}_mat`;
        
        // Generates the Trail Config with the exact generated material ID
        const trailJson = this.generateTrailJson(trailGraph, trailSettings, safeName, materialId, globalSettings);
        zip.file(`${safeName}.trail.csm.json`, trailJson);

        // Generates the Material JSON using the matching safeName identifier
        const matResult = await this.matExporter.export(materialGraph, {}, globalSettings);
        zip.file(`${safeName}.mat.csm.json`, matResult.fileContent as string);

        const content = await zip.generateAsync({ type: 'blob' });

        return {
            fileName: `${safeName}.csm.zip`,
            fileContent: content,
            mimeType: 'application/zip'
        };
    }

    private generateTrailJson(graph: ShaderGraph, settings: Record<string, any>, id: string, materialId: string, globalSettings: { namespace: string; projectName: string }): string {
        const endpoint = graph.nodes.find(n => n.type === 'TRAIL_ENDPOINT');

        const evaluatePort = (targetNodeId: string, portId: string): string => {
            const conn = graph.connections.find(c => c.targetNodeId === targetNodeId && c.targetPortId === portId);
            if (!conn) {
                const node = graph.nodes.find(n => n.id === targetNodeId);
                const input = node?.inputs.find(i => i.id === portId);
                return serializeValue(input?.value, (input?.type as any) || 'float');
            }
            return evaluateNode(conn.sourceNodeId);
        };

        const evaluateNode = (nodeId: string): string => {
            const node = graph.nodes.find(n => n.id === nodeId);
            if (!node) return '0.0';

            switch(node.type) {
                case 'TIME':
                    return `sin(time * ${evaluatePort(nodeId, 'speed')})`;
                case 'MULTIPLY':
                    return `(${evaluatePort(nodeId, 'a')} * ${evaluatePort(nodeId, 'b')})`;
                case 'NOISE':
                    return `noise(time * ${evaluatePort(nodeId, 'scale')})`;
                default:
                    return '1.0';
            }
        };

        return JSON.stringify({
            namespace: globalSettings.namespace,
            id: id,
            type: "cosmos:trail_system",
            config: {
                history_segments: settings.segments || 20,
                width_curve: endpoint ? evaluatePort(endpoint.id, 'width') : "1.0",
                orbit_offset: endpoint ? evaluatePort(endpoint.id, 'orbit_offset') : "[0.0, 0.0, 0.0]",
                material_id: materialId
            }
        }, null, 4);
    }
}