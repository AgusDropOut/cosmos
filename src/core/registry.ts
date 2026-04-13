// src/core/registry.ts
import type { NodeType } from '../types/ast';
import type { NodeStrategy } from '../types/compiler';
import { NODE_DEFINITIONS } from './NodeDefinitions';


export const NodeRegistry: Record<NodeType, NodeStrategy> = Object.keys(NODE_DEFINITIONS).reduce((acc, key) => {
    acc[key as NodeType] = NODE_DEFINITIONS[key].strategy;
    return acc;
}, {} as Record<NodeType, NodeStrategy>);