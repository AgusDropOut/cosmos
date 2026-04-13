// src/types/context.ts
import type { Node } from 'reactflow';
import React from 'react';
import type * as THREE from 'three';
import type { IWorkspaceExporter } from './export';

export interface RenderContext {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    material: THREE.ShaderMaterial;
}

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
    
  
    getExporter: () => IWorkspaceExporter | null; 
}