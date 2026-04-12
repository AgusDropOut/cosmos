import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { compileShader } from './core/compiler';
import type { ShaderGraph } from './types/ast';

export default function Canvas3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Defines the Mock AST Graph
    const mockGraph: ShaderGraph = {
      nodes: [
        {
          id: 'color-1',
          type: 'COLOR',
          inputs: [{ id: 'rgb', type: 'vec3', value: { r: 0.0, g: 0.9, b: 0.1 } }],
          outputs: [{ id: 'out', type: 'vec3' }]
        },
        {
          id: 'noise-1',
          type: 'NOISE',
          inputs: [{ id: 'scale', type: 'float', value: 10.0 }],
          outputs: [{ id: 'out', type: 'float' }]
        },
        {
          id: 'mult-1',
          type: 'MULTIPLY',
          inputs: [
            { id: 'a', type: 'vec3' },
            { id: 'b', type: 'float' }
          ],
          outputs: [{ id: 'out', type: 'vec3' }]
        },
        {
          id: 'out-1',
          type: 'OUTPUT_FRAG',
          inputs: [{ id: 'color', type: 'vec3' }],
          outputs: []
        }
      ],
      connections: [
        { id: 'c1', sourceNodeId: 'color-1', sourcePortId: 'out', targetNodeId: 'mult-1', targetPortId: 'a' },
        { id: 'c2', sourceNodeId: 'noise-1', sourcePortId: 'out', targetNodeId: 'mult-1', targetPortId: 'b' },
        { id: 'c3', sourceNodeId: 'mult-1', sourcePortId: 'out', targetNodeId: 'out-1', targetPortId: 'color' }
      ]
    };

    // Compiles the Graph
    const { vertexShader, fragmentShader } = compileShader(mockGraph);
    
    console.log("--- Cosmos Engine: Generated Fragment Shader ---");
    console.log(fragmentShader);

    // Sets up Three.js environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e1e1e');

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);

    // Injects compiled shaders into the material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader
    });

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
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100vh', display: 'block' }}
    />
  );
}