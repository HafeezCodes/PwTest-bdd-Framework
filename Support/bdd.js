// ==========================================
// Support/bdd.js
// ==========================================

const { createBdd } = require('playwright-bdd');
const { test } = require('./fixtures');

const { Given, When, Then } = createBdd(test);

module.exports = { Given, When, Then };