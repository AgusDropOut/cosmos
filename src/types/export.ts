// src/types/export.ts
import type { ShaderGraph } from './ast';

/**
 * Defines the runtime origin for a shader uniform within the target game engine.
 */
export type UniformSource = 'GAME_TIME' | 'CUSTOM' | 'TEXTURE' | 'LIGHTMAP';

/**
 * Represents the metadata required by the game engine to bind a specific uniform.
 * * @property type - The GLSL data type (e.g., 'float', 'vec3').
 * @property source - The origin classification for the uniform data.
 */
export interface UniformMeta {
    type: string;
    source: UniformSource;
}

/**
 * Defines the low-level graphics pipeline state required to render the material.
 */
export interface RenderState {
    blend_mode: 'OPAQUE' | 'TRANSLUCENT' | 'ADDITIVE' | 'MULTIPLY';
    cull_mode: 'BACK' | 'FRONT' | 'NONE';
    depth_test: 'LEQUAL' | 'ALWAYS' | 'NEVER';
    depth_write: boolean;
    alpha_cutoff: number; 
}

/**
 * The standard JSON schema expected by the target game engine's metadata parser.
 */
export interface CosmosMetadata {
    name: string;
    vertex_format: string;
    render_state: RenderState;
    uniforms: Record<string, UniformMeta>;
}

/**
 * Configuration parameters provided to the metadata extraction process.
 */
export interface ExportConfig {
    name: string;
    settings: Record<string, any>;
}

/**
 * Contract for services that parse a ShaderGraph into valid engine metadata.
 */
export interface IMetadataExtractor {
    /**
     * Extracts metadata from a shader graph based on the provided configuration.
     * * @param graph - The logical AST representing the visual shader.
     * @param config - Export configuration parameters.
     * @returns The generated Cosmos metadata schema.
     */
    extract(graph: ShaderGraph, config: ExportConfig): CosmosMetadata;
}

/**
 * Represents a discrete file generated during the export process.
 * * @property fileName - The target name of the file including extension.
 * @property fileContent - The raw string payload or binary blob.
 * @property mimeType - The MIME classification for the file payload.
 */
export interface ExportResult {
    fileName: string;
    fileContent: string | Blob;
    mimeType: string;
}

/**
 * Contract for context-specific exporters that compile ASTs into downloadable game assets.
 */
export interface IWorkspaceExporter {
    /**
     * Compiles the AST into an array of downloadable files.
     * * @param graph - The logical AST representing the visual shader.
     * @param settings - The current configuration settings for the context.
     * @param globalSettings - Application-wide settings including namespace and project name.
     * @returns A promise resolving to an array of export results.
     */
    export(graph: ShaderGraph, settings: Record<string, any>, globalSettings: { namespace: string; projectName: string }): Promise<ExportResult[]>;
}