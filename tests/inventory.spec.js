const { test, expect } = require('../fixtures/authenticatedPage');
const InventoryPage = require('../pages/InventoryPage');

test.describe('Inventory Page Tests', () => {

    test('TC-01 - Verify Inventory Page is displayed', async ({ authenticatedPage }) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        await expect(inventoryPage.productsHeading).toBeVisible();
        await expect(authenticatedPage).toHaveURL(/inventory/);

    });

    test('TC-02 - verify all products are displayed', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);
        await expect(inventoryPage.productItems).toHaveCount(6);
    });

    test('TC-03 - Verify all products visible', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const productNames = await inventoryPage.productNames.all();

        for (const productName of productNames){
            await expect(productName).toBeVisible();
        }
    });

    test('TC-04 - Verify product names ', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const actualProductNames = 
            await inventoryPage.productNames.allTextContents();

        const expectedProductNames = [
            'Sauce Labs Backpack',
            'Sauce Labs Bike Light',
            'Sauce Labs Bolt T-Shirt',
            'Sauce Labs Fleece Jacket',
            'Sauce Labs Onesie',
            'Test.allTheThings() T-Shirt (Red)'
        ];

        expect(actualProductNames).toEqual(expectedProductNames);
    });

    test('TC-05 - Verify all product prices', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const actualProductPrices = 
            await inventoryPage.productPrices.allTextContents();
        
        const expectedProductPrices = [
            '$29.99',
            '$9.99',
            '$15.99',
            '$49.99',
            '$7.99',
            '$15.99'
        ];

        expect(actualProductPrices).toEqual(expectedProductPrices);
    });

    test('TC-06 - Verify add cart button', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const addToCartButtons = 
            await inventoryPage.addToCartButtons.all();
        
        expect(addToCartButtons.length).toBe(6);

    });

});