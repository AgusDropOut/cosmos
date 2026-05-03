// src/core/utils/materialUtils.ts
import * as THREE from 'three';

export const applyRenderStateToMaterial = (mat: THREE.ShaderMaterial, settings?: Record<string, any>) => {
    if (!settings) return;

    //Transparency & Blending
    const blend = settings.blend_mode || 'OPAQUE';
    mat.transparent = blend !== 'OPAQUE';
    
    if (blend === 'ADDITIVE') mat.blending = THREE.AdditiveBlending;
    else if (blend === 'MULTIPLY') mat.blending = THREE.MultiplyBlending;
    else mat.blending = THREE.NormalBlending;

    // Face Culling (Side)
    const cull = settings.cull_mode || 'BACK';
    if (cull === 'FRONT') mat.side = THREE.BackSide;
    else if (cull === 'NONE') mat.side = THREE.DoubleSide;
    else mat.side = THREE.FrontSide;

    // Depth Testing
    const depthTest = settings.depth_test || 'LEQUAL';
    mat.depthTest = depthTest !== 'ALWAYS'; 

    // Depth Writing (Z-Write)
    mat.depthWrite = settings.depth_write !== undefined ? settings.depth_write : true;

    // Alpha Cutoff
    mat.alphaTest = settings.alpha_cutoff || 0;

    mat.needsUpdate = true;
};