// tests/e2e/workspace.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Test suite for project persistence and file handling */
test.describe('Cosmos Workspace IO', () => {

    test('export process generates a valid .cosmosproj file', async ({ page }) => {
        await page.goto('/');

        /* Triggers the download event */
        const downloadPromise = page.waitForEvent('download');
        await page.click('text=File');
        await page.click('text=Save Project');
        const download = await downloadPromise;

        /* Validates file metadata */
        expect(download.suggestedFilename()).toContain('.cosmosproj');
    });

    test('import process restores node state to the canvas', async ({ page }) => {
        await page.goto('/');

        /* Uploads a test fixture to the hidden input */
        const filePath = path.resolve(__dirname, './fixtures/io_test_project.cosmosproj');
        await page.setInputFiles('input[type="file"]', filePath);

        /* Checks for the existence of nodes in the React Flow renderer */
        const nodes = page.locator('.react-flow__node');
        await expect(nodes.first()).toBeVisible();
    });
});