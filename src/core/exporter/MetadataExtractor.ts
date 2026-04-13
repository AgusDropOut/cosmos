// src/core/export/MetadataExtractor.ts
import type { ShaderGraph } from '../../types/ast';
import type { CosmosMetadata, IMetadataExtractor, ExportConfig, UniformMeta } from '../../types/export';

export class MinecraftMetadataExtractor implements IMetadataExtractor {
    public extract(graph: ShaderGraph, config: ExportConfig): CosmosMetadata {
        const uniforms: Record<string, UniformMeta> = {};

        // Graph traversal detects required bindings based on active nodes
        graph.nodes.forEach(node => {
            if (node.type === 'TIME') {
                uniforms['u_time'] = { type: 'float', source: 'GAME_TIME' };
            }
        });

        return {
            name: config.name,
            vertex_format: 'POSITION_COLOR_TEX_LIGHTMAP',
            render_state: {
                transparency: config.isTranslucent ? 'TRANSLUCENT' : 'OPAQUE',
                cull: false,
                depth_test: 'LEQUAL',
                write_mask: 'COLOR_DEPTH'
            },
            uniforms
        };
    }
}