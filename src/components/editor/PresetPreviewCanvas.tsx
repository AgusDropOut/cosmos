// src/components/editor/PresetPreviewCanvas.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { compileShader } from '../../core/compiler';
import type { ShaderGraph, NodeType } from '../../types/ast';
import type { IProjectContext } from '../../types/context';
import type { IPreset } from '../../types/preset';

interface PresetPreviewCanvasProps {
  preset: IPreset;
  context: IProjectContext;
}

export function PresetPreviewCanvas({ preset, context }: PresetPreviewCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';
    
    const width = mountRef.current.clientWidth || 280;
    const height = mountRef.current.clientHeight || 140;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const perspCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    perspCamera.position.z = 4;

    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    orthoCamera.position.z = 1;

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

        const material = new THREE.ShaderMaterial({
            uniforms: previewUniforms,
            vertexShader,
            fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false 
        });
        
        const strategy = context.createPreviewStrategy();
        const settings = preset.settings || { shape: 'CUBE' }; 
        
        strategy.init({ scene, camera: perspCamera, material }, settings);

        const animate = (time: number) => {
            requestRef.current = requestAnimationFrame(animate);
            
            if (material.uniforms.u_time) {
                material.uniforms.u_time.value = time * 0.001;
            }

            if (strategy.update) {
                strategy.update(time, settings, graph);
            }

            const activeCamera = settings.shape === '2D_QUAD' ? orthoCamera : perspCamera;
            renderer.render(scene, activeCamera);
        };
        
        requestRef.current = requestAnimationFrame(animate);

        return () => {
          cancelAnimationFrame(requestRef.current);
          renderer.dispose();
          strategy.dispose();
          material.dispose();
          if (mountRef.current) mountRef.current.innerHTML = '';
        };

    } catch (e) {
        console.error(`Preset compilation error: ${preset.name}`, e);
    }
  }, [preset, context]);

  return (
    <div 
        ref={mountRef} 
        style={{ 
            width: '100%', 
            height: '140px', 
            background: '#0a0a0a', 
            borderRadius: '4px', 
            marginTop: '12px', 
            border: '1px solid #333',
            overflow: 'hidden'
        }} 
    />
  );
}