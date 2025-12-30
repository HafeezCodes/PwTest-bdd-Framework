# ElementFactory Documentation

---

## Overview

ElementFactory is a utility class that converts element definitions into Playwright locators. It acts as a bridge between static element definitions and dynamic Playwright page objects.

---

## Purpose

| Problem | Solution |
|---------|----------|
| Element definitions don't have access to `page` | ElementFactory receives `page` at runtime |
| Repetitive locator creation code | Centralized `createLocator()` method |
| Manual element assignment in pages | `getAll()` with `Object.assign()` |

---

## File Location

```
project/
├── Support/
│   └── ElementFactory.js    ← This file
├── elements/
│   ├── index.js
│   ├── login.elements.js
│   └── common.elements.js
└── pages/
    └── LoginPage.js         ← Uses ElementFactory
```

---

## Complete Code

```javascript
// ==========================================
// Support/ElementFactory.js
// ==========================================

const elements = require('../elements');

class ElementFactory {
    constructor(page) {
        this.page = page;
    }

    get(elementPath) {
        const [categoryName, elementName] = elementPath.split('.');
        const elementDefinition = this.getElementDefinition(categoryName, elementName);
        return this.createLocator(elementDefinition);
    }

    getAll(categoryName) {
        const categoryElements = this.getCategoryElements(categoryName);
        const playwrightLocators = {};

        for (const [elementName, elementDefinition] of Object.entries(categoryElements)) {
            playwrightLocators[elementName] = this.createLocator(elementDefinition);
        }

        return playwrightLocators;
    }

    getCategoryElements(categoryName) {
        const categoryElements = elements[categoryName];
        if (!categoryElements) {
            throw new Error(`Category not found: ${categoryName}`);
        }
        return categoryElements;
    }

    getElementDefinition(categoryName, elementName) {
        const categoryElements = this.getCategoryElements(categoryName);
        const elementDefinition = categoryElements[elementName];
        if (!elementDefinition) {
            throw new Error(`Element not found: ${elementName} in ${categoryName}`);
        }
        return elementDefinition;
    }

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
```

---

## Methods

### constructor(page)

**Purpose:** Initializes ElementFactory with Playwright page object.

**Parameters:**
- `page` - Playwright page object

**Example:**
```javascript
const elementFactory = new ElementFactory(page);
```

---

### get(elementPath)

**Purpose:** Gets a single element by its path.

**Parameters:**
- `elementPath` - String in format `'category.elementName'`

**Returns:** Playwright locator

**Example:**
```javascript
const usernameInput = elementFactory.get('login.usernameInput');
// Returns: page.getByRole('textbox', { name: 'Username:' })
```

**Flow:**
```
'login.usernameInput'
        │
        ▼
split('.') → ['login', 'usernameInput']
        │
        ▼
categoryName = 'login'
elementName = 'usernameInput'
        │
        ▼
getElementDefinition('login', 'usernameInput')
        │
        ▼
{ role: 'textbox', name: 'Username:' }
        │
        ▼
createLocator(definition)
        │
        ▼
page.getByRole('textbox', { name: 'Username:' })
```

---

### getAll(categoryName)

**Purpose:** Gets all elements from a category.

**Parameters:**
- `categoryName` - String like `'login'` or `'common'`

**Returns:** Object with all locators

**Example:**
```javascript
const loginElements = elementFactory.getAll('login');
// Returns:
// {
//     usernameInput: page.getByRole('textbox', { name: 'Username:' }),
//     passwordInput: page.getByRole('textbox', { name: 'Password:' }),
//     loginButton: page.getByRole('button', { name: 'Sign In' }),
//     ...
// }
```

**Flow:**
```
'login'
    │
    ▼
getCategoryElements('login')
    │
    ▼
{
    usernameInput: { role: 'textbox', name: 'Username:' },
    passwordInput: { role: 'textbox', name: 'Password:' },
    ...
}
    │
    ▼
Loop through each element
    │
    ▼
createLocator() for each
    │
    ▼
{
    usernameInput: page.getByRole('textbox', { name: 'Username:' }),
    passwordInput: page.getByRole('textbox', { name: 'Password:' }),
    ...
}
```

---

### getCategoryElements(categoryName)

**Purpose:** Gets all element definitions from a category.

**Parameters:**
- `categoryName` - String like `'login'`

**Returns:** Object with element definitions

**Throws:** Error if category not found

**Example:**
```javascript
const categoryElements = this.getCategoryElements('login');
// Returns:
// {
//     usernameInput: { role: 'textbox', name: 'Username:' },
//     passwordInput: { role: 'textbox', name: 'Password:' },
//     ...
// }
```

---

### getElementDefinition(categoryName, elementName)

**Purpose:** Gets a single element definition.

**Parameters:**
- `categoryName` - String like `'login'`
- `elementName` - String like `'usernameInput'`

**Returns:** Element definition object

**Throws:** Error if element not found

**Example:**
```javascript
const definition = this.getElementDefinition('login', 'usernameInput');
// Returns: { role: 'textbox', name: 'Username:' }
```

---

### createLocator(elementDefinition)

**Purpose:** Converts element definition to Playwright locator.

**Parameters:**
- `elementDefinition` - Object with locator properties

**Returns:** Playwright locator

**Throws:** Error if definition is invalid

---

## Supported Locator Types

| Property | Playwright Method | Example Definition | Output |
|----------|-------------------|-------------------|--------|
| `role` | `getByRole()` | `{ role: 'button', name: 'Submit' }` | `page.getByRole('button', { name: 'Submit' })` |
| `testId` | `getByTestId()` | `{ testId: 'submit-btn' }` | `page.getByTestId('submit-btn')` |
| `text` | `getByText()` | `{ text: 'Welcome' }` | `page.getByText('Welcome')` |
| `placeholder` | `getByPlaceholder()` | `{ placeholder: 'Enter email' }` | `page.getByPlaceholder('Enter email')` |
| `label` | `getByLabel()` | `{ label: 'Email' }` | `page.getByLabel('Email')` |
| `altText` | `getByAltText()` | `{ altText: 'Logo' }` | `page.getByAltText('Logo')` |
| `title` | `getByTitle()` | `{ title: 'Close' }` | `page.getByTitle('Close')` |
| `frame` | `frameLocator()` | `{ frame: '#iframe' }` | `page.frameLocator('#iframe')` |
| `locator` | `locator()` | `{ locator: '.class' }` | `page.locator('.class')` |

---

## Usage in Page Objects

### Option 1: Using getAll() with Object.assign()

```javascript
// pages/LoginPage.js

const { BasePage } = require('./BasePage');
const { ElementFactory } = require('../Support/ElementFactory');

class LoginPage extends BasePage {
    constructor(page) {
        super(page, '/login');
        const elementFactory = new ElementFactory(page);

        // Assign all elements automatically
        Object.assign(this, elementFactory.getAll('login'));
        Object.assign(this, elementFactory.getAll('common'));
    }
}

module.exports = { LoginPage };
```

---

### Option 2: Using get() for Specific Elements

```javascript
// pages/ShopPage.js

const { BasePage } = require('./BasePage');
const { ElementFactory } = require('../Support/ElementFactory');

class ShopPage extends BasePage {
    constructor(page) {
        super(page, '/shop');
        const elementFactory = new ElementFactory(page);

        // All shop elements
        Object.assign(this, elementFactory.getAll('shop'));

        // Only specific common elements
        this.adminRadio = elementFactory.get('common.adminRadio');
        this.userRadio = elementFactory.get('common.userRadio');
    }
}

module.exports = { ShopPage };
```

---

### Option 3: Direct Usage in Step Definitions

```javascript
// steps/login.steps.js

const { Given } = require('@cucumber/cucumber');
const { ElementFactory } = require('../Support/ElementFactory');

Given('I click the login button', async function () {
    const elementFactory = new ElementFactory(this.page);
    const loginButton = elementFactory.get('login.loginButton');
    await loginButton.click();
});
```

---

## Element Definition Files

### login.elements.js

```javascript
module.exports = {
    usernameInput: { role: 'textbox', name: 'Username:' },
    passwordInput: { role: 'textbox', name: 'Password:' },
    loginButton: { role: 'button', name: 'Sign In' },
    errorMessage: { text: 'Invalid credentials' },
    modal: { locator: '#myModal' }
};
```

---

### common.elements.js

```javascript
module.exports = {
    adminRadio: { role: 'radio', name: 'Admin' },
    userRadio: { role: 'radio', name: 'User' },
    userTypeDropdown: { role: 'combobox' }
};
```

---

### elements/index.js

```javascript
module.exports = {
    login: require('./login.elements'),
    common: require('./common.elements')
};
```

---

## Error Handling

### Category Not Found

```javascript
elementFactory.get('invalidCategory.element');
// Error: Category not found: invalidCategory
```

---

### Element Not Found

```javascript
elementFactory.get('login.invalidElement');
// Error: Element not found: invalidElement in login
```

---

### Invalid Definition

```javascript
// If element has no valid locator type
// Error: Invalid element definition: {"invalid":"value"}
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   1. Element Definition Files                                           │
│   ───────────────────────────                                           │
│   login.elements.js: { usernameInput: { role: 'textbox', ... } }        │
│   common.elements.js: { adminRadio: { role: 'radio', ... } }            │
│                              │                                          │
│                              ▼                                          │
│   2. elements/index.js                                                  │
│   ────────────────────                                                  │
│   Combines all: { login: {...}, common: {...} }                         │
│                              │                                          │
│                              ▼                                          │
│   3. ElementFactory                                                     │
│   ─────────────────                                                     │
│   Imports elements, receives page                                       │
│                              │                                          │
│                              ▼                                          │
│   4. get() or getAll()                                                  │
│   ────────────────────                                                  │
│   Retrieves definitions from elements                                   │
│                              │                                          │
│                              ▼                                          │
│   5. createLocator()                                                    │
│   ──────────────────                                                    │
│   Converts definition to Playwright locator                             │
│                              │                                          │
│                              ▼                                          │
│   6. Page Object                                                        │
│   ──────────────                                                        │
│   Stores locator as this.usernameInput                                  │
│                              │                                          │
│                              ▼                                          │
│   7. Test Uses Locator                                                  │
│   ────────────────────                                                  │
│   await this.usernameInput.fill('testuser')                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Best Practices

1. **Use getAll()** when you need most elements from a category
2. **Use get()** when you need only 1-2 specific elements
3. **Use Object.assign()** to keep page objects clean
4. **Prefer role-based locators** over CSS selectors
5. **Keep element definitions simple** - one locator type per element

---

## Adding New Locator Types

To add support for new Playwright locator methods:

```javascript
createLocator(elementDefinition) {
    const { 
        // ... existing properties
        newType  // Add new property
    } = elementDefinition;

    // ... existing checks

    // Add new check
    if (newType) return this.page.getByNewMethod(newType);

    // ... error handling
}
```