// ==========================================
// elements/login.elements.js
// ==========================================

module.exports = {
    // ─────────────────────────────────────────────────────────────
    // FORM INPUTS
    // ─────────────────────────────────────────────────────────────
    usernameInput: { role: 'textbox', name: 'Username:' },
    passwordInput: { role: 'textbox', name: 'Password:' },
    termsCheckbox: { role: 'checkbox', name: 'I Agree to the terms and conditions' },

    // ─────────────────────────────────────────────────────────────
    // BUTTONS
    // ─────────────────────────────────────────────────────────────
    loginButton: { role: 'button', name: 'Sign In' },

    // ─────────────────────────────────────────────────────────────
    // MESSAGES
    // ─────────────────────────────────────────────────────────────
    errorEmptyCredentials: { text: 'Empty username/password.' },

    // ─────────────────────────────────────────────────────────────
    // LINKS
    // ─────────────────────────────────────────────────────────────
    blinkingTextLink: { locator: '.blinkingText' },

    // ─────────────────────────────────────────────────────────────
    // MODAL
    // ─────────────────────────────────────────────────────────────
    modal: { locator: '#myModal' },
    okayButton: { locator: '#okayBtn' },
    cancelButton: { locator: '#cancelBtn' },
};
