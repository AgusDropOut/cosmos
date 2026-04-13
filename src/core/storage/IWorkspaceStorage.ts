import type { SavedWorkspace } from '../../types/workspace';

export interface IWorkspaceStorage {
    // Autosave / Load from memory 
    save(workspace: SavedWorkspace): Promise<void>;
    load(): Promise<SavedWorkspace | null>;
    
    // Physical file handling (.cosmosproj)
    exportFile(workspace: SavedWorkspace): Promise<void>;
    importFile(file: File): Promise<SavedWorkspace>;
}