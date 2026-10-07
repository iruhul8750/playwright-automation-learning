class InventoryPage{
    constructor (page) {
        this.page = page;

        this.productsHeading = page.getByText('Products');
        
        this.productItems = page.locator('.inventory_item');
        this.productNames = page.locator('.inventory_item_name');
        this.productPrices = page.locator('.inventory_item_price');
        this.addToCartButtons = page.getByRole('button', {name: '/Add to cart/i'});


    }

    async verifyInventoryPage() {
        await this.productsHeading.isVisible();
    }
}

module.exports = InventoryPage;