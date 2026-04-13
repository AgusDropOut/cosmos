// src/types/ast.ts (additions)
import type { NodeStrategy } from './compiler';

// Define the shape of the UI controls
export interface NodeControl {
  id: string;        // e.g., 'scale'
  label: string;     // e.g., 'Scale'
  type: 'slider' | 'color'; // What kind of UI widget to render
  min?: number;
  max?: number;
  step?: number;
}

// The Universal Definition
export interface NodeDefinition {
  type: NodeType;               // The internal ID (e.g., 'NOISE')
  label: string;                // The display name (e.g., 'Procedural Noise')
  color: string;                // Theme color for the header and ports
  inputs: { id: string, type: GLSLType, control?: NodeControl, default: any }[];
  outputs: { id: string, type: GLSLType }[];
  strategy: NodeStrategy;       // The GLSL compilation instructions
}