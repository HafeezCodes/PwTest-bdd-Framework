// ==========================================
// Support/elementMaps.js
// ==========================================

module.exports = {

    fields: {
        'Username': ({ active }) => active.usernameInput,
        'Password': ({ active }) => active.passwordInput
    },

    dropdowns: {
        'User Type': ({ active }) => active.userTypeDropdown
    },

    buttons: {
        'Sign In': ({ active }) => active.loginButton,
        'Okay': ({ active }) => active.okayButton,
        'Cancel': ({ active }) => active.cancelButton
    },

    checkboxes: {
        'I Agree to the terms and conditions': ({ active }) => active.termsCheckbox
    },

    radios: {
        'Admin': ({ active }) => active.adminRadio,
        'User': ({ active }) => active.userRadio
    },

    links: {
        'Free Access to InterviewQues/ResumeAssistance/Material': ({ active }) => active.blinkingTextLink
    },

    modals: {
        'User Role Warning': ({ active }) => active.modal
    },

    errors: {
        'Empty username/password.': ({ active }) => active.errorEmptyCredentials
    }
};
