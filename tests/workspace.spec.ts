// tests/e2e/workspace.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Cosmos Workspace IO', () => {
    
    // Gives the cloud runner more time to boot the React Flow canvas
    test.slow(); 

    test('export process generates a valid .cosmosproj file', async ({ page }) => {
        await page.goto('/');

        // Use getByRole instead of text=File for better reliability across engines
        const fileMenu = page.getByRole('button', { name: /file/i });
        await expect(fileMenu).toBeVisible({ timeout: 15000 });
        await fileMenu.click();

        const downloadPromise = page.waitForEvent('download');
        // Selecting "Save Project" via role
        await page.getByRole('button', { name: /save project/i }).click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toContain('.cosmosproj');
    });

    test('import process restores node state to the canvas', async ({ page }) => {
        await page.goto('/');

        const filePath = path.resolve(__dirname, './fixtures/io_test_project.cosmosproj');
        
        // Target the file input directly
        await page.setInputFiles('input[type="file"]', filePath);

        // Wait specifically for a React Flow node to be rendered
        const node = page.locator('.react-flow__node');
        await expect(node.first()).toBeVisible({ timeout: 20000 });
    });
});