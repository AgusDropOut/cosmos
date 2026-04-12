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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // EFFECT 1: Setup Scene (Runs Once)
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e1e1e');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.debug.checkShaderErrors = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.ShaderMaterial({
      vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `void main() { gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0); }`
    });
    
    const cube = new THREE.Mesh(geometry, material);
    meshRef.current = cube; 
    scene.add(cube);

    const animate = (time: number) => {
      requestAnimationFrame(animate);
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.005;
        
        // Update time if material supports it
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        if (mat.uniforms && mat.uniforms.u_time) {
          mat.uniforms.u_time.value = time * 0.001;
        }
      }
      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      renderer.dispose();
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // EFFECT 2: The Material Injector (Runs every graph change)
  useEffect(() => {
    // Check if everything is ready
    if (!meshRef.current || !graph.nodes || graph.nodes.length === 0) {
        console.log("Canvas3D: Waiting for valid graph data...");
        return;
    }

    try {
      const { vertexShader, fragmentShader } = compileShader(graph);
      console.log("Cosmos: Injecting new shader...");

      const newMaterial = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0 } },
        vertexShader,
        fragmentShader
      });

      // Swap
      const oldMaterial = meshRef.current.material as THREE.Material;
      meshRef.current.material = newMaterial;
      oldMaterial.dispose();
      
      console.log("Cosmos: Material swap successful.");
    } catch (e) {
      console.error("Cosmos: Shader injection failed", e);
    }
  }, [graph]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}