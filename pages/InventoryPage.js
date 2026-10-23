class InventoryPage{
    constructor (page) {
        this.page = page;

        this.productsHeading = page.getByText('Products');
        this.productItems = page.locator('.inventory_item');
        this.productNames = page.locator('.inventory_item_name');
        this.productPrices = page.locator('.inventory_item_price');
        this.addToCartButtons = page.getByRole('button', {name: 'Add to cart'});
        this.cartLink = page.locator('.shopping_cart_link');
        this.cartBadge = page.locator('.shopping_cart_badge');
        this.removeButtons = page.getByRole('button', {name: 'Remove'});
        this.continueShopping = page.getByRole('button', {name: 'Continue Shopping'});
        this.checkout = page.getByRole('button', {name: 'Checkout'});
        this.continue = page.getByRole('button', {name: 'Continue'});
    }

    async verifyInventoryPage() {
        await this.productsHeading.isVisible();
    }

    getProduct(productName){
        return this.productItems.filter({hasText: productName});
    }

    // Locator chaining method
    async addProductToCart(productName){
        const product = this.getProduct(productName);

        await product.getByRole('button', {name: 'Add to cart'}).click();
    }

    getCartProduct(productName){
        return this.page.locator('.cart_item').filter({hasText: productName});
    }

    async removeProduct(productName){
        const product = this.getCartProduct(productName);
        await product.getByRole('button', {name: 'Remove'}).click();
    }
   
}

module.exports = InventoryPage;