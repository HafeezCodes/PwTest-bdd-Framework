// ==========================================
// Support/elementRegistry.js
// ==========================================

const envConfig = require('../.env.config');

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

    // Helper Functions
    buildContext,
    resolveElement,
    resolveValue
};