// tests/unit/compiler.spec.ts
import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { serializeValue, compileShader, MathCompiler } from '../../src/core/compiler';
import type { ShaderGraph } from '../../src/types/ast';

describe('Cosmos Engine: Compiler Output', () => {

    /* Evaluates the deterministic translation of primitive values to GLSL strings. */
    describe('serializeValue', () => {
        it('appends decimals to whole numbers for float types', () => {
            expect(serializeValue(5, 'float')).toBe('5.0');
            expect(serializeValue(3.1415, 'float')).toBe('3.1415');
        });

        it('formats vec2 and vec3 objects strictly to three decimal places', () => {
            expect(serializeValue({ x: 1, y: 0.5 }, 'vec2')).toBe('vec2(1.000, 0.500)');
            expect(serializeValue({ r: 0.1, g: 0.82, b: 1 }, 'vec3')).toBe('vec3(0.100, 0.820, 1.000)');
        });

        it('provides safe fallback strings for null or undefined values', () => {
            expect(serializeValue(null, 'vec3')).toBe('vec3(0.0)');
            expect(serializeValue(undefined, 'float')).toBe('0.0');
            expect(serializeValue(null, 'string')).toBe('');
        });
    });

    /* Validates tree traversal and string resolution for inline parser evaluation utilizing registered node types. */
    describe('MathCompiler', () => {
        it('resolves disconnected ports to their serialized default values', () => {
            const mockGraph: ShaderGraph = {
                nodes: [
                    { 
                        id: 'target_1', 
                        type: 'FLOAT', 
                        inputs: [{ id: 'val', type: 'float', value: 42 }], 
                        outputs: [{ id: 'out', type: 'float' }], 
                        data: {} 
                    }
                ],
                connections: []
            };

            const mathCompiler = new MathCompiler(mockGraph);
            const result = mathCompiler.compilePort('target_1', 'val');
            
            expect(result).toBe('42.0');
        });
    });

    /*  tests comparing full AST compilation against expected file outputs utilizing registered endpoint nodes. */
    describe('Integration: compileShader', () => {
        const fixtureGraph: ShaderGraph = {
            nodes: [
                { 
                    id: 'float_1', 
                    type: 'FLOAT', 
                    inputs: [{ id: 'val', type: 'float', value: 1.0 }], 
                    outputs: [{ id: 'out', type: 'float' }], 
                    data: {} 
                },
                { 
                    id: 'frag_out', 
                    type: 'OUTPUT_FRAG', 
                    inputs: [
                        { id: 'color', type: 'vec3', value: { r: 0, g: 0, b: 0 } },
                        { id: 'alpha', type: 'float', value: 1.0 }
                    ], 
                    outputs: [], 
                    data: {} 
                }
            ],
            connections: [
                { 
                    id: 'c1', 
                    sourceNodeId: 'float_1', 
                    sourcePortId: 'out', 
                    targetNodeId: 'frag_out', 
                    targetPortId: 'color' 
                }
            ]
        };

        it('generates predictable WebGL target output', () => {
            const result = compileShader(fixtureGraph, 'web');
            const expectedFshPath = path.resolve(__dirname, './fixtures/expected/web_output.fsh');
            const expectedVshPath = path.resolve(__dirname, './fixtures/expected/web_output.vsh');

            expect(result.fragmentShader).toMatchFileSnapshot(expectedFshPath);
            expect(result.vertexShader).toMatchFileSnapshot(expectedVshPath);
        });

        it('generates predictable Minecraft target output with replaced semantics', () => {
            const result = compileShader(fixtureGraph, 'minecraft');
            const expectedFshPath = path.resolve(__dirname, './fixtures/expected/minecraft_output.fsh');
            const expectedVshPath = path.resolve(__dirname, './fixtures/expected/minecraft_output.vsh');

            expect(result.fragmentShader).toMatchFileSnapshot(expectedFshPath);
            expect(result.vertexShader).toMatchFileSnapshot(expectedVshPath);
        });
    });
});