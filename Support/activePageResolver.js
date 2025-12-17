// ==========================================
// Support/activePageResolver.js
// ==========================================

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

module.exports = { resolveActivePage };

