// ==========================================
// Support/elementRegistry.js
// ==========================================

const envConfig = require('../.env.config');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

function buildContext(getActivePage) {
    return {
        active: getActivePage()
    };
}

function resolveElement(elementCategory, elementName, context) {
    const resolver = elementCategory[elementName];
    if (!resolver) {
        throw new Error(
            `Element "${elementName}" not found in elementMaps. ` +
            `Add "${elementName}" to the correct element category in elementMaps.js`
        );
    }
    return resolver(context);
}

function resolveValue(value) {
    if (envConfig[value]) {
        return envConfig[value];
    }
    return value;
}

// ─────────────────────────────────────────────────────────────
// ELEMENT MAPPINGS
// ─────────────────────────────────────────────────────────────

const field = {
    'Username': ({ active }) => active.usernameInput,
    'Password': ({ active }) => active.passwordInput
};

const dropdown = {
    'User Type': ({ active }) => active.userTypeDropdown
};

const button = {
    'Sign In': ({ active }) => active.loginButton,
    'Okay': ({ active }) => active.okayButton,
    'Cancel': ({ active }) => active.cancelButton
};

const checkbox = {
    'I Agree to the terms and conditions': ({ active }) => active.termsCheckbox
};

const radio = {
    'Admin': ({ active }) => active.adminRadio,
    'User': ({ active }) => active.userRadio
};

const link = {
    'Free Access to InterviewQues/ResumeAssistance/Material': ({ active }) => active.blinkingTextLink
};

const modal = {
    'User Role Warning': ({ active }) => active.modal
};

const error = {
    'Empty username/password.': ({ active }) => active.errorEmptyCredentials
};

// ─────────────────────────────────────────────────────────────
// CATEGORY REGISTRY
// ─────────────────────────────────────────────────────────────

const ELEMENT_CATEGORIES = {
    field,
    dropdown,
    button,
    checkbox,
    radio,
    link,
    modal,
    error
};

// ─────────────────────────────────────────────────────────────
// OPTIMIZED VALIDATION (No Regex!)
// ─────────────────────────────────────────────────────────────

function validateRegistry() {
    const elementsDir = path.join(__dirname, '../elements');

    // Skip if elements directory doesn't exist
    if (!fs.existsSync(elementsDir)) {
        return;
    }

    const files = fs.readdirSync(elementsDir);
    const unregistered = [];

    // Scan all .elements.js files
    for (const file of files) {
        if (file.endsWith('.elements.js')) {
            const filePath = path.join(elementsDir, file);

            try {
                // Load the file as a JavaScript module
                const elementMap = require(filePath);

                // Get all element property names
                const elementProperties = Object.keys(elementMap);

                // Check each property
                for (const elementProperty of elementProperties) {
                    let isRegistered = false;

                    // Check if this property is referenced in any category
                    for (const category of Object.values(ELEMENT_CATEGORIES)) {
                        for (const resolver of Object.values(category)) {
                            const resolverStr = resolver.toString();

                            // Check if resolver references this property
                            if (resolverStr.includes(`active.${elementProperty}`)) {
                                isRegistered = true;
                                break;
                            }
                        }
                        if (isRegistered) break;
                    }

                    if (!isRegistered) {
                        unregistered.push({
                            file: file,
                            property: elementProperty
                        });
                    }
                }
            } catch (error) {
                console.warn(`Could not load ${file}: ${error.message}`);
            }
        }
    }

    // Report and throw error if unregistered elements found
    if (unregistered.length > 0) {
        const errorMessage = [
            '\nELEMENT REGISTRY VALIDATION FAILED',
            `\nFound ${unregistered.length} unregistered element(s):\n`
        ];

        unregistered.forEach(({ file, property }) => {
            errorMessage.push(`  ${property} (in ${file})`);
        });

        errorMessage.push('\nFix: Add these elements to Support/elementRegistry.js in the appropriate category.\n');

        // Always throw error - validation is mandatory
        throw new Error(errorMessage.join('\n'));
    }
}

// Run validation immediately when module loads
validateRegistry();

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
    // Element Maps
    field,
    dropdown,
    button,
    checkbox,
    radio,
    link,
    modal,
    error,

    // Category Registry
    ELEMENT_CATEGORIES,

    // Helper Functions
    buildContext,
    resolveElement,
    resolveValue
};
