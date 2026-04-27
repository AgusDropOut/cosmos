// src/components/editor/PortPreviewCanvas.tsx
import { useMemo } from 'react';
import { useNodes, useEdges } from 'reactflow';
import * as THREE from 'three';
import { compileShader } from '../../core/compiler';
import { GLSLCanvas } from './GLSLCanvas';
import { useIDEConfig } from '../../core/hooks/useIDEConfig';
import { computeLogicalHash } from '../../core/utils/hash';
import type { ShaderGraph, NodeType, ShaderNode, ShaderConnection } from '../../types/ast';

interface PortPreviewCanvasProps {
    nodeId: string;
    outputId: string;
    outputType: string;
}

export function PortPreviewCanvas({ nodeId, outputId, outputType }: PortPreviewCanvasProps) {
    const nodes = useNodes();
    const edges = useEdges();
    const { config } = useIDEConfig();

    const logicalHash = useMemo(() => computeLogicalHash(nodes, edges), [nodes, edges]);

    const { fragmentShader, uniforms } = useMemo(() => {
        if (!config?.previews?.enabled) return { fragmentShader: '', uniforms: {} };

        const logicalNodes = nodes.filter(n => n.type !== 'OUTPUT_FRAG' && n.type !== 'OUTPUT_VERT');
        const logicalEdges = edges.filter(e => e.target !== 'OUTPUT_FRAG' && e.target !== 'OUTPUT_VERT');

        const astNodes: ShaderNode[] = logicalNodes.map((n: any) => ({
            id: n.id,
            type: n.data?.astType as NodeType,
            inputs: n.data?.inputs || [],
            outputs: n.data?.outputs || [],
            isUniform: false,
            uniformName: ''
        }));

        const astConnections: ShaderConnection[] = logicalEdges.map((e: any) => ({
            id: e.id,
            sourceNodeId: e.source,
            sourcePortId: e.sourceHandle || 'out',
            targetNodeId: e.target,
            targetPortId: e.targetHandle || 'in'
        }));

        astNodes.push({
            id: 'PREVIEW_FRAG_OUT',
            type: 'OUTPUT_FRAG',
            inputs: [
                { id: 'color', type: 'vec3', value: { r: 0, g: 0, b: 0 } },
                { id: 'alpha', type: 'float', value: 1.0 }
            ],
            outputs: [],
            isUniform: false
        });

        if (outputType === 'vec2') {
            astNodes.push({
                id: 'PREVIEW_ADAPTER',
                type: 'PACK_VEC3',
                inputs: [
                    { id: 'x', type: 'float', value: 0.0 },
                    { id: 'y', type: 'float', value: 0.0 },
                    { id: 'z', type: 'float', value: 0.0 }
                ],
                outputs: [{ id: 'out', type: 'vec3' }],
                isUniform: false
            });

            astConnections.push({ id: `edge-adp-x`, sourceNodeId: nodeId, sourcePortId: 'x', targetNodeId: 'PREVIEW_ADAPTER', targetPortId: 'x' });
            astConnections.push({ id: `edge-adp-y`, sourceNodeId: nodeId, sourcePortId: 'y', targetNodeId: 'PREVIEW_ADAPTER', targetPortId: 'y' });
            astConnections.push({ id: `edge-adp-out`, sourceNodeId: 'PREVIEW_ADAPTER', sourcePortId: 'out', targetNodeId: 'PREVIEW_FRAG_OUT', targetPortId: 'color' });
            
        } else if (outputType === 'float') {
            astNodes.push({
                id: 'PREVIEW_ADAPTER',
                type: 'PACK_VEC3',
                inputs: [
                    { id: 'x', type: 'float', value: 0.0 },
                    { id: 'y', type: 'float', value: 0.0 },
                    { id: 'z', type: 'float', value: 0.0 }
                ],
                outputs: [{ id: 'out', type: 'vec3' }],
                isUniform: false
            });

            // Map the float output to all three RGB channels to create grayscale
            astConnections.push({ id: `edge-adp-r`, sourceNodeId: nodeId, sourcePortId: outputId, targetNodeId: 'PREVIEW_ADAPTER', targetPortId: 'x' });
            astConnections.push({ id: `edge-adp-g`, sourceNodeId: nodeId, sourcePortId: outputId, targetNodeId: 'PREVIEW_ADAPTER', targetPortId: 'y' });
            astConnections.push({ id: `edge-adp-b`, sourceNodeId: nodeId, sourcePortId: outputId, targetNodeId: 'PREVIEW_ADAPTER', targetPortId: 'z' });
            
            astConnections.push({ id: `edge-adp-out`, sourceNodeId: 'PREVIEW_ADAPTER', sourcePortId: 'out', targetNodeId: 'PREVIEW_FRAG_OUT', targetPortId: 'color' });

        } else {
            astConnections.push({
                id: `edge-prev-out`,
                sourceNodeId: nodeId,
                sourcePortId: outputId, 
                targetNodeId: 'PREVIEW_FRAG_OUT',
                targetPortId: 'color'
            });
        }

        const graph: ShaderGraph = { nodes: astNodes, connections: astConnections };

        try {
            const compiled = compileShader(graph, 'web');
            console.log("Preview Compilation Successful for", nodeId);
            const parsedUniforms: Record<string, any> = { u_time: { value: 0 } };
            
            if (compiled.uniforms) {
                Object.entries(compiled.uniforms).forEach(([name, data]: [string, any]) => {
                    let val = data.value !== undefined ? data.value : 1.0;
                    if (data.type === 'vec3' && typeof val === 'object') {
                        val = new THREE.Color(val.r, val.g, val.b);
                    }
                    parsedUniforms[name] = { value: val };
                });
            }

            return { fragmentShader: compiled.fragmentShader, uniforms: parsedUniforms };
        } catch (e) {
            console.error(`Preview Compilation Failed for ${nodeId}`, e);
            return { fragmentShader: '', uniforms: {} };
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logicalHash, nodeId, outputId, outputType, config?.previews?.enabled]);

    if (!config?.previews?.enabled || !fragmentShader) return null;

    const resolution = config?.previews?.resolution || 128;

    return (
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: `${resolution}px`, height: `${resolution}px` }}>
                <GLSLCanvas fragmentShader={fragmentShader} uniforms={uniforms} height={`${resolution}px`} />
            </div>
        </div>
    );
}