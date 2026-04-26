// src/Canvas3D.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ShaderGraph } from './types/ast';
import type { IProjectContext, IPreviewStrategy } from './types/context';
import { CompilerService } from './core/workers/CompilerService';

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

  
  const graphRef = useRef(graph);

  useEffect(() => {
    settingsRef.current = contextSettings;
    if (strategyRef.current && strategyRef.current.onSettingsChange) {
        strategyRef.current.onSettingsChange(contextSettings);
    }
  }, [contextSettings]);

  // Update the ref every time the user connects a wire or moves a slider
  useEffect(() => {
      graphRef.current = graph;
  }, [graph]);

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
            strategyRef.current.update(time, settingsRef.current, graphRef.current);
        }

        const activeCamera = settingsRef.current.shape === '2D_QUAD' ? orthoCamera : perspCamera;
        renderer.render(scene, activeCamera);
    };
    
    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      
      renderer.setSize(newWidth, newHeight);
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

    
    const timeoutId = setTimeout(() => {
        CompilerService.requestCompile(targetGraph, (result) => {
            if (!materialRef.current) return;

            if (result.success) {
                materialRef.current.vertexShader = result.vertexShader;
                materialRef.current.fragmentShader = result.fragmentShader;
                
                console.log("--- STARTING UNIFORM INJECTION ---");
                
                //  Iterate over result.uniforms, not result!
                Object.entries(result.uniforms || {}).forEach(([name, data]: [string, any]) => {
                    
                    //  Calculate the safe value
                    let safeValue = data.value !== undefined ? data.value : 1.0;
                    if (data.type === 'vec3' && typeof safeValue === 'object') {
                        safeValue = new THREE.Color(safeValue.r, safeValue.g, safeValue.b);
                    }

                    //  Inject or Update
                    if (!materialRef.current!.uniforms[name]) {
                        // Create it if it doesn't exist
                        materialRef.current!.uniforms[name] = { value: safeValue };
                    } else {
                        // UPDATE it if it already exists! 
                        materialRef.current!.uniforms[name].value = safeValue;
                    }
                });
                
                console.log("--- FINISHED UNIFORM INJECTION ---");
                materialRef.current.needsUpdate = true;

            } else {
                console.error("Cosmos: Shader compilation failed:", result.error);
            }
        });
    }, 150); // Wait 150ms before compiling

    return () => clearTimeout(timeoutId); // Cancel the compile if the slider moves again

  }, [graph, globalMaterial, activeContext.id]);

  useEffect(() => {
    if (!materialRef.current) return;

    const targetGraph = activeContext.id !== 'MATERIAL' ? globalMaterial : graph;

    targetGraph.nodes.forEach(node => {
       
        if (node.isUniform && node.uniformName) {
            const safeName = `u_${node.uniformName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
            const uniform = materialRef.current!.uniforms[safeName];
            
          
            if (uniform && node.inputs && node.inputs[0]) {
                const val = node.inputs[0].value;
                if (typeof val === 'object' && val.r !== undefined) {
                    uniform.value.setRGB(val.r, val.g, val.b);
                } else {
                    uniform.value = val !== undefined ? val : 1.0;
                }
            }
        }
    });
  }, [graph, globalMaterial, activeContext.id]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}