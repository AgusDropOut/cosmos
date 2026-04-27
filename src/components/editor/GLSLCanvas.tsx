import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { IProjectContext } from '../../types/context';
import type { ShaderGraph } from '../../types/ast';

interface GLSLCanvasProps {
    fragmentShader: string;
    vertexShader?: string;
    uniforms: Record<string, any>;
    graph?: ShaderGraph;   
    height?: string;
    backgroundColor?: string;
    context?: IProjectContext;
    settings?: any;
}

export function GLSLCanvas({ 
    fragmentShader, 
    vertexShader, 
    uniforms, 
    graph,
    height = '140px', 
    backgroundColor = '#0a0a0a', 
    context, 
    settings 
}: GLSLCanvasProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (!mountRef.current || !fragmentShader) return;
        mountRef.current.innerHTML = '';
        
        const width = mountRef.current.clientWidth || 280;
        const h = mountRef.current.clientHeight || parseInt(height);
        const aspect = width / h;

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        const perspCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        perspCamera.position.z = 4;

        const orthoCamera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
        orthoCamera.position.z = 1;

        const standardVertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv; 
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader || standardVertexShader,
            fragmentShader: fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false 
        });

        let strategy: any = null;
        let geometry: THREE.BufferGeometry | null = null;

        if (context) {
            strategy = context.createPreviewStrategy();
            const safeSettings = settings || { shape: 'CUBE' };
            strategy.init({ scene, camera: perspCamera, material }, safeSettings);
        } else {
            geometry = new THREE.PlaneGeometry(2 * aspect, 2);
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }

        const animate = (time: number) => {
            requestRef.current = requestAnimationFrame(animate);
            if (material.uniforms.u_time) {
                material.uniforms.u_time.value = time * 0.001;
            }

            if (strategy && strategy.update) {
                strategy.update(time, settings || { shape: 'CUBE' }, graph);
            }

            const activeCamera = (context && settings?.shape !== '2D_QUAD') ? perspCamera : orthoCamera;
            renderer.render(scene, activeCamera);
        };
        
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestRef.current);
            renderer.dispose();
            if (geometry) geometry.dispose();
            if (strategy && strategy.dispose) strategy.dispose();
            material.dispose();
            if (mountRef.current) mountRef.current.innerHTML = '';
        };

    }, [fragmentShader, vertexShader, uniforms, graph, height, context, settings]);

    return (
        <div 
            ref={mountRef} 
            style={{ 
                width: '100%', 
                height: height, 
                background: backgroundColor, 
                borderRadius: '4px', 
                border: '1px solid #333',
                overflow: 'hidden'
            }} 
        />
    );
}