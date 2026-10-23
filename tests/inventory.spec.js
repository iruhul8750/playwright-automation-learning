const { backup } = require('node:sqlite');
const { test, expect } = require('../fixtures/authenticatedPage');
const InventoryPage = require('../pages/InventoryPage');
const { networkInterfaces } = require('node:os');
const { verify } = require('node:crypto');

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
        
        await inventoryPage.cartLink.click();
        await expect(authenticatedPage.getByText('Sauce Labs Backpack')).toBeVisible();
    });

    test('TC-08 - Verify product can be removed from cart', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addToCartButtons.nth(1).click();
        await expect(inventoryPage.cartBadge).toHaveText('1');

        await inventoryPage.cartLink.click();
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

        await inventoryPage.cartLink.click();

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

    test('TC-19 - verify prices sorted by Low to High', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const expectedPrices = [
            '$7.99',
            '$9.99',
            '$15.99',
            '$15.99',
            '$29.99',
            '$49.99'
        ];

        await authenticatedPage.getByRole('combobox').selectOption('lohi');

        await expect(authenticatedPage.locator('.inventory_item_price')).toHaveText(expectedPrices);

    });

    
    test('TC-19 - verify prices sorted by High to Low', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        const expectedPrices = [
            '$49.99',
            '$29.99',
            '$15.99',
            '$15.99',
            '$9.99',
            '$7.99',
        ];

        await authenticatedPage.getByRole('combobox').selectOption('hilo');

        await expect(authenticatedPage.locator('.inventory_item_price')).toHaveText(expectedPrices);

    });

    test('TC-20 - verigfy important inventory page elements', async ({authenticatedPage}) => {

        const inventoryPage = new InventoryPage(authenticatedPage);

        await expect(authenticatedPage.getByRole('combobox')
        ).toBeVisible();

        await expect(inventoryPage.productItems).toHaveCount(6);
        await expect(authenticatedPage.getByRole('combobox')).toBeVisible();
        await expect(inventoryPage.cartLink).toBeVisible();
        await expect(authenticatedPage.getByText('Sauce Labs Backpack', {exact: true})).toBeVisible();
    });

    test('TC-21 - verify cart page opens correctly', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);
        
        await inventoryPage.cartLink.click();

        await expect(authenticatedPage.getByText('Your Cart', {exact: true})).toBeVisible();

        await expect(authenticatedPage.getByRole('button', {name: 'Checkout'})).toBeVisible();

        await expect(authenticatedPage.getByRole('button', {name: 'Continue Shopping'})).toBeVisible();

        
    });

    test('TC-22 - verify product name and price in the cart', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');

        await inventoryPage.cartLink.click();

        const cartBackpack = authenticatedPage.locator('.cart_item')
        .filter({hasText: 'Sauce Labs Backpack'});

        await expect(cartBackpack.getByText('Sauce Labs Backpack', {exact: true})).toBeVisible();

        await expect(cartBackpack.locator('.inventory_item_price')).toHaveText('$29.99');

    });

    test('TC-23 - verify product quantity in cart', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');

        await inventoryPage.cartLink.click();

        const cartBackpack = authenticatedPage.locator('.cart_item')
        .filter({hasText: 'Sauce Labs Backpack'});
        
        await expect(cartBackpack.locator('.cart_quantity')).toHaveText('1');

    });

    test('TC-24 - verify removed product is no longet in cart', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        
        await inventoryPage.cartLink.click();

        const cartBackpack = authenticatedPage.locator('.cart_item').filter({hasText: 'Sauce Labs Backpack'});

        await expect(cartBackpack).toHaveCount(1);

        await cartBackpack.getByRole('button', {name: 'Remove'}).click();

        await expect(authenticatedPage.locator('.cart_item').filter ({hasText: 'Sauce Labs Backpack'})).toHaveCount(0);

    });

    test('TC-25 - verify badge count update afater removing product', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await expect(inventoryPage.cartBadge).toHaveText('1');
        await inventoryPage.cartLink.click();
        
        const cartBackpack = authenticatedPage.locator('.cart_item',).filter({hasText: 'Sauce Labs Backpack'});

        await cartBackpack.getByRole('button', {name: 'Remove'}).click();

        await expect(inventoryPage.cartBadge).toHaveCount(0);
    
    });

    test('TC-26 - verify continue shopping navigation', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.cartLink.click();

        await inventoryPage.continueShopping.click();

        await expect(inventoryPage.productsHeading).toBeVisible();
        await expect(inventoryPage.productItems).toHaveCount(6);
    });

    test('TC-27 - verify multiple products are present in cart', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        const products = [
            'Sauce Labs Backpack',
            'Sauce Labs Bike Light',
            'Sauce Labs Bolt T-Shirt'
        ];

        for (const product of products){
            await inventoryPage.addProductToCart(product);
        }

        await inventoryPage.cartLink.click();

        for (const product of products){
            const cartItem = authenticatedPage.locator('.cart_item').filter({hasText: product});
            
            await expect(cartItem).toHaveCount(1);

        }

        await expect(authenticatedPage.locator('.cart_item')).toHaveCount(3);

        
    });

    test('TC-28 - verify other products remain after removeing one product from cart', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
        await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');

        await inventoryPage.cartLink.click();

        const bikeLIght = authenticatedPage.locator('.cart_item').filter({hasText: 'Sauce Labs Bike Light'});

        await bikeLIght.getByRole('button', {name: 'Remove'}).click();

        await expect(bikeLIght).toHaveCount(0);

        await expect( authenticatedPage.locator('.cart_item').filter({hasText: 'Sauce Labs Bolt T-Shirt'})).toHaveCount(1);

        await expect(authenticatedPage.locator('.cart_item')).toHaveCount(2);
    });

    test('TC-29 - verify checkout button navigation', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await authenticatedPage.getByRole('button', {name: 'Checkout'}).click();
        
        await expect(authenticatedPage.getByText('Checkout: Your information')).toBeVisible();
        await expect(authenticatedPage.getByRole('textbox', {name: 'First Name'})).toBeVisible();
        await expect(authenticatedPage.getByRole('textbox', {name: 'Last Name'})).toBeVisible();
        await expect(authenticatedPage.getByRole('textbox', {name: 'Zip/Postal Code'})).toBeVisible();

    });

    test('TC-30 - verify validation when checkou tfields are empty', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await authenticatedPage.getByRole('button', {name: 'Checkout'}).click();

        await authenticatedPage.getByRole('button', {name: 'Continue'}).click();
        await expect( authenticatedPage.getByText('Error: First Name is required')).toBeVisible();  
    });

    test('TC-31 - verify validation when last name is empty', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await authenticatedPage.getByRole('button', {name: 'Checkout'}).click();

        await authenticatedPage.getByPlaceholder('First Name').fill('User1');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('122001');

        await authenticatedPage.getByRole('button', {name: 'Continue'}).click();
        
        await expect(authenticatedPage.getByText('Error: Last Name is required')).toBeVisible();
    });

    test('TC-32 - verify validation Zip code is empty', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await authenticatedPage.getByRole('button', {name: 'Checkout'}).click();

        await authenticatedPage.getByPlaceholder('First Name').fill('user1');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak');

        await authenticatedPage.getByRole('button', {name: 'Continue'}).click();

        await expect(authenticatedPage.getByText('Error: Postal Code is required')).toBeVisible();
    });

    test('TC-33 - verify successful checkout inforamtion submission', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        
        await authenticatedPage.getByRole('button',{name: 'Checkout'}).click();
        await authenticatedPage.getByPlaceholder('First Name').fill('user1');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('122001');

        await authenticatedPage.getByRole('button', {name: 'Continue'}).click();

        await expect(authenticatedPage.getByText('Checkout: Overview')).toBeVisible();
        await expect(authenticatedPage.locator('.cart_item').filter({hasText: 'Sauce Labs Backpack'})).toBeVisible();

    });

    test('TC-34 - verify product price and quantity on checkout overview', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();

        await inventoryPage.checkout.click();

        await authenticatedPage.getByPlaceholder('First Name').fill('user1');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('122991');

        await inventoryPage.continue.click();

        await expect(authenticatedPage.locator('.cart_item').filter({hasText: '$29.99'})).toBeVisible();

        await expect(authenticatedPage.locator('.cart_item').filter({hasText: 'Sauce Labs Backpack'})).toHaveCount(1);

    });

    test('TC-35 - verify item total on checkout on overview', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await inventoryPage.checkout.click();
        
        await authenticatedPage.getByPlaceholder('First Name').fill('user');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('222422');

        await inventoryPage.continue.click();
         
        await expect(authenticatedPage.locator('.summary_info').filter({hasText: 'Item total: $29.99'})).toBeVisible(); 

    });

    test('TC-36 - verify tax amount on the checkout overview', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await inventoryPage.checkout.click();
        
        await authenticatedPage.getByPlaceholder('First Name').fill('user2');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak2');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('121232');

        await inventoryPage.continue.click();

        await expect(authenticatedPage.locator('.summary_tax_label')).toHaveText('Tax: $2.40');
    });

    test('TC-37 - verify total amount including tax', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await inventoryPage.checkout.click();

        await authenticatedPage.getByPlaceholder('First Name').fill('user2');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak2');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('121232');

        await inventoryPage.continue.click();

        await expect(authenticatedPage.locator('.summary_subtotal_label')).toHaveText('Item total: $29.99');
        await expect(authenticatedPage.locator('.summary_tax_label')).toHaveText('Tax: $2.40');
        await expect(authenticatedPage.locator('.summary_total_label')).toHaveText('Total: $32.39');
    });

    test('TC-38 - verify finish button complete the order', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await inventoryPage.checkout.click();

        await authenticatedPage.getByPlaceholder('First Name').fill('user2');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak2');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('121232');

        await inventoryPage.continue.click();
        await authenticatedPage.getByRole('button', {name: 'Finish'}).click();
        await expect(authenticatedPage.getByTestId('complete-header')).toHaveText('Thank you for your order!');
        
    });

    test('TC-39 - verify back home button navigation after order completion', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await inventoryPage.checkout.click();

        await authenticatedPage.getByPlaceholder('First Name').fill('user2');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak2');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('121232');

        await inventoryPage.continue.click();
        await authenticatedPage.getByRole('button', {name: 'Finish'}).click();
        await authenticatedPage.getByRole('button', {name: 'Back Home'}).click();
        
        await expect(inventoryPage.productsHeading).toBeVisible();
    });

    test('TC-40 - verify cart empty after completing order ', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.cartLink.click();
        await inventoryPage.checkout.click();

        await authenticatedPage.getByPlaceholder('First Name').fill('user2');
        await authenticatedPage.getByPlaceholder('Last Name').fill('ak2');
        await authenticatedPage.getByPlaceholder('Zip/Postal Code').fill('121232');

        await inventoryPage.continue.click();
        await authenticatedPage.getByRole('button', {name: 'Finish'}).click();
        await authenticatedPage.getByRole('button', {name: 'Back Home'}).click();
        
        await expect(inventoryPage.cartBadge).toHaveCount(0);

        await inventoryPage.cartLink.click();
        await expect(authenticatedPage.locator('.cart_item')).toHaveCount(0);
    });

    test('TC-41 - verify continue shopping from an empty cart', async ({authenticatedPage})=> {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.cartLink.click();

        await inventoryPage.continueShopping.click();

        await expect(inventoryPage.productsHeading).toBeVisible();
        await expect(inventoryPage.productItems).toHaveCount(6);
    });

    test('TC-42 - verify cart badge udpates when adding a product after returning from empty cart', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.cartLink.click();
        await expect(authenticatedPage.locator('.cart_item')).toHaveCount(0);

        await inventoryPage.continueShopping.click();
        await inventoryPage.addProductToCart('Sauce Labs Backpack');

        await inventoryPage.cartLink.click();

        await expect(inventoryPage.cartBadge).toHaveText('1');

    });

    test('TC-43 - verify cart badge count when multiple products are added', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
        await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');
        await expect(inventoryPage.cartBadge).toHaveText('3');

    });

    test('TC-44 - verify removing one product updates the badgea dn teh remaining cart items', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
        await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');
        await expect(inventoryPage.cartBadge).toHaveText('3');

        await inventoryPage.cartLink.click();
        await inventoryPage.removeProduct('Sauce Labs Backpack');
        await expect(inventoryPage.cartBadge).toHaveText('2');

    });

    test('TC-45 - verify cart contents remain correct after navigating between inventory and cart', async ({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');

        await expect(inventoryPage.cartBadge).toHaveText('2');

        await inventoryPage.cartLink.click();
        await expect(authenticatedPage.locator('.cart_item')).toHaveCount(2);
        await expect(authenticatedPage.locator('.cart_item')).toContainText([
            'Sauce Labs Backpack',
            'Sauce Labs Bike Light'
        ]);
        await expect(inventoryPage.cartBadge).toHaveText('2');

        await inventoryPage.continueShopping.click();
        await expect(inventoryPage.productsHeading).toBeVisible();
        await expect(inventoryPage.cartBadge).toHaveText('2');

    });

    test('TC-46 - verify navigation to a product detils page', async({authenticatedPage}) => {
        const inventoryPage = new InventoryPage(authenticatedPage);

        await authenticatedPage.locator('.inventory_item_name').filter({hasText: 'Sauce Labs Backpack'}).click();

        await expect(authenticatedPage.locator('.inventory_item_description')).toContainText([
            'Sauce Labs Backpack',
            'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.'
        ]);

        await expect(authenticatedPage.locator('button', {name: 'Back to products'})).toBeVisible();
    });
    

});
