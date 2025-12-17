// ==========================================
// Support/pageRegistry.js
// ==========================================

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../pages');
const registry = {};

const files = fs.readdirSync(pagesDir);

for (const file of files) {
    if (file.endsWith('Page.js') && file !== 'BasePage.js') {
        const fullPath = path.join(pagesDir, file);
        const pageKey = file.replace('Page.js', '').toLowerCase();
        const exported = require(fullPath);
        const className = Object.keys(exported)[0];
        registry[pageKey] = exported[className];
    }
}

module.exports = registry;

