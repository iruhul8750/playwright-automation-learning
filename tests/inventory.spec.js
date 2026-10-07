const { test, expect } = require('../fixtures/authenticatedPage');
const InventoryPage = require('../pages/InventoryPage');

test.describe('Inventory Page Tests', () => {

    test('Verify Inventory Page is displayed', async ({ authenticatedPage }) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        await expect(inventoryPage.productsHeading).toBeVisible();
        await expect(authenticatedPage).toHaveURL(/inventory/);
        await expect(inventoryPage.productItems).toHaveCount(6);

    });

});