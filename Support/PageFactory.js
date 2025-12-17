// ==========================================
// Support/PageFactory.js
// ==========================================

const pageRegistry = require('./pageRegistry');

class PageFactory {
    constructor(page) {
        this.page = page;
        this.cache = {};
    }

    get(pageKey) {
        if (!this.cache[pageKey]) {
            const PageClass = pageRegistry[pageKey];
            if (!PageClass) {
                throw new Error(`Unknown page: ${pageKey}`);
            }
            this.cache[pageKey] = new PageClass(this.page);
        }
        return this.cache[pageKey];
    }

    getAll() {
        const all = {};
        for (const key of Object.keys(pageRegistry)) {
            all[key + 'Page'] = this.get(key);
        }
        return all;
    }
}

module.exports = { PageFactory };

