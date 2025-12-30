# Element Registry Documentation

**Version:** 1.0  
**Last Updated:** 2024  
**File:** `Support/elementRegistry.js`

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Concepts](#core-concepts)
4. [Element Categories](#element-categories)
5. [Validation System](#validation-system)
6. [Usage Guide](#usage-guide)
7. [Adding New Elements](#adding-new-elements)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)
10. [Examples](#examples)

---

## Overview

### What is Element Registry?

The Element Registry is a **centralized mapping system** that connects:
- **Logical names** (human-readable, used in Gherkin steps)
- **Technical locators** (Playwright selectors, defined in `.elements.js` files)

### Why Element Registry?

| Problem Without Registry | Solution With Registry |
|--------------------------|------------------------|
| Hardcoded selectors in steps | Centralized mapping |
| Difficult to maintain | Single source of truth |
| No validation | Automatic validation |
| Unclear element purpose | Semantic naming |
| Tight coupling | Loose coupling |

### Key Features

- **Automatic Validation** - Ensures all elements are registered
- **Semantic Naming** - Human-readable element names
- **Type Safety** - Category-based organization
- **Centralized Management** - Single file to manage all mappings
- **Self-Documenting** - Clear structure and naming

---

## Architecture

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GHERKIN FEATURE FILE                     │
│  When the user enters "john@example.com" in the "Username"  │
│  field                                                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    STEP DEFINITION                          │
│  const locator = resolveElement(field, 'Username', ctx)     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   ELEMENT REGISTRY                          │
│  field = {                                                  │
│    'Username': ({ active }) => active.usernameInput         │
│  }                                                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  ELEMENT FACTORY                            │
│  loginPage = {                                              │
│    usernameInput: locator('#username')                      │
│  }                                                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   PLAYWRIGHT LOCATOR                        │
│  page.locator('#username')                                  │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
project/
├── elements/
│   ├── login.elements.js       # Element definitions
│   ├── shop.elements.js
│   └── checkout.elements.js
├── Support/
│   ├── elementRegistry.js      # THIS FILE (central mapping)
│   └── ElementFactory.js       # Creates page objects
├── steps/
│   └── universal.steps.js      # Uses elementRegistry
└── .env.config.js              # Environment config
```

### Component Relationships

```
┌──────────────────┐
│ .elements.js     │──────┐
│ (Technical)      │      │
└──────────────────┘      │
                          ▼
                    ┌──────────────────┐
                    │ elementRegistry  │
                    │ (Mapping Layer)  │
                    └──────────────────┘
                          │
┌──────────────────┐      │
│ Step Definitions │◄─────┘
│ (Logical Names)  │
└──────────────────┘
```

---

## Core Concepts

### 1. Logical Names vs Technical Locators

**Logical Name** (What users see in Gherkin):
```gherkin
When the user clicks the "Sign In" button
```

**Technical Locator** (What developers define):
```javascript
loginButton: { role: 'button', name: 'Sign In' }
```

**Mapping** (How they connect):
```javascript
const button = {
    'Sign In': ({ active }) => active.loginButton
};
```

### 2. Context Object

The context object provides access to the active page:

```javascript
const context = {
    active: loginPage  // Current page object
};
```

### 3. Resolver Functions

Each mapping is a **resolver function** that returns a locator:

```javascript
'Username': ({ active }) => active.usernameInput
//          ^context      ^returns locator
```

**Breakdown:**
- `({ active })` - Destructures context to get active page
- `=>` - Arrow function syntax
- `active.usernameInput` - Returns the Playwright locator

### 4. Category-Based Organization

Elements are organized by **UI component type**:

| Category | Purpose | Examples |
|----------|---------|----------|
| `field` | Input fields | Username, Password, Email |
| `dropdown` | Select elements | Country, User Type |
| `button` | Buttons | Submit, Cancel, Sign In |
| `checkbox` | Checkboxes | Terms & Conditions, Remember Me |
| `radio` | Radio buttons | Gender, Payment Method |
| `link` | Links | Forgot Password, Sign Up |
| `modal` | Modals/Dialogs | Confirmation, Alert |
| `error` | Error messages | Validation errors |

---

## Element Categories

### Field Category

**Purpose:** Text inputs, text areas, email fields, password fields

```javascript
const field = {
    'Username': ({ active }) => active.usernameInput,
    'Password': ({ active }) => active.passwordInput,
    'Email': ({ active }) => active.emailInput
};
```

**Usage in Gherkin:**
```gherkin
When the user enters "john" in the "Username" field
And the user enters "secret123" in the "Password" field
```

---

### Dropdown Category

**Purpose:** Select elements, dropdowns

```javascript
const dropdown = {
    'User Type': ({ active }) => active.userTypeDropdown,
    'Country': ({ active }) => active.countryDropdown
};
```

**Usage in Gherkin:**
```gherkin
When the user selects "Admin" from the "User Type" dropdown
```

---

### Button Category

**Purpose:** Clickable buttons

```javascript
const button = {
    'Sign In': ({ active }) => active.loginButton,
    'Okay': ({ active }) => active.okayButton,
    'Cancel': ({ active }) => active.cancelButton
};
```

**Usage in Gherkin:**
```gherkin
When the user clicks the "Sign In" button
```

---

### Checkbox Category

**Purpose:** Checkbox elements

```javascript
const checkbox = {
    'I Agree to the terms and conditions': ({ active }) => active.termsCheckbox,
    'Remember Me': ({ active }) => active.rememberMeCheckbox
};
```

**Usage in Gherkin:**
```gherkin
When the user checks the "Remember Me" checkbox
```

---

### Radio Category

**Purpose:** Radio button elements

```javascript
const radio = {
    'Admin': ({ active }) => active.adminRadio,
    'User': ({ active }) => active.userRadio
};
```

**Usage in Gherkin:**
```gherkin
When the user selects the "Admin" radio button
```

---

### Link Category

**Purpose:** Hyperlinks, navigation links

```javascript
const link = {
    'Free Access to InterviewQues/ResumeAssistance/Material': ({ active }) => active.blinkingTextLink,
    'Forgot Password': ({ active }) => active.forgotPasswordLink
};
```

**Usage in Gherkin:**
```gherkin
When the user clicks the "Forgot Password" link
```

---

### Modal Category

**Purpose:** Modal dialogs, popups

```javascript
const modal = {
    'User Role Warning': ({ active }) => active.modal,
    'Confirmation Dialog': ({ active }) => active.confirmationModal
};
```

**Usage in Gherkin:**
```gherkin
Then the "User Role Warning" modal should be visible
```

---

### Error Category

**Purpose:** Error messages, validation messages

```javascript
const error = {
    'Empty username/password.': ({ active }) => active.errorEmptyCredentials,
    'Invalid email format': ({ active }) => active.errorInvalidEmail
};
```

**Usage in Gherkin:**
```gherkin
Then the user should see the "Empty username/password." error
```

---

## Validation System

### How Validation Works

The Element Registry includes **automatic validation** that runs when the module loads.

#### Validation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Module Load (require('./elementRegistry'))              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. validateRegistry() runs automatically                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Scan elements/ directory                                 │
│    - Find all .elements.js files                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Load each file with require()                           │
│    - Get element properties with Object.keys()             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Check if each property is registered                    │
│    - Loop through ELEMENT_CATEGORIES                       │
│    - Check resolver functions for property reference       │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ All Registered   │      │ Missing Elements │
    │ ✓ Continue       │      │ ✗ Throw Error    │
    └──────────────────┘      └──────────────────┘
```

### Validation Algorithm

**Step-by-Step:**

1. **Directory Check**
   ```javascript
   if (!fs.existsSync(elementsDir)) return; // Skip if no elements folder
   ```

2. **File Discovery**
   ```javascript
   const files = fs.readdirSync(elementsDir);
   // Find all .elements.js files
   ```

3. **Module Loading**
   ```javascript
   const elementMap = require(filePath);
   // Load as JavaScript module (not text!)
   ```

4. **Property Extraction**
   ```javascript
   const elementProperties = Object.keys(elementMap);
   // ['usernameInput', 'passwordInput', 'loginButton']
   ```

5. **Registration Check**
   ```javascript
   for (const category of Object.values(ELEMENT_CATEGORIES)) {
       for (const resolver of Object.values(category)) {
           if (resolverStr.includes(`active.${elementProperty}`)) {
               isRegistered = true;
           }
       }
   }
   ```

6. **Error Reporting**
   ```javascript
   if (unregistered.length > 0) {
       throw new Error('ELEMENT REGISTRY VALIDATION FAILED');
   }
   ```

### Why No Regex?

**Traditional Approach (Regex):**
```javascript
// Read file as text
const content = fs.readFileSync(filePath, 'utf-8');
// Parse with regex
const match = /(\w+)\s*:\s*\{\s*selector:/.exec(content);
```

**Problems:**
- Slow (text parsing + regex)
- Fragile (breaks with different formatting)
- Complex (hard to maintain)
- Manual comment handling

**Optimized Approach (require):**
```javascript
// Load as module
const elementMap = require(filePath);
// Get keys
const properties = Object.keys(elementMap);
```

**Benefits:**
- Fast (native JavaScript)
- Robust (handles all syntax)
- Simple (built-in functionality)
- Automatic comment exclusion

### Validation Error Example

**Error Output:**
```
ELEMENT REGISTRY VALIDATION FAILED

Found 2 unregistered element(s):

  submitButton (in login.elements.js)
  emailInput (in checkout.elements.js)

Fix: Add these elements to Support/elementRegistry.js in the appropriate category.
```

---

## Usage Guide

### Basic Workflow

#### 1. Define Element in `.elements.js`

```javascript
// elements/login.elements.js
module.exports = {
    usernameInput: { role: 'textbox', name: 'Username:' },
    passwordInput: { role: 'textbox', name: 'Password:' },
    loginButton: { role: 'button', name: 'Sign In' }
};
```

#### 2. Register in `elementRegistry.js`

```javascript
// Support/elementRegistry.js
const field = {
    'Username': ({ active }) => active.usernameInput,
    'Password': ({ active }) => active.passwordInput
};

const button = {
    'Sign In': ({ active }) => active.loginButton
};
```

#### 3. Use in Step Definitions

```javascript
// steps/universal.steps.js
const { field, button } = require('../Support/elementRegistry');

When('the user enters {string} in the {string} field', async (value, fieldName) => {
    const context = buildContext(() => factory.getPage('login'));
    const locator = resolveElement(field, fieldName, context);
    await locator.fill(value);
});

When('the user clicks the {string} button', async (buttonName) => {
    const context = buildContext(() => factory.getPage('login'));
    const locator = resolveElement(button, buttonName, context);
    await locator.click();
});
```

#### 4. Write Gherkin Scenarios

```gherkin
Feature: Login

  Scenario: Successful login
    Given the user is on the login page
    When the user enters "john@example.com" in the "Username" field
    And the user enters "secret123" in the "Password" field
    And the user clicks the "Sign In" button
    Then the user should be logged in
```

---

## Adding New Elements

### Complete Step-by-Step Guide

#### Example: Adding "Forgot Password" Link

**Step 1: Add to `.elements.js`**

```javascript
// elements/login.elements.js
module.exports = {
    usernameInput: { role: 'textbox', name: 'Username:' },
    passwordInput: { role: 'textbox', name: 'Password:' },
    loginButton: { role: 'button', name: 'Sign In' },
    
    // NEW ELEMENT
    forgotPasswordLink: { role: 'link', name: 'Forgot Password?' }
};
```

**Step 2: Run Tests (Validation Catches It)**

```bash
npm test

# Output:
ELEMENT REGISTRY VALIDATION FAILED

Found 1 unregistered element(s):

  forgotPasswordLink (in login.elements.js)

Fix: Add these elements to Support/elementRegistry.js in the appropriate category.
```

**Step 3: Register in `elementRegistry.js`**

```javascript
// Support/elementRegistry.js

const link = {
    'Free Access to InterviewQues/ResumeAssistance/Material': ({ active }) => active.blinkingTextLink,
    'Forgot Password': ({ active }) => active.forgotPasswordLink  // ADD HERE
};
```

**Step 4: Run Tests Again**

```bash
npm test
# No errors - validation passes!
```

**Step 5: Use in Gherkin**

```gherkin
When the user clicks the "Forgot Password" link
```

---

### Adding a New Category

**Example: Adding "icon" Category**

**Step 1: Define Category Constant**

```javascript
// Support/elementRegistry.js

const icon = {
    'Search': ({ active }) => active.searchIcon,
    'Menu': ({ active }) => active.menuIcon,
    'Notification': ({ active }) => active.notificationIcon
};
```

**Step 2: Add to ELEMENT_CATEGORIES**

```javascript
const ELEMENT_CATEGORIES = {
    field,
    dropdown,
    button,
    checkbox,
    radio,
    link,
    modal,
    error,
    icon  // ADD HERE
};
```

**Step 3: Add to Exports**

```javascript
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
    icon,  // ADD HERE

    // Category Registry
    ELEMENT_CATEGORIES,

    // Helper Functions
    buildContext,
    resolveElement,
    resolveValue
};
```

**Step 4: Use in Step Definitions**

```javascript
const { icon } = require('../Support/elementRegistry');

When('the user clicks the {string} icon', async (iconName) => {
    const context = buildContext(() => factory.getPage('home'));
    const locator = resolveElement(icon, iconName, context);
    await locator.click();
});
```

**Step 5: Use in Gherkin**

```gherkin
When the user clicks the "Search" icon
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "ELEMENT REGISTRY VALIDATION FAILED"

**Error:**
```
ELEMENT REGISTRY VALIDATION FAILED

Found 1 unregistered element(s):

  submitButton (in login.elements.js)
```

**Cause:** Element defined in `.elements.js` but not registered in `elementRegistry.js`

**Solution:**

1. Identify the category (button, field, link, etc.)
2. Add mapping to appropriate category:

```javascript
const button = {
    'Sign In': ({ active }) => active.loginButton,
    'Submit': ({ active }) => active.submitButton  // ADD THIS
};
```

---

#### Issue 2: "Element not found in elementMaps"

**Error:**
```
Error: Element "Submit" not found in elementMaps.
Add "Submit" to the correct element category in elementMaps.js
```

**Cause:** Using an element name in Gherkin that isn't registered

**Solution:**

Check the exact name in `elementRegistry.js`:

```javascript
// If you have:
const button = {
    'Sign In': ({ active }) => active.loginButton
};

// You must use this exact name in Gherkin:
When the user clicks the "Sign In" button  ✓ Correct
When the user clicks the "sign in" button  ✗ Wrong (case-sensitive)
When the user clicks the "SignIn" button   ✗ Wrong (no space)
```

---

#### Issue 3: "Could not load login.elements.js"

**Error:**
```
Could not load login.elements.js: Unexpected token
```

**Cause:** Syntax error in `.elements.js` file

**Solution:**

Check file syntax:

```javascript
// CORRECT
module.exports = {
    usernameInput: { selector: '#username' },
    passwordInput: { selector: '#password' }
};

// WRONG - Missing comma
module.exports = {
    usernameInput: { selector: '#username' }
    passwordInput: { selector: '#password' }  // ✗ Syntax error
};
```

---

#### Issue 4: Context/Active Page is Undefined

**Error:**
```
TypeError: Cannot read property 'usernameInput' of undefined
```

**Cause:** Page object not loaded properly

**Solution:**

Ensure context is built correctly:

```javascript
// CORRECT
const context = buildContext(() => factory.getPage('login'));
const locator = resolveElement(field, 'Username', context);

// WRONG - Missing buildContext
const locator = resolveElement(field, 'Username', { active: undefined });
```

---

#### Issue 5: Element Works in `.elements.js` but not in Registry

**Symptom:** Validation passes but element doesn't work at runtime

**Cause:** Property name mismatch

**Check:**

```javascript
// elements/login.elements.js
module.exports = {
    usernameInput: { selector: '#username' }  // Property name
};

// Support/elementRegistry.js
const field = {
    'Username': ({ active }) => active.usernameInput  // Must match exactly
    //                                  ^^^^^^^^^^^^^ Same name!
};
```

---

## API Reference

### Helper Functions

#### buildContext(getActivePage)

Creates a context object for element resolution.

**Parameters:**
- `getActivePage` (Function) - Function that returns the active page object

**Returns:**
- `Object` - Context object with `active` property

**Example:**
```javascript
const context = buildContext(() => factory.getPage('login'));
// Returns: { active: loginPageObject }
```

---

#### resolveElement(elementCategory, elementName, context)

Resolves a logical element name to a Playwright locator.

**Parameters:**
- `elementCategory` (Object) - Category object (field, button, etc.)
- `elementName` (String) - Logical name from Gherkin
- `context` (Object) - Context object with active page

**Returns:**
- `Locator` - Playwright locator

**Throws:**
- `Error` - If element name not found in category

**Example:**
```javascript
const locator = resolveElement(field, 'Username', context);
// Returns: page.locator('#username')
```

---

#### resolveValue(value)

Resolves environment variables or returns the value as-is.

**Parameters:**
- `value` (String) - Value to resolve

**Returns:**
- `String` - Resolved value from `.env.config` or original value

**Example:**
```javascript
resolveValue('APP_USERNAME');  // Returns: 'rahulshettyacademy'
resolveValue('john@test.com'); // Returns: 'john@test.com'
```

---

### Category Objects

Each category is an object with logical names as keys and resolver functions as values.

**Structure:**
```javascript
const categoryName = {
    'Logical Name': ({ active }) => active.technicalProperty
};
```

**Available Categories:**
- `field` - Input fields
- `dropdown` - Dropdowns/selects
- `button` - Buttons
- `checkbox` - Checkboxes
- `radio` - Radio buttons
- `link` - Links
- `modal` - Modals/dialogs
- `error` - Error messages

---

### ELEMENT_CATEGORIES

Registry of all categories for validation and dynamic access.

**Type:** `Object`

**Structure:**
```javascript
{
    field: { ... },
    dropdown: { ... },
    button: { ... },
    checkbox: { ... },
    radio: { ... },
    link: { ... },
    modal: { ... },
    error: { ... }
}
```

**Usage:**
```javascript
// Dynamic category access
const categoryName = 'button';
const category = ELEMENT_CATEGORIES[categoryName];
```

---

## Examples

### Example 1: Complete Login Flow

**elements/login.elements.js:**
```javascript
module.exports = {
    usernameInput: { role: 'textbox', name: 'Username:' },
    passwordInput: { role: 'textbox', name: 'Password:' },
    termsCheckbox: { role: 'checkbox', name: 'I Agree' },
    loginButton: { role: 'button', name: 'Sign In' },
    errorMessage: { text: 'Invalid credentials' }
};
```

**Support/elementRegistry.js:**
```javascript
const field = {
    'Username': ({ active }) => active.usernameInput,
    'Password': ({ active }) => active.passwordInput
};

const checkbox = {
    'Terms and Conditions': ({ active }) => active.termsCheckbox
};

const button = {
    'Sign In': ({ active }) => active.loginButton
};

const error = {
    'Invalid credentials': ({ active }) => active.errorMessage
};
```

**steps/login.steps.js:**
```javascript
const { field, checkbox, button, error, buildContext, resolveElement } = require('../Support/elementRegistry');

When('the user enters {string} in the {string} field', async (value, fieldName) => {
    const context = buildContext(() => factory.getPage('login'));
    const locator = resolveElement(field, fieldName, context);
    await locator.fill(value);
});

When('the user checks the {string} checkbox', async (checkboxName) => {
    const context = buildContext(() => factory.getPage('login'));
    const locator = resolveElement(checkbox, checkboxName, context);
    await locator.check();
});

When('the user clicks the {string} button', async (buttonName) => {
    const context = buildContext(() => factory.getPage('login'));
    const locator = resolveElement(button, buttonName, context);
    await locator.click();
});

Then('the user should see the {string} error', async (errorName) => {
    const context = buildContext(() => factory.getPage('login'));
    const locator = resolveElement(error, errorName, context);
    await expect(locator).toBeVisible();
});
```

**Feature:**
```gherkin
Feature: Login

  Scenario: Successful login
    Given the user is on the login page
    When the user enters "john@example.com" in the "Username" field
    And the user enters "secret123" in the "Password" field
    And the user checks the "Terms and Conditions" checkbox
    And the user clicks the "Sign In" button
    Then the user should be logged in

  Scenario: Invalid credentials
    Given the user is on the login page
    When the user enters "wrong@example.com" in the "Username" field
    And the user enters "wrongpass" in the "Password" field
    And the user clicks the "Sign In" button
    Then the user should see the "Invalid credentials" error
```

---

### Example 2: Multi-Page Scenario

**elements/shop.elements.js:**
```javascript
module.exports = {
    productTitle: { selector: '.product-name' },
    addToCartButton: { selector: '#add-to-cart' },
    cartIcon: { selector: '.cart-icon' }
};
```

**elements/cart.elements.js:**
```javascript
module.exports = {
    checkoutButton: { selector: '#checkout' },
    totalPrice: { selector: '.total-amount' }
};
```

**Support/elementRegistry.js:**
```javascript
const button = {
    'Sign In': ({ active }) => active.loginButton,
    'Add to Cart': ({ active }) => active.addToCartButton,
    'Checkout': ({ active }) => active.checkoutButton
};

const icon = {
    'Cart': ({ active }) => active.cartIcon
};

const text = {
    'Product Title': ({ active }) => active.productTitle,
    'Total Price': ({ active }) => active.totalPrice
};
```

**Feature:**
```gherkin
Feature: Shopping

  Scenario: Purchase product
    Given the user is on the shop page
    When the user clicks the "Add to Cart" button
    And the user clicks the "Cart" icon
    Then the user should see the "Total Price" text
    When the user clicks the "Checkout" button
    Then the user should be on the checkout page
```

---

### Example 3: Dynamic Context Switching

**Step Definition with Multiple Pages:**
```javascript
let currentPage = 'login';

Given('the user is on the {string} page', async (pageName) => {
    currentPage = pageName;
    await page.goto(`/${pageName}`);
});

When('the user clicks the {string} button', async (buttonName) => {
    // Dynamic page context
    const context = buildContext(() => factory.getPage(currentPage));
    const locator = resolveElement(button, buttonName, context);
    await locator.click();
});
```

**Feature:**
```gherkin
Scenario: Multi-page flow
  Given the user is on the "login" page
  When the user clicks the "Sign In" button
  
  Given the user is on the "shop" page
  When the user clicks the "Add to Cart" button
  
  Given the user is on the "cart" page
  When the user clicks the "Checkout" button
```

---

## Quick Reference Cheat Sheet

### Adding New Element Checklist

- [ ] Define element in `elements/[page].elements.js`
- [ ] Run tests (validation will catch missing registration)
- [ ] Add mapping to appropriate category in `elementRegistry.js`
- [ ] Run tests again (validation should pass)
- [ ] Use in Gherkin with exact registered name

### Common Patterns

**Field Pattern:**
```javascript
'Field Name': ({ active }) => active.fieldProperty
```

**Button Pattern:**
```javascript
'Button Name': ({ active }) => active.buttonProperty
```

**Error Pattern:**
```javascript
'Error Message Text': ({ active }) => active.errorProperty
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Logical Name | Title Case with Spaces | "Sign In", "User Type" |
| Property Name | camelCase | usernameInput, loginButton |
| Category Name | lowercase | field, button, dropdown |
| File Name | kebab-case | login.elements.js |

### File Locations

| File | Location | Purpose |
|------|----------|---------|
| Element Registry | `Support/elementRegistry.js` | Central mapping |
| Element Definitions | `elements/*.elements.js` | Technical locators |
| Step Definitions | `steps/*.steps.js` | Uses registry |
| Environment Config | `.env.config.js` | Configuration |

---

## Maintenance Guide

### When to Update Element Registry

1. **Adding new UI elements** - Always register immediately
2. **Renaming elements** - Update both `.elements.js` and registry
3. **Removing elements** - Remove from both files
4. **Refactoring** - Keep registry in sync

### Best Practices

1. **Consistent Naming** - Use clear, descriptive logical names
2. **Category Organization** - Place elements in correct category
3. **Documentation** - Comment complex mappings
4. **Validation First** - Run tests after any change
5. **Single Responsibility** - One element per property

### Code Review Checklist

- [ ] All new elements are registered
- [ ] Logical names are clear and consistent
- [ ] Correct category used
- [ ] No typos in property names
- [ ] Validation passes
- [ ] Tests run successfully

---

**End of Documentation**

*For questions or issues, refer to this document or contact the framework maintainer.*