// src/Canvas3D.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { compileShader } from './core/compiler';
import type { ShaderGraph } from './types/ast';

interface Canvas3DProps {
  graph: ShaderGraph;
}

export default function Canvas3D({ graph }: Canvas3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  

  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e1e1e');

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);

 
    const material = new THREE.ShaderMaterial({
      vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `void main() { gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0); }`
    });
    
    materialRef.current = material; 
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // EFFECT 2: Recompile the Shader (Runs ONLY when 'graph' changes)
  useEffect(() => {
    if (!materialRef.current || graph.nodes.length === 0) return;

    try {
      const { vertexShader, fragmentShader } = compileShader(graph);
      materialRef.current.vertexShader = vertexShader;
      materialRef.current.fragmentShader = fragmentShader;
      materialRef.current.needsUpdate = true; 
    } catch (e) {
      console.error("Cosmos Compilation Error:", e);
    }
  }, [graph]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}