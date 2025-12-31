// ==========================================
// pages/ShopPage.js
// ==========================================

const { BasePage } = require('./BasePage');
const { ElementFactory } = require('../Support/ElementFactory');
const envConfig = require('../.env.config');

class ShopPage extends BasePage {
    constructor(page) {
        super(page, `${envConfig.BASEURL}/shop/`);
        const elementFactory = new ElementFactory(page);

        // All 'shop' elements
        Object.assign(this, elementFactory.getAll('shop'));

        // Common elements
        this.adminRadio = elementFactory.get('common.adminRadio');
        this.userRadio = elementFactory.get('common.userRadio');
    }
}

module.exports = { ShopPage };