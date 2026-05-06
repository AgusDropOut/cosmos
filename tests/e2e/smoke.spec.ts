// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Application Welfare (Smoke Test)', () => {
    
    test('boots successfully without fatal console or WebGL errors', async ({ page }) => {
        const errors: string[] = [];

        /* Captures uncaught exceptions and console errors during boot phase. */
        page.on('pageerror', (err) => errors.push(err.message));
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                // Filters out benign warnings, capturing only strict errors.
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        /* Validates the React Flow infrastructure mounted correctly. */
        const reactFlowCanvas = page.locator('.react-flow');
        await expect(reactFlowCanvas).toBeVisible();

        /* Validates the Three.js WebGL canvas mounted correctly. */
        const threeJsCanvas = page.locator('canvas').last();
        await expect(threeJsCanvas).toBeVisible();

        /* Validates the default Material context hydrated initial nodes. */
        const defaultNode = page.locator('.react-flow__node').first();
        await expect(defaultNode).toBeVisible();

        /* Asserts the application survived the boot sequence without crashing. */
        expect(errors).toEqual([]);
    });
});