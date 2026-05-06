// tests/e2e/canvasLifecycle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cosmos Canvas Interactions', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        
        /* 
         * Clear localStorage before each test so saved workspaces 
         * from previous tests don't bleed into the current one.
         */
        await page.evaluate(() => window.localStorage.clear());
        await page.reload();
        await page.waitForLoadState('networkidle');
    });

    test('deleting a node removes associated edges', async ({ page }) => {
        await page.getByTestId('add-node-btn').click();
        await page.getByText('Math (Binary)').click();

        const mathNode = page.locator('.react-flow__node-MATH_BINARY').first();
        await expect(mathNode).toBeVisible();

        /* Click the node drag handle to select it */
        await mathNode.click({ position: { x: 10, y: 10 } });
        
        /* 
         * Ensure the element is explicitly focused in the DOM, 
         * then fire both common deletion keys to hit the config trigger.
         */
        await mathNode.focus();
        await page.keyboard.press('Backspace');
        await page.keyboard.press('Delete');

        await expect(mathNode).not.toBeVisible();
        
        const edges = page.locator('.react-flow__edge');
        await expect(edges).toHaveCount(0);
    });

    test('context switching maintains and restores graph state', async ({ page }) => {
        await page.getByTestId('add-node-btn').click();
        await page.getByText('Math (Binary)').click();
        
        const testNode = page.locator('.react-flow__node-MATH_BINARY').first();
        await expect(testNode).toBeVisible();

        const contextSelect = page.locator('select').first();
        
        /* Save the initial context value (e.g., 'MATERIAL') */
        const initialContext = await contextSelect.inputValue();

        /* 
         * Switch to the secondary context.
         * The node SHOULD disappear because it's a fresh workspace.
         */
        await contextSelect.selectOption({ index: 1 });
        await expect(testNode).not.toBeVisible(); 

        /* 
         * Switch BACK to the original context. 
         * If the state manager works, the node will reappear.
         */
        await contextSelect.selectOption({ value: initialContext });
        await expect(testNode).toBeVisible();
    });

    test('preserves unique graph state across all dynamically available contexts', async ({ page }) => {
        const contextSelect = page.locator('select').first();
        await expect(contextSelect).toBeVisible();

        const options = await contextSelect.locator('option').all();
        const contextValues = await Promise.all(options.map(async (o) => await o.getAttribute('value')));
        
        expect(contextValues.length).toBeGreaterThan(1);

        /* A dictionary to remember how many nodes we expect in each context */
        const expectedNodeCounts: Record<string, number> = {};

        /* SEEDING THE WORKSPACES */
        for (let i = 0; i < contextValues.length; i++) {
            const contextId = contextValues[i] as string;
            await contextSelect.selectOption({ value: contextId });

            // Count how many nodes this context boots with by default (e.g. , 2 for the material context, 1 for Beams and Trails)
            const initialCount = await page.locator('.react-flow__node').count();
            const nodesToAdd = i + 1;

            for (let j = 0; j < nodesToAdd; j++) {
                await page.getByTestId('add-node-btn').click();
                
                // Click the first mathematically allowed node for this specific context
                await page.getByTestId('node-search-item').first().click();
                
                // Wait for the total canvas node count to accurately reflect the addition
                await expect(page.locator('.react-flow__node')).toHaveCount(initialCount + j + 1);
            }

            // Record the final expected number for the hydration check
            expectedNodeCounts[contextId] = initialCount + nodesToAdd;
        }

      
        for (let i = 0; i < contextValues.length; i++) {
            const contextId = contextValues[i] as string;
            await contextSelect.selectOption({ value: contextId });

            // Validate that the exact mathematical count is fully restored
            await expect(page.locator('.react-flow__node')).toHaveCount(expectedNodeCounts[contextId]);
        }
    });
});