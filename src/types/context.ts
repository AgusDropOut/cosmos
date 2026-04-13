// src/types/context.ts
import type { Node } from 'reactflow';
import React from 'react';
import type * as THREE from 'three';

// Data passed to the context when initializing the 3D scene
export interface RenderContext {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    material: THREE.ShaderMaterial;
}

// The lifecycle hooks for the 3D preview
export interface IPreviewStrategy {
    init: (ctx: RenderContext, settings: Record<string, any>) => void;
    update: (time: number, settings: Record<string, any>) => void;
    onSettingsChange: (settings: Record<string, any>) => void;
    dispose: () => void;
}

export interface IProjectContext {
    id: string;
    name: string;
    getInitialNodes: () => Node[];
    isNodeAllowed: (nodeType: string) => boolean;
    SettingsPanel: React.FC<{
        settings: Record<string, any>;
        onSettingChange: (key: string, value: any) => void;
    }>;
    
    createPreviewStrategy: () => IPreviewStrategy;
}