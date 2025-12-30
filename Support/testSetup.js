// ==========================================
// Support/TestSetup.js
// ==========================================

const { test: base } = require('playwright-bdd');
const { createBdd } = require('playwright-bdd');
const { ActionUtils } = require('../utils/ActionUtils/ActionUtils');
const { PageFactory } = require('./PageFactory');

// ─────────────────────────────────────────────────────────────
// ACTIVE PAGE RESOLVER
// ─────────────────────────────────────────────────────────────

function resolveActivePage(pageObjects, options = {}) {
    const {
        throwOnNotFound = false,
        fallbackToFirst = true
    } = options;

    // Find page where isAt() returns true
    for (const [name, po] of Object.entries(pageObjects)) {
        if (po.isAt && po.isAt()) {
            return po;
        }
    }

    // No matching page found
    if (throwOnNotFound) {
        const availablePages = Object.keys(pageObjects).join(', ');
        throw new Error(
            `Active page could not be determined. ` +
            `Available pages: ${availablePages}. ` +
            `Ensure each POM implements isAt() method.`
        );
    }

    // Fallback to first page
    if (fallbackToFirst) {
        return Object.values(pageObjects)[0];
    }

    return null;
}

// ─────────────────────────────────────────────────────────────
// CUSTOM FIXTURES
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// BDD STEP DEFINITIONS SETUP
// ─────────────────────────────────────────────────────────────

const { Given, When, Then } = createBdd(test);

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
    test,
    Given,
    When,
    Then
};