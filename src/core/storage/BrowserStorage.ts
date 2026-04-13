import type { SavedWorkspace } from '../../types/workspace';
import type { IWorkspaceStorage } from './IWorkspaceStorage';

const AUTOSAVE_KEY = 'cosmos_autosave';

export class BrowserStorage implements IWorkspaceStorage {
    
    async save(workspace: SavedWorkspace): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(workspace));
                console.log("Cosmos: Workspace autosaved locally.");
                resolve();
            } catch (e) {
                console.error("Cosmos: Failed to save to local storage", e);
                reject(e);
            }
        });
    }

    async load(): Promise<SavedWorkspace | null> {
        return new Promise((resolve) => {
            try {
                const data = localStorage.getItem(AUTOSAVE_KEY);
                resolve(data ? JSON.parse(data) : null);
            } catch (e) {
                console.error("Cosmos: Failed to load from local storage", e);
                resolve(null);
            }
        });
    }

    async exportFile(workspace: SavedWorkspace): Promise<void> {
        return new Promise((resolve) => {
            const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workspace.name.replace(/\s+/g, '_').toLowerCase()}.cosmosproj`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve();
        });
    }

    async importFile(file: File): Promise<SavedWorkspace> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    resolve(json as SavedWorkspace);
                } catch (err) {
                    reject(new Error("Invalid Cosmos Project file."));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file."));
            reader.readAsText(file);
        });
    }
}