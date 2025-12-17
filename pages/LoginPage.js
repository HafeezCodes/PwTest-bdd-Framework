// ==========================================
// pages/LoginPage.js (Optimized)
// ==========================================

const { BasePage } = require('./BasePage');
const { ElementFactory } = require('../Support/ElementFactory');
const envConfig = require('../.env.config');

class LoginPage extends BasePage {
    constructor(page) {
        super(page, `${envConfig.BASEURL}/loginpagePractise/`);
        const elementFactory = new ElementFactory(page);

        // Assign all login elements to this
        Object.assign(this, elementFactory.getAll('login'));

        // Assign all common elements to this
        Object.assign(this, elementFactory.getAll('common'));
    }
}

module.exports = { LoginPage };
