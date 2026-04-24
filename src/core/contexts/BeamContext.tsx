// src/core/contexts/BeamContext.tsx
import React from 'react';
import * as THREE from 'three';
import type { IProjectContext, IPreviewStrategy, RenderContext } from '../../types/context';
import type { Node } from 'reactflow';
import type { ShaderGraph } from '../../types/ast';
import { AstEvaluator } from '../compiler';
import { BeamGeometryGenerator } from '../shapes/BeamGeometryGenerator';
import { BeamExporter } from '../exporter/BeamExporter';

export const BeamContext: IProjectContext = {
    id: 'BEAM',
    name: 'Magic Beam',
    
     getExporter: () => new BeamExporter(),

    getInitialNodes: (): Node[] => [
        { 
            id: 'beam-out-1', 
            type: 'BEAM_ENDPOINT', 
            position: { x: 600, y: 150 }, 
            data: { 
                astType: 'BEAM_ENDPOINT', 
                inputs: [
                    { id: 'radius_curve', type: 'float', value: 0.5 }
                ], 
                outputs: [] 
            } 
        }
    ],

    isNodeAllowed: (nodeType: string) => {
        const allowedMathNodes = [
            'BEAM_ENDPOINT',
            'TIME',
            'MATH_BINARY',
            'MATH_UNARY',
            'VECTOR_MATH',
            'VECTOR_SCALAR_MATH',
            'SPLIT_VEC2',
            'PACK_VEC2',
            'PACK_VEC3',
            'UV_COORDS'
        ];
        return allowedMathNodes.includes(nodeType);
    },

    SettingsPanel: ({ settings, onSettingChange }) => {
        const radialSegments = settings.radialSegments || 6;
        const lengthSegments = settings.lengthSegments || 20;

        return (
            <>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>BEAM STRUCTURE</div>
                
                <label style={{ fontSize: '11px', color: '#ccc', display: 'block', marginTop: '10px' }}>
                    Radial Segments (Shape): {radialSegments}
                    <input 
                        type="range" min="3" max="32" step="1" value={radialSegments} 
                        onChange={(e) => onSettingChange('radialSegments', parseInt(e.target.value))} 
                        style={{ width: '100%', marginTop: '4px' }}
                    />
                </label>
                <div style={{ fontSize: '9px', color: '#888', marginBottom: '10px' }}>3 = Triangle, 4 = Square, 16+ = Cylinder</div>

                <label style={{ fontSize: '11px', color: '#ccc', display: 'block' }}>
                    Length Segments (Smoothness): {lengthSegments}
                    <input 
                        type="range" min="1" max="50" step="1" value={lengthSegments} 
                        onChange={(e) => onSettingChange('lengthSegments', parseInt(e.target.value))} 
                        style={{ width: '100%', marginTop: '4px' }}
                    />
                </label>
            </>
        );
    },

    createPreviewStrategy: (): IPreviewStrategy => {
        let beamMesh: THREE.Mesh | null = null;
        let casterMesh: THREE.Mesh | null = null;
        let targetMesh: THREE.Mesh | null = null;
        let grid: THREE.GridHelper | null = null;
        
        const beamGenerator = new BeamGeometryGenerator();

        return {
            init: ({ scene, material, camera }: RenderContext) => {
                //  Setup the Beam
                material.side = THREE.DoubleSide;
                beamMesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
                scene.add(beamMesh);

                //  Setup the Environment
                grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
                grid.position.y = -2;
                scene.add(grid);

                //  Setup Caster (Where beam starts)
                const casterGeo = new THREE.OctahedronGeometry(0.5);
                const casterMat = new THREE.MeshBasicMaterial({ color: 0x4dabf7, wireframe: true });
                casterMesh = new THREE.Mesh(casterGeo, casterMat);
                casterMesh.position.set(-4, 0, 0);
                scene.add(casterMesh);

                // 4. Setup Target 
                const targetGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                const targetMat = new THREE.MeshBasicMaterial({ color: 0xff6b6b, wireframe: true });
                targetMesh = new THREE.Mesh(targetGeo, targetMat);
                scene.add(targetMesh);

                // Camera positioning for a cinematic side-view
                camera.position.set(0, 3, 10);
                camera.lookAt(0, 0, 0);
            },
            update: (time: number, settings: Record<string, any>, graph?: ShaderGraph) => {
                if (beamMesh && casterMesh && targetMesh) {
                    const t = time * 0.001; // Match u_time scaling

                    //  Animate the Caster and Target to prove the beam tracks dynamically
                    casterMesh.position.y = Math.sin(t * 2.0) * 1.5;
                    casterMesh.rotation.y += 0.05;

                    targetMesh.position.set(5, Math.cos(t * 1.5) * 2.0, Math.sin(t) * 2.0);
                    targetMesh.rotation.x += 0.05;
                    targetMesh.rotation.y += 0.05;

                    //  Setup the AST Evaluator for this exact frame
                    let evaluator: AstEvaluator | null = null;
                    let endpointId: string | null = null;

                    if (graph) {
                        const endpoint = graph.nodes.find(n => n.type === 'BEAM_ENDPOINT');
                        if (endpoint) {
                            evaluator = new AstEvaluator(graph, t);
                            endpointId = endpoint.id;
                        }
                    }

                    // Generate the geometry using our callback!
                    const oldGeo = beamMesh.geometry;
                    beamMesh.geometry = beamGenerator.update(
                       casterMesh.position,
                        targetMesh.position,
                        settings.radialSegments || 6,
                        settings.lengthSegments || 20,
                        (v: number) => { // Removed 'u' here!
                            let radius = 0.5;
                            let offset = new THREE.Vector3(0, 0, 0);

                            if (evaluator && endpointId) {
                                // We inject 'v' into the evaluator so nodes know how far down the beam they are
                                // NOTE: UV_COORDS node will map this to 'y'. So UV_COORDS.y = v.
                                evaluator.setGlobals({ u: 0, v: v }); 

                                const evaluatedRadius = evaluator.evaluatePort(endpointId, 'radius_curve');
                                if (typeof evaluatedRadius === 'number') radius = evaluatedRadius;

                                const evaluatedOffset = evaluator.evaluatePort(endpointId, 'position_offset');
                                if (evaluatedOffset && (evaluatedOffset.x !== undefined || evaluatedOffset.r !== undefined)) {
                                    offset.set(
                                        evaluatedOffset.x ?? evaluatedOffset.r ?? 0,
                                        evaluatedOffset.y ?? evaluatedOffset.g ?? 0,
                                        evaluatedOffset.z ?? evaluatedOffset.b ?? 0
                                    );
                                }
                            }
                            return { radius, offset };
                        }
                    );
                    oldGeo.dispose();
                }
            },
            onSettingsChange: () => {}, 
            dispose: () => {
                if (beamMesh) { beamMesh.geometry.dispose(); beamMesh.removeFromParent(); }
                if (casterMesh) { casterMesh.geometry.dispose(); casterMesh.removeFromParent(); }
                if (targetMesh) { targetMesh.geometry.dispose(); targetMesh.removeFromParent(); }
                if (grid) { grid.geometry.dispose(); grid.removeFromParent(); }
            }
        };
    }
};