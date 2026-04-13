// src/Canvas3D.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { compileShader } from './core/compiler';
import type { ShaderGraph } from './types/ast';
import type { IProjectContext, IPreviewStrategy } from './types/context'; 

interface Canvas3DProps {
  graph: ShaderGraph;
  contextSettings: Record<string, any>;
  activeContext: IProjectContext;
  globalMaterial: ShaderGraph;
}

export default function Canvas3D({ graph, contextSettings, activeContext, globalMaterial }: Canvas3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  
  // Mutable references for the animation loop
  const settingsRef = useRef(contextSettings);
  const strategyRef = useRef<IPreviewStrategy | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Sync settings for the animation loop and trigger strategy updates
  useEffect(() => {
    settingsRef.current = contextSettings;
    if (strategyRef.current) {
        strategyRef.current.onSettingsChange(contextSettings);
    }
  }, [contextSettings]);

  // Scene Setup & Strategy Execution
  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }`,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false
    });
    materialRef.current = material;

    // Initialize the specific context strategy
    strategyRef.current = activeContext.createPreviewStrategy();
    strategyRef.current.init({ scene, camera, material }, settingsRef.current);

    const animate = (time: number) => {
        requestRef.current = requestAnimationFrame(animate);
        
        if (materialRef.current?.uniforms.u_time) {
            materialRef.current.uniforms.u_time.value = time * 0.001;
        }

        if (strategyRef.current) {
            strategyRef.current.update(time, settingsRef.current);
        }

        renderer.render(scene, camera);
    };
    
    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current) return;
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (strategyRef.current) {
          strategyRef.current.dispose();
      }
      if (materialRef.current) {
          materialRef.current.dispose();
      }
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [activeContext]); // Rebuild scene entirely on context switch

  // Shader Injection
  useEffect(() => {
    if (!materialRef.current || !graph.nodes || graph.nodes.length === 0) return;

    try {
      const { vertexShader, fragmentShader } = compileShader(graph);

      materialRef.current.vertexShader = vertexShader;
      materialRef.current.fragmentShader = fragmentShader;
      materialRef.current.needsUpdate = true;
    } catch (e) {
      console.error("Cosmos: Shader injection failed", e);
    }
  }, [graph]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}