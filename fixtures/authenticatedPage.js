const base = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

exports.test = base.test.extend({

    authenticatedPage: async ({page}, use) => {

        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            'standard_user',
            'secret_sauce'
        );

        await use(page);

    }
});

exports.expect = base.expect;