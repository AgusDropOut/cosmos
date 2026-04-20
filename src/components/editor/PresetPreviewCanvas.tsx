// src/components/editor/PresetPreviewCanvas.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { compileShader } from '../../core/compiler';
import type { ShaderGraph } from '../../types/ast';
import type { IProjectContext } from '../../types/context';
import type { IPreset } from '../../types/preset';

interface PresetPreviewCanvasProps {
  preset: IPreset;
  context: IProjectContext;
}

/* This component renders a small WebGL canvas that provides a live preview of what a preset looks like.
* It takes a preset and the active context as props, compiles the shader graph defined in the preset, and uses the context's preview strategy to render it.
* This allows users to see a visual representation of the preset before applying it, making it easier to choose the right one. */

export function PresetPreviewCanvas({ preset, context }: PresetPreviewCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const width = mountRef.current.clientWidth || 280;
    const height = mountRef.current.clientHeight || 140;

    const scene = new THREE.Scene();
    
   
    const perspCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    perspCamera.position.z = 5;

    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    orthoCamera.position.z = 1;

  
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

  
    const graph: ShaderGraph = {
        nodes: preset.nodes.map(n => ({
            id: n.id,
            type: n.data.astType,
            inputs: n.data.inputs || [],
            outputs: n.data.outputs || []
        })),
        connections: (preset.edges as any[]).map(e => ({
            id: e.id,
            sourceNodeId: e.source,
            sourcePortId: e.sourceHandle || 'out',
            targetNodeId: e.target,
            targetPortId: e.targetHandle || 'in'
        }))
    };

    const { vertexShader, fragmentShader } = compileShader(graph);

    const material = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0 } },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false 
    });

    
    const strategy = context.createPreviewStrategy();
    strategy.init({ scene, camera: perspCamera, material }, preset.settings);

  
    const animate = (time: number) => {
        requestRef.current = requestAnimationFrame(animate);
        
        material.uniforms.u_time.value = time * 0.001;

        if (strategy.update) {
            strategy.update(time, preset.settings);
        }

       
        const activeCamera = preset.settings.shape === '2D_QUAD' ? orthoCamera : perspCamera;
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
  }, [preset, context]);

  return (
    <div 
        ref={mountRef} 
        style={{ 
            width: '100%', 
            height: '140px', 
            background: '#050505', 
            borderRadius: '4px', 
            marginTop: '12px', 
            border: '1px solid #333',
            overflow: 'hidden'
        }} 
    />
  );
}