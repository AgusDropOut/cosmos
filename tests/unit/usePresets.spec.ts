// @vitest-environment jsdom
// tests/unit/usePresets.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePresets } from '../../src/core/hooks/usePresets';

/* * 1. Mock the external dependency BEFORE it is imported by the hook.
 * This isolates the hook's logic from the production data.
 */
vi.mock('../../src/core/presets/PresetRegistry', () => ({
    BUILT_IN_PRESETS: [
        { 
            id: 'mat-preset-1', 
            contextId: 'MATERIAL', 
            name: 'Basic Material', 
            nodes: [{ id: 'n1', position: { x: 0, y: 0 }, data: {} }], 
            edges: [{ id: 'e1', source: 'n1', target: 'n2' }], 
            settings: { roughness: 0.5, metalness: 1.0 } 
        },
        { 
            id: 'beam-preset-1', 
            contextId: 'BEAM', 
            name: 'Basic Beam', 
            nodes: [], 
            edges: [], 
            settings: {} 
        }
    ]
}));

describe('usePresets Hook', () => {

    /* State setters and callbacks */
    const mockSetNodes = vi.fn();
    const mockSetEdges = vi.fn();
    const mockOnSettingChange = vi.fn();
    const mockTakeSnapshot = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('filters the available presets strictly by the active context ID', () => {
            const { result } = renderHook(() => usePresets('MATERIAL'));

            expect(result.current.availablePresets).toHaveLength(1);
            expect(result.current.availablePresets[0].id).toBe('mat-preset-1');
        });

        it('returns an empty array if no presets match the active context', () => {
            const { result } = renderHook(() => usePresets('UNKNOWN_CONTEXT'));

            expect(result.current.availablePresets).toHaveLength(0);
        });
    });

    describe('applyPreset Execution', () => {
        it('aborts gracefully and logs a warning if an invalid preset ID is requested', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { result } = renderHook(() => usePresets('MATERIAL'));

            result.current.applyPreset(
                'invalid-id', 
                mockSetNodes, 
                mockSetEdges, 
                mockOnSettingChange, 
                mockTakeSnapshot
            );

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
            expect(mockTakeSnapshot).not.toHaveBeenCalled();
            expect(mockSetNodes).not.toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
        });

        it('applies the requested preset, triggers a history snapshot, and hydrates settings', () => {
            const { result } = renderHook(() => usePresets('MATERIAL'));

            result.current.applyPreset(
                'mat-preset-1', 
                mockSetNodes, 
                mockSetEdges, 
                mockOnSettingChange, 
                mockTakeSnapshot
            );

            /*  History validation */
            expect(mockTakeSnapshot).toHaveBeenCalledTimes(1);

            /*  Graph population validation */
            expect(mockSetNodes).toHaveBeenCalledWith([{ id: 'n1', position: { x: 0, y: 0 }, data: {} }]);
            expect(mockSetEdges).toHaveBeenCalledWith([{ id: 'e1', source: 'n1', target: 'n2' }]);

            /* 3. Settings validation (Ensures Object.entries iteration works) */
            expect(mockOnSettingChange).toHaveBeenCalledTimes(2);
            expect(mockOnSettingChange).toHaveBeenCalledWith('roughness', 0.5);
            expect(mockOnSettingChange).toHaveBeenCalledWith('metalness', 1.0);
        });
    });
});