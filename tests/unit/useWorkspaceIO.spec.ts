// @vitest-environment jsdom
// tests/unit/useWorkspaceIO.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWorkspaceIO } from '../../src/core/hooks/useWorkSpaceIO';
import type { IWorkspaceStorage } from '../../src/core/storage/IWorkspaceStorage';
import type { IProjectContext } from '../../src/types/context';
import type { Node, Edge } from 'reactflow';
import { ShaderNode } from 'three/src/nodes/tsl/TSLCore.js';


describe('useWorkspaceIO Hook', () => {
    
    /* Mocks DOM APIs unavailable in the Node testing environment */
    beforeEach(() => {
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();
    });

    const mockStorage: IWorkspaceStorage = {
        save: vi.fn(),
        load: vi.fn(),
        exportFile: vi.fn(),
        importFile: vi.fn()
    };

    const mockNodes: Node[] = [
        { id: 'n1', position: { x: 0, y: 0 }, data: { astType: 'FLOAT', inputs: [], outputs: [] } }
    ];
    
    const mockEdges: Edge[] = [
        { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out', targetHandle: 'in' }
    ];

    const mockContext: IProjectContext = {
        id: 'BEAM',
        name: 'Beam Context',
        isNodeAllowed: vi.fn(),
        getInitialNodes: vi.fn(() => []),
        createPreviewStrategy: vi.fn(), 
        SettingsPanel: () => null,
        getExporter: vi.fn(() => ({
            export: vi.fn().mockResolvedValue({
                fileContent: 'mock_shader_code',
                mimeType: 'text/plain',
                fileName: 'beam.fsh'
            })
        }))
    };

    const defaultProps = {
        activeContext: mockContext,
        nodes: mockNodes,
        edges: mockEdges,
        contextSettings: { param: 1 },
        globalSettings: { namespace: 'test_ns', projectName: 'test_proj' },
        allWorkspaces: {},
        storage: mockStorage,
        onLoadWorkspace: vi.fn()
    };

    describe('handleSave', () => {
        it('maps visual nodes to AST structure and commits to storage', async () => {
            const { result } = renderHook(() => useWorkspaceIO(defaultProps));

            await result.current.handleSave(false);

            expect(mockStorage.save).toHaveBeenCalledWith(expect.objectContaining({
                version: '2.0',
                activeContextId: 'BEAM',
                globalSettings: { namespace: 'test_ns', projectName: 'test_proj' }
            }));

            /* Validates node transformation logic inside getCurrentGraph */
            const savedCall = vi.mocked(mockStorage.save).mock.calls[0][0];
            const savedGraph = savedCall.workspaces['BEAM'].graph;
            
            expect(savedGraph.nodes[0].type).toBe('FLOAT');
            expect(savedGraph.connections[0].sourceNodeId).toBe('n1');
        });

        it('triggers file download when requested', async () => {
            const { result } = renderHook(() => useWorkspaceIO(defaultProps));

            await result.current.handleSave(true);

            expect(mockStorage.save).toHaveBeenCalled();
            expect(mockStorage.exportFile).toHaveBeenCalled();
        });
    });

    describe('handleFileUpload', () => {
        it('processes valid file inputs and hydrates the workspace', async () => {
            const mockWorkspace = { version: '2.0', workspaces: {} };
            vi.mocked(mockStorage.importFile).mockResolvedValueOnce(mockWorkspace as any);
            
            const { result } = renderHook(() => useWorkspaceIO(defaultProps));

            const mockFile = new File(['{}'], 'test.cosmosproj');
            const mockEvent = {
                target: { files: [mockFile] }
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            await result.current.handleFileUpload(mockEvent);

            expect(mockStorage.importFile).toHaveBeenCalledWith(mockFile);
            expect(defaultProps.onLoadWorkspace).toHaveBeenCalledWith(mockWorkspace);
        });
    });

    describe('handleGameExport', () => {
        it('compiles standard context exports and triggers DOM download', async () => {
            const { result } = renderHook(() => useWorkspaceIO(defaultProps));

            /* Captures document.createElement to verify DOM manipulation */
            const createElementSpy = vi.spyOn(document, 'createElement');
            const appendChildSpy = vi.spyOn(document.body, 'appendChild');

            await result.current.handleGameExport();

            expect(mockContext.getExporter).toHaveBeenCalled();
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(appendChildSpy).toHaveBeenCalled();
            
            createElementSpy.mockRestore();
            appendChildSpy.mockRestore();
        });
    });
});