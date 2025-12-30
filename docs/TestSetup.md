# testSetup.js Documentation

## Overview

`testSetup.js` is the **core test infrastructure file** that orchestrates the entire test framework. It provides custom Playwright fixtures, BDD step definition helpers, and intelligent page detection logic.

**Purpose**: Centralize test setup, extend Playwright's capabilities, and provide a unified entry point for all test configuration.

**Location**: `Support/testSetup.js`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Components](#components)
3. [Custom Fixtures](#custom-fixtures)
4. [Active Page Resolver](#active-page-resolver)
5. [BDD Integration](#bdd-integration)
6. [Data Flow](#data-flow)
7. [Usage Examples](#usage-examples)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### High-Level Structure

```
┌─────────────────────────────────────────────────────────┐
│                    testSetup.js                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │  Active Page     │  │  Custom          │           │
│  │  Resolver        │  │  Fixtures        │           │
│  │  Function        │  │  Extension       │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │  BDD Step Definition Helpers             │          │
│  │  (Given, When, Then)                     │          │
│  └──────────────────────────────────────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Component Relationships

| Component | Depends On | Provides To |
|-----------|------------|-------------|
| **Custom Fixtures** | Playwright base test, PageFactory, ActionUtils | Step definitions, test files |
| **Active Page Resolver** | Page objects with `isAt()` method | `getActivePage` fixture |
| **BDD Setup** | Custom test fixture | Step definition files |

---

## Components

### 1. Active Page Resolver

**Function**: `resolveActivePage(pageObjects, options)`

**Purpose**: Automatically determines which page the browser is currently on by checking each page's `isAt()` method.

#### Function Signature

```javascript
function resolveActivePage(pageObjects, options = {})
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pageObjects` | `Object` | Required | Map of page instances (e.g., `{loginPage: LoginPage, shopPage: ShopPage}`) |
| `options.throwOnNotFound` | `Boolean` | `false` | Throws error if no matching page found |
| `options.fallbackToFirst` | `Boolean` | `true` | Returns first page if no match found |

#### Return Value

| Condition | Returns |
|-----------|---------|
| Match found | The page object where `isAt()` returns `true` |
| No match + `fallbackToFirst=true` | First page in `pageObjects` |
| No match + `fallbackToFirst=false` | `null` |
| No match + `throwOnNotFound=true` | Throws error |

#### Algorithm Flow

```
START
  │
  ├─ Loop through all pageObjects
  │   │
  │   ├─ Does page have isAt() method?
  │   │   │
  │   │   ├─ YES → Call isAt()
  │   │   │   │
  │   │   │   ├─ Returns true? → RETURN this page ✓
  │   │   │   └─ Returns false? → Continue loop
  │   │   │
  │   │   └─ NO → Continue loop
  │   │
  │   └─ End of loop
  │
  ├─ No match found
  │
  ├─ throwOnNotFound = true?
  │   └─ YES → THROW ERROR ✗
  │
  ├─ fallbackToFirst = true?
  │   ├─ YES → RETURN first page
  │   └─ NO → RETURN null
  │
END
```

#### Example: How isAt() Works

```javascript
// In LoginPage.js
class LoginPage extends BasePage {
    constructor(page) {
        super(page, 'https://example.com/login');
    }
    
    isAt() {
        // Checks if current URL matches this page's URL
        const currentUrl = this.page.url();
        return currentUrl.includes('/login');
    }
}

// When resolveActivePage runs:
// 1. Checks loginPage.isAt() → returns true if on /login
// 2. Checks shopPage.isAt() → returns false
// 3. Returns loginPage ✓
```

---

### 2. Custom Fixtures

**Purpose**: Extend Playwright's built-in `test` object with framework-specific utilities.

#### Fixture Extension Pattern

```javascript
const test = base.extend({
    fixtureName: async ({ dependencies }, use) => {
        // Setup code
        const instance = new SomeClass();
        
        // Provide to test
        await use(instance);
        
        // Teardown code (runs after test)
    }
});
```

#### Available Fixtures

| Fixture Name | Type | Purpose | Dependencies |
|--------------|------|---------|--------------|
| `actionUtils` | `ActionUtils` | Reusable action methods (click, fill, etc.) | `page` |
| `pageObjects` | `Object` | All page instances | `page` |
| `getActivePage` | `Function` | Returns current page object | `pageObjects` |

---

### 3. Fixture: actionUtils

**Type**: `ActionUtils` instance

**Purpose**: Provides wrapped Playwright actions with built-in waits and error handling.

#### Lifecycle

```
Test Start
    │
    ├─ Playwright provides 'page' fixture
    │
    ├─ testSetup creates ActionUtils(page)
    │
    ├─ Test uses actionUtils methods
    │   │
    │   ├─ actionUtils.click(locator)
    │   ├─ actionUtils.fill(locator, text)
    │   └─ actionUtils.expectVisible(locator)
    │
    └─ Test End (actionUtils disposed)
```

#### Available Methods

```javascript
// Navigation
await actionUtils.goto(url)
await actionUtils.waitForPageLoad()

// Interactions
await actionUtils.click(locator)
await actionUtils.fill(locator, text)
await actionUtils.check(locator)
await actionUtils.selectByLabel(locator, label)

// Assertions
await actionUtils.expectVisible(locator)
await actionUtils.expectText(locator, text)
await actionUtils.expectUrl(url)

// Advanced
await actionUtils.waitForNewTab(context, clickAction)
```

#### Usage in Steps

```javascript
When(
    'the user clicks on the {string} button',
    async ({ actionUtils, getActivePage }, buttonName) => {
        const activePage = getActivePage();
        const locator = activePage.loginButton;
        
        await actionUtils.click(locator);
        //          ↑
        //    Fixture injected automatically
    }
);
```

---

### 4. Fixture: pageObjects

**Type**: `Object` with all page instances

**Purpose**: Provides access to all page objects without manual instantiation.

#### Creation Process

```
Test Start
    │
    ├─ Playwright provides 'page' fixture
    │
    ├─ testSetup creates PageFactory(page)
    │
    ├─ PageFactory scans 'pages/' directory
    │   │
    │   ├─ Finds: LoginPage.js → LoginPage class
    │   ├─ Finds: ShopPage.js → ShopPage class
    │   └─ Creates registry: { login: LoginPage, shop: ShopPage }
    │
    ├─ PageFactory.getAll() creates instances:
    │   {
    │     loginPage: new LoginPage(page),
    │     shopPage: new ShopPage(page)
    │   }
    │
    └─ Provides to test as 'pageObjects' fixture
```

#### Structure

```javascript
{
    loginPage: LoginPage {
        page: Page,
        url: 'https://example.com/login',
        usernameInput: Locator,
        passwordInput: Locator,
        loginButton: Locator,
        navigate: Function,
        isAt: Function
    },
    shopPage: ShopPage {
        page: Page,
        url: 'https://example.com/shop',
        productCards: Locator,
        cartButton: Locator,
        navigate: Function,
        isAt: Function
    }
}
```

#### Usage Example

```javascript
Given(
    'the user navigates to the {string} page',
    async ({ pageObjects }, pageName) => {
        const pageObject = pageObjects[pageName + 'Page'];
        //                           ↑
        //              loginPage, shopPage, etc.
        
        await pageObject.navigate();
    }
);
```

---

### 5. Fixture: getActivePage

**Type**: `Function` that returns the current page object

**Purpose**: Eliminates need to manually track which page the test is on.

#### How It Works

```
Step Definition Runs
    │
    ├─ Calls: getActivePage()
    │
    ├─ Internally calls: resolveActivePage(pageObjects)
    │
    ├─ Loops through all page objects:
    │   │
    │   ├─ loginPage.isAt() → false
    │   ├─ shopPage.isAt() → true ✓
    │   │
    │   └─ Returns: shopPage
    │
    └─ Step now knows it's on ShopPage
```

#### Usage Pattern

```javascript
When(
    'the user clicks on the {string} button',
    async ({ getActivePage, actionUtils }, buttonName) => {
        // Get current page dynamically
        const activePage = getActivePage();
        
        // Access elements from active page
        const buttonLocator = activePage[buttonName + 'Button'];
        
        await actionUtils.click(buttonLocator);
    }
);
```

#### Why This Matters

**Without getActivePage**:
```javascript
// ❌ Manual tracking required
let currentPage = loginPage;

When('user logs in', async () => {
    await loginPage.login();
    currentPage = shopPage; // Manual update!
});

When('user clicks button', async () => {
    await currentPage.clickButton(); // Hope we updated it!
});
```

**With getActivePage**:
```javascript
// ✅ Automatic detection
When('user clicks button', async ({ getActivePage }) => {
    const page = getActivePage(); // Always correct!
    await page.clickButton();
});
```

---

## BDD Integration

### Creating BDD Helpers

```javascript
const { Given, When, Then } = createBdd(test);
//                                        ↑
//                            Our custom test with fixtures
```

### What This Enables

```javascript
// Step definitions automatically get our fixtures:

Given('step', async ({ actionUtils, pageObjects, getActivePage }) => {
    //                      ↑              ↑              ↑
    //                   Fixture 1      Fixture 2      Fixture 3
    
    // All available without manual setup!
});
```

### BDD Flow

```
Feature File (.feature)
    │
    │  Scenario: Login
    │    Given the user navigates to "login" page
    │    When the user clicks "Sign In" button
    │
    ↓
Step Definition (universal.steps.js)
    │
    │  const { Given, When } = require('./Support/testSetup');
    │                                              ↑
    │                                    Imports from testSetup
    │
    │  Given('the user navigates...', async ({ pageObjects }) => {
    │      //                                      ↑
    │      //                            Fixture auto-injected
    │  });
    │
    ↓
Test Execution
    │
    ├─ testSetup provides fixtures
    ├─ Step accesses pageObjects
    ├─ Test runs with all utilities available
    └─ Results captured
```

---

## Data Flow

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Test Starts (Playwright Runner)                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Playwright creates base fixtures:                       │
│     - page                                                  │
│     - context                                               │
│     - browser                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  3. testSetup.js extends test object:                       │
│                                                             │
│     test.extend({                                           │
│       actionUtils: creates ActionUtils(page)                │
│       pageObjects: creates PageFactory → all pages          │
│       getActivePage: creates resolver function              │
│     })                                                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  4. BDD layer wraps custom test:                            │
│                                                             │
│     createBdd(test) → Given, When, Then                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Step definition imports and uses:                       │
│                                                             │
│     const { Given } = require('./Support/testSetup');       │
│                                                             │
│     Given('step', async ({ actionUtils, pageObjects }) => { │
│         // Fixtures available here!                         │
│     });                                                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Test executes with all utilities                        │
└─────────────────────────────────────────────────────────────┘
```

### Fixture Resolution Order

```
Test Function Executes
    │
    ├─ Requests: { actionUtils, pageObjects, getActivePage }
    │
    ├─ Playwright Fixture System checks:
    │   │
    │   ├─ Is 'actionUtils' defined? → YES (in testSetup.js)
    │   │   │
    │   │   ├─ Does it depend on 'page'? → YES
    │   │   ├─ Is 'page' available? → YES (built-in)
    │   │   └─ Create: new ActionUtils(page)
    │   │
    │   ├─ Is 'pageObjects' defined? → YES
    │   │   │
    │   │   ├─ Does it depend on 'page'? → YES
    │   │   ├─ Is 'page' available? → YES
    │   │   └─ Create: PageFactory(page).getAll()
    │   │
    │   └─ Is 'getActivePage' defined? → YES
    │       │
    │       ├─ Does it depend on 'pageObjects'? → YES
    │       ├─ Is 'pageObjects' available? → YES (created above)
    │       └─ Create: () => resolveActivePage(pageObjects)
    │
    └─ All fixtures ready → Execute test function
```

---

## Usage Examples

### Example 1: Basic Step Definition

```javascript
const { Given, When, Then } = require('../Support/testSetup');

Given(
    'the user is on the login page',
    async ({ pageObjects, actionUtils }) => {
        await pageObjects.loginPage.navigate();
        await actionUtils.waitForPageLoad();
    }
);
```

### Example 2: Using getActivePage

```javascript
When(
    'the user clicks the {string} button',
    async ({ getActivePage, actionUtils }, buttonName) => {
        const activePage = getActivePage();
        const buttonLocator = activePage[buttonName + 'Button'];
        
        await actionUtils.click(buttonLocator);
    }
);
```

### Example 3: Multiple Fixtures

```javascript
Then(
    'the user should see the dashboard',
    async ({ getActivePage, actionUtils, page }) => {
        const activePage = getActivePage();
        
        // Use actionUtils for assertions
        await actionUtils.expectUrl('https://example.com/dashboard');
        
        // Use page for advanced operations
        const title = await page.title();
        
        // Use activePage for element access
        await actionUtils.expectVisible(activePage.dashboardHeader);
    }
);
```

### Example 4: Error Handling with throwOnNotFound

```javascript
// In step definition
const activePage = getActivePage(); // Uses default options

// Alternative: Strict mode
function strictGetActivePage(pageObjects) {
    return resolveActivePage(pageObjects, {
        throwOnNotFound: true,    // Throw if no match
        fallbackToFirst: false    // Don't use fallback
    });
}
```

---

## Configuration

### Integration with playwright.config.js

```javascript
// playwright.config.js
const { defineBddConfig } = require('playwright-bdd');

const bddConfig = defineBddConfig({
    importTestFrom: './Support/testSetup.js',
    //                          ↑
    //         Tells playwright-bdd where to find custom 'test'
    steps: ['./steps/**/*.js']
});
```

### Environment Setup

**Required Files**:
```
Support/
├── testSetup.js         ← This file
├── PageFactory.js       ← Creates page instances
├── elementRegistry.js   ← Element mappings
└── ElementFactory.js    ← Locator creation

utils/
└── ActionUtils/
    └── ActionUtils.js   ← Action wrapper methods

pages/
├── BasePage.js          ← Base class with isAt()
├── LoginPage.js         ← Must implement isAt()
└── ShopPage.js          ← Must implement isAt()
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "Cannot find module testSetup.js"

**Cause**: `playwright.config.js` has incorrect path

**Solution**:
```javascript
// playwright.config.js
importTestFrom: './Support/testSetup.js',  // Correct
// NOT: './Support/fixtures.js'            // Old name
```

#### Issue 2: Fixtures not available in step

**Symptom**:
```javascript
Given('step', async ({ actionUtils }) => {
    // actionUtils is undefined
});
```

**Cause**: Not importing from testSetup.js

**Solution**:
```javascript
// At top of step file:
const { Given } = require('../Support/testSetup'); // ✓ Correct
// NOT: const { Given } = require('playwright-bdd'); // ✗ Wrong
```

#### Issue 3: getActivePage returns wrong page

**Cause**: Page's `isAt()` method not correctly implemented

**Debug**:
```javascript
// Add logging to isAt()
isAt() {
    const currentUrl = this.page.url();
    const matches = currentUrl.includes(this.url);
    console.log(`${this.constructor.name}.isAt(): ${currentUrl} → ${matches}`);
    return matches;
}
```

#### Issue 4: "Active page could not be determined"

**Cause**: Using `throwOnNotFound: true` but no page matches

**Solution**:
```javascript
// Option 1: Fix isAt() implementations
// Option 2: Use fallback
const activePage = getActivePage(); // Uses fallback by default

// Option 3: Handle null
const activePage = resolveActivePage(pageObjects, {
    throwOnNotFound: false,
    fallbackToFirst: false
});

if (!activePage) {
    throw new Error('No page found - check URL');
}
```

---

## Best Practices

### 1. Always Implement isAt() in Page Objects

```javascript
// ✓ GOOD
class LoginPage extends BasePage {
    isAt() {
        return this.page.url().includes('/login');
    }
}

// ✗ BAD
class LoginPage extends BasePage {
    // Missing isAt() - getActivePage won't work!
}
```

### 2. Use getActivePage for Dynamic Steps

```javascript
// ✓ GOOD - Works on any page
When('user clicks {string}', async ({ getActivePage }, button) => {
    const page = getActivePage();
    await page.clickButton(button);
});

// ✗ BAD - Hardcoded to one page
When('user clicks {string}', async ({ pageObjects }, button) => {
    await pageObjects.loginPage.clickButton(button); // Only works on login!
});
```

### 3. Leverage Fixture Dependencies

```javascript
// ✓ GOOD - Let Playwright manage dependencies
const test = base.extend({
    myFixture: async ({ page, context }, use) => {
        // page and context auto-provided
        await use(new MyClass(page, context));
    }
});

// ✗ BAD - Manual instantiation
const test = base.extend({
    myFixture: async ({}, use) => {
        const browser = await chromium.launch(); // Manual!
        const page = await browser.newPage();    // Don't do this!
        await use(page);
    }
});
```

### 4. Keep testSetup.js Focused

**This file should only contain**:
- Fixture definitions
- Active page resolver
- BDD setup
- Exports

**Don't add**:
- Business logic
- Element definitions
- Test data
- Page-specific code

---

## Summary

### Key Takeaways

| Concept | What It Does | Why It Matters |
|---------|--------------|----------------|
| **Custom Fixtures** | Extends Playwright test with utilities | Provides reusable tools to all tests |
| **Active Page Resolver** | Detects current page automatically | Eliminates manual page tracking |
| **BDD Integration** | Creates Given/When/Then with fixtures | Enables readable, maintainable tests |
| **Dependency Injection** | Auto-provides fixtures to steps | Reduces boilerplate, increases clarity |

### File Responsibilities

```
testSetup.js is the "conductor" that:
  ├─ Orchestrates test infrastructure
  ├─ Provides utilities via fixtures
  ├─ Enables BDD step definitions
  └─ Manages page detection logic

It does NOT:
  ├─ Define page elements
  ├─ Implement page actions
  ├─ Store test data
  └─ Execute business logic
```

### Quick Reference

**Import in step files**:
```javascript
const { Given, When, Then } = require('../Support/testSetup');
```

**Available fixtures in steps**:
```javascript
async ({ actionUtils, pageObjects, getActivePage, page, context }) => {
    // Your step code
}
```

**Get current page**:
```javascript
const activePage = getActivePage();
```

**Access all pages**:
```javascript
const { loginPage, shopPage } = pageObjects;
```

---

**Last Updated**: [Current Date]  
**Maintainer**: [Your Team/Name]  
**Related Docs**: `PageFactory.md`, `elementRegistry.md`, `ActionUtils.md`