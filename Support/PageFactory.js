// ==========================================
// Support/PageFactory.js
// ==========================================

const fs = require('fs');
const path = require('path');

class PageFactory {
    constructor(page) {
        this.page = page;
        this.cache = {};
        this.registry = this._buildRegistry();
    }

    _buildRegistry() {
        const pagesDir = path.join(__dirname, '../pages');
        const registry = {};
        const files = fs.readdirSync(pagesDir);

        for (const file of files) {
            if (file.endsWith('Page.js') && file !== 'BasePage.js') {
                const fullPath = path.join(pagesDir, file);
                const pageKey = file.replace('Page.js', '').toLowerCase();
                const className = file.replace('.js', '');
                const exported = require(fullPath);

                if (!exported[className]) {
                    throw new Error(`${file} must export { ${className} }`);
                }

                registry[pageKey] = exported[className];
            }
        }

        return registry;
    }

    get(pageKey) {
        if (!this.cache[pageKey]) {
            const PageClass = this.registry[pageKey];
            if (!PageClass) {
                throw new Error(`Unknown page: ${pageKey}`);
            }
            this.cache[pageKey] = new PageClass(this.page);
        }
        return this.cache[pageKey];
    }

    getAll() {
        const all = {};
        for (const key of Object.keys(this.registry)) {
            all[key + 'Page'] = this.get(key);
        }
        return all;
    }
}

module.exports = { PageFactory };