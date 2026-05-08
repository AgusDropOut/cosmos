// src/types/node-def.ts
import type { NodeType, GLSLType } from './ast';
import type { NodeStrategy } from './compiler';

/**
 * Defines the user interface control rendered on a node for manipulating constant input values.
 * * @property id - Optional identifier for the control. Defaults to the input port ID if omitted.
 * @property label - The text label displayed next to the control in the UI.
 * @property type - The visual representation of the control (e.g., a slider, a color picker, or a dropdown).
 * @property min - The minimum allowed value (applicable to 'slider' and 'number' types).
 * @property max - The maximum allowed value (applicable to 'slider' and 'number' types).
 * @property step - The incremental step value for adjustments (applicable to 'slider' and 'number' types).
 * @property options - An array of available string choices (applicable only to 'select' types).
 */
export interface NodeControl {
  id?: string;
  label: string;
  type: 'slider' | 'color-rgb' | 'none' | 'select' | 'number';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

/**
 * The structural blueprint used to register a mathematical or functional node within the engine.
 * Every node available in the editor must have a corresponding NodeDefinition.
 * * @property type - The unique AST identifier for the node (e.g., 'MATH_BINARY', 'TIME').
 * @property label - The human-readable display name rendered on the node's header.
 * @property color - The hexadecimal color code used to style the node's header background.
 * @property inputs - An array defining the input ports, their expected data types, default values, and optional UI controls.
 * @property outputs - An array defining the output ports and the mathematical data types they emit.
 * @property strategy - The compilation logic used to translate this node into GLSL strings and executable TypeScript math.
 * @property canHavePreview - Indicates if the node supports rendering an isolated 2D GLSL preview canvas within its body.
 */
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
  canHavePreview?: boolean;
}