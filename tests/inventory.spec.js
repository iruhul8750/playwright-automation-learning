const { backup } = require('node:sqlite');
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

    test('TC-07 - Veriy product is added to cart', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addToCartButtons.first().click();
        await expect(inventoryPage.cartBadge).toHaveText('1');
        
        await inventoryPage.cartButton.click();
        await expect(authenticatedPage.getByText('Sauce Labs Backpack')).toBeVisible();
    });

    test('TC-08 - Verify product can br removed from cart', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addToCartButtons.nth(1).click();
        await expect(inventoryPage.cartBadge).toHaveText('1');

        await inventoryPage.cartButton.click();
        await inventoryPage.removeButtons.click();
        await expect(authenticatedPage.getByText('Sauce Labs Bagpack')).not.toBeVisible();

    });

    test('TC-09 - Verify multiple product add in cart', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addToCartButtons.nth(0).click();
        await inventoryPage.addToCartButtons.nth(0).click();
        await inventoryPage.addToCartButtons.nth(0).click();
        await inventoryPage.addToCartButtons.nth(0).click();
        await inventoryPage.addToCartButtons.nth(0).click();
        await inventoryPage.addToCartButtons.nth(0).click();   // all nth value 0 because after adding product to cart , the count becomes less so unable to locate exact number , now it will look for 0 value and get always.

        await expect(inventoryPage.cartBadge).toHaveText('6');
    })


    test('TC-10 - Verify specific product to cart', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');

        await expect(inventoryPage.cartBadge).toHaveText('2');
    });

    test('TC-11 - verify Backpack product contains its name', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);
        const backpack = inventoryPage.productItems.filter({hasText: 'Sauce Labs Backpack'});

        await expect(backpack).toContainText('Sauce Labs Backpack');
        await expect(backpack.getByRole('button', {name: 'Add to cart'})).toBeVisible();
        await backpack.getByRole('button', {name: 'Add to cart'}).click();
        await expect(inventoryPage.cartBadge).toHaveText('1');
    });

    test('TC-12 - verify backpack product price', async({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const backpack = inventoryPage.productItems.filter({hasText: 'Sauce Labs Backpack'});

        await expect(backpack).toContainText('$29.99');
    })

    test('TC-13 - verify backpack price using locator', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const backpcakName = authenticatedPage.getByText('Sauce Labs Backpack', { exact: true});

        const backpack = inventoryPage.productItems.filter({
            has: backpcakName
        });

        await expect(backpack).toHaveCount(1);
        await expect(backpack).toContainText('$29.99');

    });

    test('TC-14 - verify remove button not visible before adding product', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);
        const backpack = inventoryPage.getProduct('Sauce Labs Backpack');

        await expect(backpack.getByRole('button', {name: 'Remove'})).not.toBeVisible();
    });
    

    test('TC-15 - verify button changes after adding product', async({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const backpack = inventoryPage.getProduct('Sauce Labs Backpack');

        await expect(backpack.getByRole('button', { name: 'Add to cart'})).toBeVisible();
        await backpack.getByRole('button', { name: 'Add to cart'}). click();
        await expect(backpack.getByRole('button', {name: 'Remove'})).toBeVisible();
    });

    test('TC-16 - verify multiple selected product names', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);
        
        const expectedProducts = [
            'Sauce Labs Backpack',
            'Sauce Labs Bike Light',
            'Sauce Labs Bolt T-Shirt',
            'Sauce Labs Fleece Jacket'
            
        ];

        for (const productName of expectedProducts){
            await inventoryPage.addProductToCart(productName);
        }

        await expect(inventoryPage.cartBadge).toHaveText('4');

    });

    test('TC-17 - vefify selected product names in cart', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const expectedProducts = [
            'Sauce Labs Backpack',
            'Sauce Labs Bike Light',
            'Sauce Labs Bolt T-Shirt'
        ];

        for (const productname of expectedProducts){
            await inventoryPage.addProductToCart(productname);
        }

        await inventoryPage.cartButton.click();

        for(const productName of expectedProducts){
            await expect(
                authenticatedPage.locator('.cart_item')
                .filter({hasText: productName})
            ).toHaveCount(1);
        }
    });

    test('TC-18 - verify products sorted by Name A to Z', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const expectedProducts = [
            'Sauce Labs Backpack',
            'Sauce Labs Bike Light',
            'Sauce Labs Bolt T-Shirt',
            'Sauce Labs Fleece Jacket',
            'Sauce Labs Onesie',
            'Test.allTheThings() T-Shirt (Red)'
        ];

        await authenticatedPage.getByRole('combobox').selectOption('az');

        await expect(authenticatedPage.locator('.inventory_item_name')).toHaveText(expectedProducts);
    });

});
