// ==========================================
// Support/ElementFactory.js (Optimized)
// ==========================================

const elements = require('../elements');

class ElementFactory {
    constructor(page) {
        this.page = page;
    }

    // Get a single element by path
    get(elementPath) {
        const [categoryName, elementName] = elementPath.split('.');
        const elementDefinition = this.getElementDefinition(categoryName, elementName);
        return this.createLocator(elementDefinition);
    }

    // Get all elements from a category
    getAll(categoryName) {
        const categoryElements = this.getCategoryElements(categoryName);
        const playwrightLocators = {};

        for (const [elementName, elementDefinition] of Object.entries(categoryElements)) {
            playwrightLocators[elementName] = this.createLocator(elementDefinition);
        }

        return playwrightLocators;
    }

    // Helper: Get category or throw error
    getCategoryElements(categoryName) {
        const categoryElements = elements[categoryName];
        if (!categoryElements) {
            throw new Error(`Category not found: ${categoryName}`);
        }
        return categoryElements;
    }

    // Helper: Get element definition or throw error
    getElementDefinition(categoryName, elementName) {
        const categoryElements = this.getCategoryElements(categoryName);
        const elementDefinition = categoryElements[elementName];
        if (!elementDefinition) {
            throw new Error(`Element not found: ${elementName} in ${categoryName}`);
        }
        return elementDefinition;
    }

    // Convert element definition to Playwright locator
    createLocator(elementDefinition) {
        const {
            role,
            name,
            testId,
            text,
            placeholder,
            locator,
            label,
            altText,
            title,
            frame
        } = elementDefinition;

        if (role) return this.page.getByRole(role, name ? { name } : undefined);
        if (testId) return this.page.getByTestId(testId);
        if (text) return this.page.getByText(text);
        if (placeholder) return this.page.getByPlaceholder(placeholder);
        if (label) return this.page.getByLabel(label);
        if (altText) return this.page.getByAltText(altText);
        if (title) return this.page.getByTitle(title);
        if (frame) return this.page.frameLocator(frame);
        if (locator) return this.page.locator(locator);

        throw new Error(`Invalid element definition: ${JSON.stringify(elementDefinition)}`);
    }
}

module.exports = { ElementFactory };
