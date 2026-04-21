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
  
  const settingsRef = useRef(contextSettings);
  const strategyRef = useRef<IPreviewStrategy | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    settingsRef.current = contextSettings;
    if (strategyRef.current && strategyRef.current.onSettingsChange) {
        strategyRef.current.onSettingsChange(contextSettings);
    }
  }, [contextSettings]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    
   
    const perspCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    perspCamera.position.z = 5;

    
    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    orthoCamera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
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
    
    strategyRef.current.init({ scene, camera: perspCamera, material }, settingsRef.current);

    const animate = (time: number) => {
        requestRef.current = requestAnimationFrame(animate);
        
        if (materialRef.current?.uniforms.u_time) {
            materialRef.current.uniforms.u_time.value = time * 0.001;
        }

        if (strategyRef.current && strategyRef.current.update) {
            strategyRef.current.update(time, settingsRef.current);
        }

        // select the camera right before rendering
        const activeCamera = settingsRef.current.shape === '2D_QUAD' ? orthoCamera : perspCamera;
        renderer.render(scene, activeCamera);
    };
    
    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      
      renderer.setSize(newWidth, newHeight);
      
      // Update the 3D camera aspect ratio 
      perspCamera.aspect = newWidth / newHeight;
      perspCamera.updateProjectionMatrix();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (strategyRef.current && strategyRef.current.dispose) strategyRef.current.dispose();
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

    if (!materialRef.current || !targetGraph.nodes || targetGraph.nodes.length === 0) return;

    try {
      const { vertexShader, fragmentShader } = compileShader(targetGraph);
      materialRef.current.vertexShader = vertexShader;
      materialRef.current.fragmentShader = fragmentShader;
      materialRef.current.needsUpdate = true;
    } catch (e) {
      console.error("Cosmos: Shader injection failed:", e);
    }
  }, [graph, globalMaterial, activeContext.id]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}