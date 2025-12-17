// ==========================================
// pages/BasePage.js
// ==========================================

class BasePage {
    constructor(page, url = null) {
        this.page = page;
        this.url = url;
    }

    async navigate() {
        if (!this.url) {
            throw new Error(`No URL defined for ${this.constructor.name}`);
        }
        await this.page.goto(this.url, { waitUntil: 'networkidle' });
    }

    // Normalize URL
    normalize(url) {
        return url
            .replace(/\/$/, '')
            .toLowerCase();
    }

    // Determine if browser is on this page
    isAt() {
        if (!this.url) return false;

        const currentUrl = this.normalize(this.page.url());
        const pageUrl = this.normalize(this.url);

        return currentUrl === pageUrl || currentUrl.startsWith(pageUrl);
    }
}

module.exports = { BasePage };
