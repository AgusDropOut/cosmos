// src/types/export.ts
import type { ShaderGraph } from './ast';

export type UniformSource = 'GAME_TIME' | 'CUSTOM' | 'TEXTURE' | 'LIGHTMAP';

export interface UniformMeta {
    type: string;
    source: UniformSource;
}

export interface RenderState {
    blend_mode: 'OPAQUE' | 'TRANSLUCENT' | 'ADDITIVE' | 'MULTIPLY';
    cull_mode: 'BACK' | 'FRONT' | 'NONE';
    depth_test: 'LEQUAL' | 'ALWAYS' | 'NEVER';
    depth_write: boolean;
    alpha_cutoff: number; 
}

export interface CosmosMetadata {
    name: string;
    vertex_format: string;
    render_state: RenderState;
    uniforms: Record<string, UniformMeta>;
}

export interface ExportConfig {
    name: string;
    isTranslucent: boolean;
}

export interface IMetadataExtractor {
    extract(graph: ShaderGraph, config: ExportConfig): CosmosMetadata;
}

export interface ExportResult {
    fileName: string;
    fileContent: string | Blob;
    mimeType: string;
}

export interface IWorkspaceExporter {
    export(graph: ShaderGraph, settings: Record<string, any>, globalSettings: { namespace: string; projectName: string }): Promise<ExportResult[]>;
}