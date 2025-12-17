// ==========================================
// steps/universal.steps.js
// ==========================================

const { Given, When, Then } = require('../Support/bdd');
const envConfig = require('../.env.config');
const { ActionUtils } = require('../utils/ActionUtils/ActionUtils');
const {
    buttons,
    fields,
    dropdowns,
    checkboxes,
    radios,
    links,
    modals,
    errors
} = require('../Support/elementMaps');

/* --------------------------------------------------------
   HELPER: Resolve element from maps
-------------------------------------------------------- */
function resolveElement(maps, name, ctx) {
    const resolver = maps[name];
    if (!resolver) {
        throw new Error(
            `Element "${name}" not found in elementMaps. ` +
            `Add "${name}" to the correct section in elementMaps.js`
        );
    }
    return resolver(ctx);
}

/* --------------------------------------------------------
   HELPER: Resolve environment variables
-------------------------------------------------------- */
function resolveValue(value) {
    if (envConfig[value]) {
        return envConfig[value];
    }
    return value;
}

/* --------------------------------------------------------
   HELPER: Build context for element resolution
-------------------------------------------------------- */
function buildContext(getActivePage) {
    return {
        active: getActivePage()
    };
}

/* --------------------------------------------------------
   NAVIGATION
-------------------------------------------------------- */
Given(
    'the user navigates to the {string} page',
    async ({ pageObjects, actionUtils }, pageName) => {
        const pageObject = pageObjects[pageName + "Page"];

        if (!pageObject) {
            throw new Error(`Page '${pageName}' not found in pageRegistry`);
        }

        await pageObject.navigate();
        await actionUtils.waitForPageLoad();
    }
);

/* --------------------------------------------------------
   CLICK BUTTON
-------------------------------------------------------- */
When(
    'the user clicks on the {string} button',
    async ({ getActivePage, actionUtils }, buttonName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(buttons, buttonName, ctx);
        await actionUtils.click(locator);
    }
);

/* --------------------------------------------------------
   CLICK BUTTON IN MODAL
-------------------------------------------------------- */
When(
    'the user clicks on the {string} button in the {string} modal',
    async ({ getActivePage, actionUtils }, buttonName, modalName) => {
        const ctx = buildContext(getActivePage);
        const modalLocator = resolveElement(modals, modalName, ctx);
        await actionUtils.waitForVisible(modalLocator);
        const buttonLocator = resolveElement(buttons, buttonName, ctx);
        await actionUtils.click(buttonLocator);
    }
);

/* --------------------------------------------------------
   FIELD INPUT
-------------------------------------------------------- */
When(
    'the user enters {string} in the {string} field',
    async ({ getActivePage, actionUtils }, value, fieldName) => {
        const ctx = buildContext(getActivePage);
        const resolvedValue = resolveValue(value);
        const locator = resolveElement(fields, fieldName, ctx);
        await actionUtils.fill(locator, resolvedValue);
    }
);

/* --------------------------------------------------------
   DROPDOWN SELECTION
-------------------------------------------------------- */
When(
    'the user selects {string} from the {string} dropdown',
    async ({ getActivePage, actionUtils }, optionLabel, dropdownName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(dropdowns, dropdownName, ctx);
        await actionUtils.selectByLabel(locator, optionLabel);
    }
);

/* --------------------------------------------------------
   CHECKBOXES
-------------------------------------------------------- */
When(
    'the user checks the {string} checkbox',
    async ({ getActivePage, actionUtils }, checkboxName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(checkboxes, checkboxName, ctx);
        await actionUtils.check(locator);
    }
);

/* --------------------------------------------------------
   RADIO BUTTONS
-------------------------------------------------------- */
When(
    'the user selects the {string} radio button',
    async ({ getActivePage, actionUtils }, radioName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(radios, radioName, ctx);
        await actionUtils.selectRadio(locator);
    }
);

Then(
    'the {string} radio button is selected',
    async ({ getActivePage }, radioName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(radios, radioName, ctx);
        const { expect } = require('@playwright/test');
        await expect(locator).toBeChecked();
    }
);

/* --------------------------------------------------------
   LINK CLICK (opens new tab)
-------------------------------------------------------- */
When(
    'the user clicks on the link {string}',
    async ({ page, getActivePage, actionUtils }, linkName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(links, linkName, ctx);

        const context = page.context();
        global.newTab = await actionUtils.waitForNewTab(context, () => locator.click());
    }
);

/* --------------------------------------------------------
   MODAL APPEARANCE / DISAPPEARANCE
-------------------------------------------------------- */
Then(
    'the {string} modal appears',
    async ({ getActivePage, actionUtils }, modalName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(modals, modalName, ctx);
        await actionUtils.waitForVisible(locator);
    }
);

Then(
    'the {string} modal disappears',
    async ({ getActivePage, actionUtils }, modalName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(modals, modalName, ctx);
        await actionUtils.waitForHidden(locator);
    }
);

/* --------------------------------------------------------
   ERROR MESSAGES
-------------------------------------------------------- */
Then(
    'an error message is displayed with text {string}',
    async ({ getActivePage, actionUtils }, errorText) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(errors, errorText, ctx);
        await actionUtils.expectText(locator, errorText);
    }
);

/* --------------------------------------------------------
   URL ASSERTIONS
-------------------------------------------------------- */
Then(
    'the current URL is {string}',
    async ({ actionUtils }, expectedUrl) => {
        await actionUtils.expectUrl(expectedUrl);
    }
);

Then(
    'the user logs in successfully and navigates to url {string}',
    async ({ actionUtils }, expectedUrl) => {
        await actionUtils.expectUrl(expectedUrl);
    }
);

Then(
    'a new tab opens with URL {string}',
    async ({ }, expectedUrl) => {
        const actionUtils = new ActionUtils(global.newTab);
        await actionUtils.expectUrl(expectedUrl);
    }
);

/* --------------------------------------------------------
   TAB / WINDOW MANAGEMENT
-------------------------------------------------------- */
When(
    'the user switches to the previous tab',
    async ({ page }) => {
        const pages = page.context().pages();
        await pages[0].bringToFront();
    }
);
