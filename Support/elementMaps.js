// ==========================================
// Support/elementMaps.js
// ==========================================

module.exports = {

    field: {
        'Username': ({ active }) => active.usernameInput,
        'Password': ({ active }) => active.passwordInput
    },

    dropdown: {
        'User Type': ({ active }) => active.userTypeDropdown
    },

    button: {
        'Sign In': ({ active }) => active.loginButton,
        'Okay': ({ active }) => active.okayButton,
        'Cancel': ({ active }) => active.cancelButton
    },

    checkbox: {
        'I Agree to the terms and conditions': ({ active }) => active.termsCheckbox
    },

    radio: {
        'Admin': ({ active }) => active.adminRadio,
        'User': ({ active }) => active.userRadio
    },

    link: {
        'Free Access to InterviewQues/ResumeAssistance/Material': ({ active }) => active.blinkingTextLink
    },

    modal: {
        'User Role Warning': ({ active }) => active.modal
    },

    error: {
        'Empty username/password.': ({ active }) => active.errorEmptyCredentials
    }
};
