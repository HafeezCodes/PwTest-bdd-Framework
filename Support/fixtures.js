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

    pageFactory: async ({ page }, use) => {
        await use(new PageFactory(page));
    },

    pageObjects: async ({ pageFactory }, use) => {
        await use(pageFactory.getAll());
    },

    getActivePage: async ({ pageObjects }, use) => {
        const getActive = () => resolveActivePage(pageObjects);
        await use(getActive);
    }

});

module.exports = { test };
