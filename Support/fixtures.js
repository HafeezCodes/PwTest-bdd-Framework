// ==========================================
// Support/fixtures.js
// ==========================================

const { test: base } = require('playwright-bdd');
const { ActionUtils } = require('../utils/ActionUtils/ActionUtils');
const { PageFactory } = require('./PageFactory');
const { resolveActivePage } = require('./activePageResolver');

const test = base.extend({

    actionUtils: async ({ page }, use) => {
        await use(new ActionUtils(page));
    },

    pageObjects: async ({ page }, use) => {
        const pageFactory = new PageFactory(page);
        await use(pageFactory.getAll());
    },

    getActivePage: async ({ pageObjects }, use) => {
        await use(() => resolveActivePage(pageObjects));
    }

});

module.exports = { test };
