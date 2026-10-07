const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe('Login Tests', () => {

    test('Valid Login', async ({ page }) => {

        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            'standard_user',
            'secret_sauce'
        );

        await expect(page).toHaveURL(/inventory/);
        await expect(
            page.getByText('Products')
        ).toBeVisible();
    });


    test('Invalid Login', async ({ page }) => {

        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            'invalid_user',
            'invalid_password'
        );

        await expect(
            page.getByText(
                'Username and password do not match any user in this service'
            )
        ).toBeVisible();
    });


    test('Locked User Login', async ({ page }) => {

        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            'locked_out_user',
            'secret_sauce'
        );

        await expect(page.getByText('Sorry, this user has been locked out.')).toBeVisible();});
        

    test('problem user', async ({page}) => {

        const loginPage = new LoginPage(page);

        await loginPage.open();
        await loginPage.login('problem_user','secret_sauce');

        await expect(page).toHaveURL(/inventory/);
        await expect( page.getByText('Products')).toBeVisible();
    })

});