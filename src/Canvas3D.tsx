// src/Canvas3D.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { compileShader } from './core/compiler';
import type { ShaderGraph } from './types/ast';

interface Canvas3DProps {
  graph: ShaderGraph;
  shape: string; 
}

// Helper function to generate Three.js geometries based on a string key
const getGeometry = (shapeType: string): THREE.BufferGeometry => {
  switch (shapeType) {
    case 'SPHERE':
      return new THREE.SphereGeometry(0.6, 32, 32);
    case 'ICOSAHEDRON':
      return new THREE.IcosahedronGeometry(0.6, 0);
    case 'CYLINDER':
      return new THREE.CylinderGeometry(0.5, 0.5, 1.0, 32);
    case 'CUBE':
    default:
      return new THREE.BoxGeometry(0.8, 0.8, 0.8);
  }
};

export default function Canvas3D({ graph, shape }: Canvas3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const requestRef = useRef<number>(0);

  // EFFECT 1: Setup Scene
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

    
    const geometry = getGeometry(shape);
    
    const material = new THREE.ShaderMaterial({
      vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `void main() { gl_FragColor = vec4(0.5, 0.0, 0.5, 1.0); }`
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh; 
    scene.add(mesh);

    const animate = (time: number) => {
      requestRef.current = requestAnimationFrame(animate);
      
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.005;
        
        if (meshRef.current.material instanceof THREE.ShaderMaterial && meshRef.current.material.uniforms.u_time) {
          meshRef.current.material.uniforms.u_time.value = time * 0.001;
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
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        (meshRef.current.material as THREE.Material).dispose();
      }
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []); 

  // EFFECT 2: Material Injector (Runs on graph change)
  useEffect(() => {
    if (!meshRef.current || !graph.nodes || graph.nodes.length === 0) return;

    try {
      const { vertexShader, fragmentShader } = compileShader(graph);

      const newMaterial = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0 } },
        vertexShader,
        fragmentShader
      });

      const oldMaterial = meshRef.current.material as THREE.Material;
      meshRef.current.material = newMaterial;
      meshRef.current.material.needsUpdate = true;
      
      oldMaterial.dispose();
    } catch (e) {
      console.error("Cosmos: Shader injection failed", e);
    }
  }, [graph]);

  // EFFECT 3: Geometry Swap (Runs on shape change)
  useEffect(() => {
    if (!meshRef.current) return;

    const oldGeometry = meshRef.current.geometry;
    meshRef.current.geometry = getGeometry(shape);
    
    // Dispose the old geometry to prevent memory leaks in the GPU
    oldGeometry.dispose();
  }, [shape]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}