// @vitest-environment jsdom
// tests/unit/useIDEConfig.spec.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { IDEConfigProvider, useIDEConfig, DEFAULT_CONFIG } from '../../src/core/hooks/useIDEConfig';

describe('useIDEConfig Hook & Provider', () => {
    
    const STORAGE_KEY = 'cosmos-ide-config';

    /* Mocks the browser's localStorage API. */
    const mockGetItem = vi.spyOn(Storage.prototype, 'getItem');
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        mockGetItem.mockClear();
        mockSetItem.mockClear();
    });

    it('throws an error if used outside of the IDEConfigProvider', () => {
        /* Suppresses React's expected error boundary logging for a cleaner console. */
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        expect(() => renderHook(() => useIDEConfig())).toThrowError(/must be used within an IDEConfigProvider/);
        
        consoleErrorSpy.mockRestore();
    });

    it('initializes with default configuration when local storage is empty', () => {
        const { result } = renderHook(() => useIDEConfig(), {
            wrapper: IDEConfigProvider
        });

        expect(result.current.config).toEqual(DEFAULT_CONFIG);
        expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('hydrates and performs a deep merge of partial configurations from local storage', () => {
        const storedPartialConfig = {
            previews: { fps: 60 } /* Missing 'resolution', 'enabled', etc. */
        };
        mockGetItem.mockReturnValueOnce(JSON.stringify(storedPartialConfig));

        const { result } = renderHook(() => useIDEConfig(), {
            wrapper: IDEConfigProvider
        });

        /* Validates that the missing preview properties were safely inherited from defaults. */
        expect(result.current.config.previews.fps).toBe(60);
        expect(result.current.config.previews.resolution).toBe(DEFAULT_CONFIG.previews.resolution);
        expect(result.current.config.shortcuts).toEqual(DEFAULT_CONFIG.shortcuts);
    });

    it('falls back to default configuration if local storage contains invalid JSON', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mockGetItem.mockReturnValueOnce('invalid-json-format');

        const { result } = renderHook(() => useIDEConfig(), {
            wrapper: IDEConfigProvider
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to load'), expect.any(Error));
        expect(result.current.config).toEqual(DEFAULT_CONFIG);

        consoleWarnSpy.mockRestore();
    });

    it('updates memory state and synchronizes with local storage on updateConfig calls', () => {
        const { result } = renderHook(() => useIDEConfig(), {
            wrapper: IDEConfigProvider
        });

        act(() => {
            result.current.updateConfig('shortcuts', { delete: 'Delete' });
        });

        expect(result.current.config.shortcuts.delete).toBe('Delete');
        
        /* Validates that the entire configuration object was re-serialized and saved. */
        expect(mockSetItem).toHaveBeenCalledWith(
            STORAGE_KEY, 
            expect.stringContaining('"delete":"Delete"')
        );
    });
});