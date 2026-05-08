// src/types/context.ts
import type { Node } from 'reactflow';
import React from 'react';
import type * as THREE from 'three';
import type { IWorkspaceExporter } from './export';
import type { ShaderGraph } from './ast';

/**
 * Provides the core Three.js components required to initialize and render a 3D preview.
 * * @property scene - The Three.js scene graph object.
 * @property camera - The default perspective camera for the viewport.
 * @property material - The shader material instance that will be updated by the AST.
 */
export interface RenderContext {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    material: THREE.ShaderMaterial;
}

/**
 * Defines the lifecycle and rendering logic for a specific visual context in the 3D canvas.
 */
export interface IPreviewStrategy {
    /**
     * Called once when the preview canvas is mounted or the context is switched.
     * * @param ctx - The rendering context containing the scene, camera, and material.
     * @param settings - The current configuration settings for this context.
     */
    init: (ctx: RenderContext, settings: Record<string, any>) => void;

    /**
     * Called every frame to animate and update the preview logic.
     * * @param time - The elapsed time in milliseconds.
     * @param settings - The current configuration settings for this context.
     * @param graph - Optional reference to the current AST for real-time mathematical evaluation.
     */
    update: (time: number, settings: Record<string, any>, graph?: ShaderGraph) => void;

    /**
     * Called when a configuration parameter is modified in the context's SettingsPanel.
     * * @param settings - The updated configuration settings object.
     */
    onSettingsChange: (settings: Record<string, any>) => void;

    /**
     * Called to safely dispose of geometry, materials, and helpers to prevent memory leaks.
     */
    dispose: () => void;
}

/**
 * Represents an isolated environment within the engine (e.g., Material, Trail, Beam).
 * Encapsulates context-specific logic, UI, and rendering rules to maintain extensibility.
 */
export interface IProjectContext {
    /** * @property id - Unique identifier for the context. 
     */
    id: string;

    /** * @property name - Display name used in the user interface. 
     */
    name: string;

    /** * @property requiresGlobalMaterial - Indicates if this context relies on the compiled shader from the global MATERIAL context. 
     */
    requiresGlobalMaterial?: boolean;

    /**
     * Determines if the current settings require an orthographic camera projection.
     * * @param settings - The current configuration settings for the context.
     * @returns True if an orthographic camera should be used, false otherwise.
     */
    isOrthographic?: (settings: Record<string, any>) => boolean;

    /**
     * Generates the default workspace layout.
     * * @returns An array of initial React Flow nodes.
     */
    getInitialNodes: () => Node[];

    /**
     * Evaluates whether a specific AST node type is permitted within this context.
     * * @param nodeType - The string identifier of the node type to check.
     * @returns True if the node is permitted, false otherwise.
     */
    isNodeAllowed: (nodeType: string) => boolean;

    /** * @property SettingsPanel - React component rendering the specific configuration controls for this context. 
     */
    SettingsPanel: React.FC<{
        settings: Record<string, any>;
        onSettingChange: (key: string, value: any) => void;
    }>;

    /**
     * Instantiates the Three.js rendering strategy for the 3D preview.
     * * @returns A new instance of the preview strategy.
     */
    createPreviewStrategy: () => IPreviewStrategy;

    /**
     * Provides the fallback configuration values for the context settings.
     * * @returns A dictionary of default settings.
     */
    getDefaultSettings: () => Record<string, any>; 

    /**
     * Provides the exporter responsible for converting the AST into game-ready metadata.
     * * @returns The configured workspace exporter or null if exporting is not supported.
     */
    getExporter: () => IWorkspaceExporter | null; 
}