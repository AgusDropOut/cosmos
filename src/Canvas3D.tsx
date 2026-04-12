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
  const meshRef = useRef<THREE.Mesh | null>(null);
  const requestRef = useRef<number>(0); // To stop the ghost loops

  // etup Scene
  useEffect(() => {
    if (!mountRef.current) return;

    
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e1e1e');

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.debug.checkShaderErrors = true;
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    
   
    const material = new THREE.ShaderMaterial({
      vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `void main() { gl_FragColor = vec4(0.5, 0.0, 0.5, 1.0); }`
    });
    
    const cube = new THREE.Mesh(geometry, material);
    meshRef.current = cube; 
    scene.add(cube);

    const animate = (time: number) => {
      
      requestRef.current = requestAnimationFrame(animate);
      
      if (cube) {
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
        
       
        if (cube.material instanceof THREE.ShaderMaterial && cube.material.uniforms.u_time) {
          cube.material.uniforms.u_time.value = time * 0.001;
        }
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
      //  Kill the loop and the DOM
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []); 

  // Material Injector
  useEffect(() => {
    if (!meshRef.current || !graph.nodes || graph.nodes.length === 0) return;

    try {
      const { vertexShader, fragmentShader } = compileShader(graph);
      console.log("Cosmos: Injecting new shader...");

      const newMaterial = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0 } },
        vertexShader,
        fragmentShader
      });

    
      const oldMaterial = meshRef.current.material as THREE.Material;
      meshRef.current.material = newMaterial;
      
      
      meshRef.current.material.needsUpdate = true;
      
      oldMaterial.dispose();
      console.log("Cosmos: Material swap successful.");
    } catch (e) {
      console.error("Cosmos: Shader injection failed", e);
    }
  }, [graph]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}