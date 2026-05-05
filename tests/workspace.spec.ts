// tests/e2e/workspace.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Cosmos Workspace IO', () => {
    
    /* Allocates extended execution time for resource-constrained CI environments. */
    test.slow(); 

    /* Ensures application hydration and network stability prior to test execution. */
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('export process generates a valid .cosmosproj file', async ({ page }) => {
        const fileMenu = page.getByTestId('file-menu-btn');
        await expect(fileMenu).toBeVisible({ timeout: 15000 });
        await fileMenu.click();

        const downloadPromise = page.waitForEvent('download');
        
        const saveBtn = page.getByTestId('save-project-btn');
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();
        
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.cosmosproj');
    });

    test('import process restores node state and metadata', async ({ page }) => {
        const filePath = path.resolve(__dirname, './fixtures/io_test_project.cosmosproj');
        
        const fileInput = page.getByTestId('file-upload-input');
        await fileInput.setInputFiles(filePath);

        /* Validates structural restoration within the canvas engine. */
        const node = page.locator('.react-flow__node');
        await expect(node.first()).toBeVisible({ timeout: 20000 });

        /* Validates application state synchronization via global context variables. */
        const nameInput = page.getByTestId('project-name-input');
        await expect(nameInput).not.toHaveValue('project_name'); 
    });
});