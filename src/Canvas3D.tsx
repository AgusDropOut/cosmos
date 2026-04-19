// src/Canvas3D.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { compileShader } from './core/compiler';
import { NODE_DEFINITIONS } from './core/NodeDefinitions';
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
  
  const settingsRef = useRef(contextSettings);
  const strategyRef = useRef<IPreviewStrategy | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    settingsRef.current = contextSettings;
    if (strategyRef.current) {
        strategyRef.current.onSettingsChange(contextSettings);
    }
  }, [contextSettings]);

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
      if (strategyRef.current) strategyRef.current.dispose();
      if (materialRef.current) materialRef.current.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [activeContext]); 

  // Shader Injection 
  useEffect(() => {
    let targetGraph = graph;
    if (activeContext.id !== 'MATERIAL') {
        targetGraph = globalMaterial;
    }

    console.log("Canvas3D: Received Graph Update", targetGraph);

    if (!materialRef.current) {
        console.warn("Canvas3D: materialRef is null. Bailing out.");
        return;
    }

    if (!targetGraph.nodes || targetGraph.nodes.length === 0) {
        console.warn("Canvas3D: targetGraph has no nodes. Bailing out.");
        return;
    }

    try {
      console.log("Canvas3D: Attempting to compile shader...");
      const { vertexShader, fragmentShader } = compileShader(targetGraph);

      console.log("--- GENERATED VERTEX SHADER ---");
      console.log(vertexShader);
      
      console.log("--- GENERATED FRAGMENT SHADER ---");
      console.log(fragmentShader);

      materialRef.current.vertexShader = vertexShader;
      materialRef.current.fragmentShader = fragmentShader;
      materialRef.current.needsUpdate = true;
      
      console.log("Canvas3D: Shader successfully injected into material.");
    } catch (e) {
      console.error("Cosmos: Shader injection failed heavily during compilation:", e);
    }
  }, [graph, globalMaterial, activeContext.id]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}