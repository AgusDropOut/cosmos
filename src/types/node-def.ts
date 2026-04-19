// src/types/node-def.ts
import type { NodeType, GLSLType } from './ast';
import type { NodeStrategy } from './compiler';

export interface NodeControl {
  id: string;
  label: string;
  type: 'slider' | 'color-rgb' | 'none'| 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}


export interface NodeDefinition {
  type: NodeType;
  label: string;
  color: string;
  inputs: { 
    id: string; 
    type: GLSLType; 
    default: any;
    control?: NodeControl;
  }[];
  outputs: { id: string; type: GLSLType }[];
  strategy: NodeStrategy;
}