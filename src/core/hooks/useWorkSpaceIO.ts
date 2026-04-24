import { useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import type { ShaderGraph, NodeType } from '../../types/ast';
import type { IProjectContext } from '../../types/context';
import type { IWorkspaceStorage } from '../storage/IWorkspaceStorage';
import type { SavedWorkspace } from '../../types/workspace';

interface UseWorkspaceIOProps {
    activeContext: IProjectContext;
    nodes: Node[];
    edges: Edge[];
    contextSettings: Record<string, any>;
    globalSettings: { namespace: string; projectName: string };
    allWorkspaces: Record<string, { graph: ShaderGraph; settings: any }>;
    storage?: IWorkspaceStorage;
    onLoadWorkspace?: (workspace: SavedWorkspace) => void;
}

export function useWorkspaceIO({
    activeContext,
    nodes,
    edges,
    contextSettings,
    globalSettings,
    allWorkspaces,
    storage,
    onLoadWorkspace
}: UseWorkspaceIOProps) {
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async (download: boolean) => {
        if (!storage) return;
        const workspace: SavedWorkspace = {
            version: "1.0",
            name: globalSettings.projectName, 
            contextId: activeContext.id,
            settings: contextSettings,
            nodes,
            edges
        };
        try {
            await storage.save(workspace); 
            if (download) await storage.exportFile(workspace);
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const handleGameExport = async () => {
        const exporter = activeContext.getExporter();
        if (!exporter) return;

        const currentGraph: ShaderGraph = {
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.data.astType as NodeType,
                inputs: n.data.inputs || [],
                outputs: n.data.outputs || []
            })),
            connections: edges.map(e => ({
                id: e.id,
                sourceNodeId: e.source,
                sourcePortId: e.sourceHandle || 'out',
                targetNodeId: e.target,
                targetPortId: e.targetHandle || 'in'
            }))
        };

        try {
            let result;


            if ('exportComposite' in exporter) {
                const materialData = allWorkspaces['MATERIAL'];
                result = await (exporter as any).exportComposite(
                    currentGraph, contextSettings, materialData.graph, globalSettings
                );
            } else {
                result = await exporter.export(currentGraph, contextSettings, globalSettings);
            }
            
            const contentBlob = typeof result.fileContent === 'string' 
                ? new Blob([result.fileContent], { type: result.mimeType })
                : result.fileContent;

            const url = URL.createObjectURL(contentBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.fileName;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
        } catch (e) {
            alert("Failed to export: " + e);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!storage) return;
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const workspace = await storage.importFile(file);
            onLoadWorkspace?.(workspace);
        } catch (err) {
            alert("Failed to load project: " + err);
        }
    };

    return {
        fileInputRef,
        handleSave,
        handleGameExport,
        handleFileUpload
    };
}