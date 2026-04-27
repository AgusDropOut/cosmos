import { useMemo } from 'react';
import * as THREE from 'three';
import { compileShader } from '../../core/compiler';
import { GLSLCanvas } from './GLSLCanvas';
import type { ShaderGraph, NodeType } from '../../types/ast';
import type { IProjectContext } from '../../types/context';
import type { IPreset } from '../../types/preset';

interface PresetPreviewCanvasProps {
    preset: IPreset;
    context: IProjectContext;
}

export function PresetPreviewCanvas({ preset, context }: PresetPreviewCanvasProps) {
    // Memoize the compilation and graph generation to avoid unnecessary re-runs
    const compilationData = useMemo(() => {
        const graph: ShaderGraph = {
            nodes: preset.nodes.map((n: any) => ({
                id: n.id,
                type: (n.data?.astType || n.type) as NodeType,
                inputs: n.data?.inputs || [],
                outputs: n.data?.outputs || [],
                isUniform: n.isUniform || n.data?.isUniform,
                uniformName: n.uniformName || n.data?.uniformName
            })),
            connections: (preset.edges || []).map((e: any) => ({
                id: e.id,
                sourceNodeId: e.source,
                sourcePortId: e.sourceHandle || 'out',
                targetNodeId: e.target,
                targetPortId: e.targetHandle || 'in'
            }))
        };

        try {
            const { vertexShader, fragmentShader, uniforms } = compileShader(graph, 'web');
            const previewUniforms: Record<string, any> = { u_time: { value: 0 } };
            
            if (uniforms) {
                Object.entries(uniforms).forEach(([name, data]: [string, any]) => {
                    let val = data.value !== undefined ? data.value : 1.0;
                    if (data.type === 'vec3' && typeof val === 'object') {
                        val = new THREE.Color(val.r, val.g, val.b);
                    }
                    previewUniforms[name] = { value: val };
                });
            }

            return { vertexShader, fragmentShader, uniforms: previewUniforms, graph };
        } catch (e) {
            console.error("Cosmos: Preset Preview Compilation Error", e);
            return null;
        }
    }, [preset]);

    if (!compilationData) {
        return (
            <div style={{ width: '100%', height: '140px', background: '#1a0000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: '#ff6b6b', fontSize: '10px' }}>
                Compilation Error
            </div>
        );
    }

    return (
        <div style={{ marginTop: '12px' }}>
            <GLSLCanvas 
                fragmentShader={compilationData.fragmentShader}
                vertexShader={compilationData.vertexShader}
                uniforms={compilationData.uniforms}
                graph={compilationData.graph}
                context={context}
                settings={preset.settings}
                height="140px"
            />
        </div>
    );
}