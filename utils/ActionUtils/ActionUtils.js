// ==========================================
// utils/ActionUtils.js
// ==========================================

const { expect } = require('@playwright/test');

class ActionUtils {
    constructor(page) {
        this.page = page;
    }

    async goto(url) {
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    async expectUrl(url) {
        await expect(this.page).toHaveURL(url);
    }

    async click(locator) {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
    }

    async fill(locator, text) {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(text);
    }

    async press(locator, key) {
        await locator.waitFor({ state: 'visible' });
        await locator.press(key);
    }

    async check(locator) {
        await locator.waitFor({ state: 'visible' });
        if (!(await locator.isChecked())) {
            await locator.check();
        }
    }

    async uncheck(locator) {
        await locator.waitFor({ state: 'visible' });
        if (await locator.isChecked()) {
            await locator.uncheck();
        }
    }

    async selectRadio(locator) {
        await locator.waitFor({ state: 'visible' });
        await locator.check();
    }

    async selectByLabel(locator, label) {
        await locator.waitFor({ state: 'visible' });
        await locator.selectOption({ label });
    }

    async selectByValue(locator, value) {
        await locator.waitFor({ state: 'visible' });
        await locator.selectOption(value);
    }

    async waitForVisible(locator) {
        await locator.waitFor({ state: 'visible' });
    }

    async waitForHidden(locator) {
        await locator.waitFor({ state: 'hidden' });
    }

    async expectVisible(locator) {
        await expect(locator).toBeVisible();
    }

    async expectHidden(locator) {
        await expect(locator).toBeHidden();
    }

    async expectText(locator, text) {
        await expect(locator).toBeVisible();
        await expect(locator).toHaveText(text);
    }

    async expectContainsText(locator, text) {
        await expect(locator).toBeVisible();
        await expect(locator).toContainText(text);
    }

    async expectChecked(locator) {
        await expect(locator).toBeChecked();
    }

    async waitForNewTab(context, clickingAction) {
        const newPagePromise = context.waitForEvent('page');
        await clickingAction();
        const newPage = await newPagePromise;
        await newPage.waitForLoadState('networkidle');
        return newPage;
    }

    async waitForNewTabs(context, clickingAction, expectedCount) {
        const openedPages = [];
        const listener = (page) => {
            openedPages.push(page);
        };
        context.on('page', listener);
        await clickingAction();
        while (openedPages.length < expectedCount) {
            await new Promise(r => setTimeout(r, 50));
        }
        context.off('page', listener);
        for (const page of openedPages) {
            await page.waitForLoadState('networkidle');
        }
        return openedPages;
    }

    async getText(locator) {
        await locator.waitFor({ state: 'visible' });
        return await locator.textContent();
    }

    async isVisible(locator) {
        return await locator.isVisible();
    }
}

module.exports = { ActionUtils };