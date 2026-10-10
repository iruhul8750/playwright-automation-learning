class InventoryPage{
    constructor (page) {
        this.page = page;

        this.productsHeading = page.getByText('Products');
        this.productItems = page.locator('.inventory_item');
        this.productNames = page.locator('.inventory_item_name');
        this.productPrices = page.locator('.inventory_item_price');
        this.addToCartButtons = page.getByRole('button', {name: 'Add to cart'});
        this.cartButton = page.locator('.shopping_cart_link');
        this.cartBadge = page.locator('.shopping_cart_link');
        this.removeButtons = page.getByRole('button', {name: 'Remove'});
    }

    async verifyInventoryPage() {
        await this.productsHeading.isVisible();
    }

    // Locatory chaining method
    async addProductToCart(productName){
        await this.productItems.filter({ hasText: productName}).getByRole('button', {name: 'Add to cart'}).click();
    }

    getProduct(product){
        return this.productItems.filter({hasText: product});
    }
}

module.exports = InventoryPage;