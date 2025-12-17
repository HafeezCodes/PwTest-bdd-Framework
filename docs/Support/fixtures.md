# Fixtures Documentation

## Overview

The `fixtures.js` file creates custom Playwright fixtures that provide **dependency injection** for step definitions. Fixtures are reusable components automatically created and passed to steps when needed.

---

## What Are Fixtures?

Fixtures are dependencies that Playwright creates and manages automatically. When a step definition declares it needs a fixture, Playwright:

1. Analyzes what fixtures the step needs
2. Resolves dependencies (fixtures that depend on other fixtures)
3. Creates each fixture in the correct order
4. Passes resolved fixtures to the step function
5. Cleans up after the test completes

---

## File Location

```
project-root/
└── Support/
    └── fixtures.js
```

---

## Complete Code

```javascript
// ==========================================
// Support/fixtures.js
// ==========================================

const { test: base } = require('playwright-bdd');
const { ActionUtils } = require('../utils/ActionUtils/ActionUtils');
const { PageFactory } = require('./PageFactory');
const { resolveActivePage } = require('./activePageResolver');

const test = base.extend({

    actionUtils: async ({ page }, use) => {
        await use(new ActionUtils(page));
    },

    pageObjects: async ({ page }, use) => {
        const pageFactory = new PageFactory(page);
        await use(pageFactory.getAll());
    },

    getActivePage: async ({ pageObjects }, use) => {
        await use(() => resolveActivePage(pageObjects));
    }

});

module.exports = { test };
```

---

## Understanding the Structure

### Import and Extend Base Test

```javascript
const { test: base } = require('playwright-bdd');
```

- Imports the base `test` from playwright-bdd
- Renames it to `base` to indicate it's the foundation we'll extend

```javascript
const test = base.extend({ ... });
```

- Creates a **new** test object with additional custom fixtures
- Preserves all built-in fixtures: `page`, `browser`, `context`
- Adds our custom fixtures: `actionUtils`, `pageObjects`, `getActivePage`

---

## Fixture Function Anatomy

Every fixture follows this pattern:

```javascript
fixtureName: async ({ dependencies }, use) => {
    // Setup: Create the fixture
    const fixture = new Something(dependencies);
    
    // Provide: Make it available to steps
    await use(fixture);
    
    // Cleanup: (Optional) Runs after test completes
    await fixture.cleanup();
}
```

| Part | Description |
|------|-------------|
| `fixtureName` | Name used in steps: `async ({ fixtureName }) => {}` |
| `{ dependencies }` | Other fixtures this one needs |
| `use` | Callback function to provide the fixture value |
| `await use(value)` | Provides value AND waits for test to complete |

---

## Fixture Definitions

### 1. actionUtils

```javascript
actionUtils: async ({ page }, use) => {
    await use(new ActionUtils(page));
}
```

**Purpose:** Provides helper methods for common browser actions.

**Depends On:** `page` (built-in Playwright fixture)

**Provides:** ActionUtils instance

**Available Methods:**
- `click(locator)` - Click an element
- `fill(locator, value)` - Fill input field
- `waitForVisible(locator)` - Wait for element to be visible
- `waitForHidden(locator)` - Wait for element to disappear
- `waitForPageLoad()` - Wait for page to load
- `expectText(locator, text)` - Assert element contains text
- `expectUrl(url)` - Assert current URL
- `selectByLabel(locator, label)` - Select dropdown option
- `check(locator)` - Check a checkbox
- `selectRadio(locator)` - Select a radio button

**Usage in Steps:**

```javascript
When('the user clicks on the {string} button',
    async ({ actionUtils }, buttonName) => {
        await actionUtils.click(locator);
    }
);

When('the user enters {string} in the {string} field',
    async ({ actionUtils }, value, fieldName) => {
        await actionUtils.fill(locator, value);
    }
);
```

---

### 2. pageObjects

```javascript
pageObjects: async ({ page }, use) => {
    const pageFactory = new PageFactory(page);
    await use(pageFactory.getAll());
}
```

**Purpose:** Provides access to all page object instances by name.

**Depends On:** `page` (built-in Playwright fixture)

**Provides:** Object containing all page instances

```javascript
{
    loginPage: LoginPage instance,
    shopPage: ShopPage instance,
    homePage: HomePage instance,
    // ... all pages from PageFactory
}
```

**Usage in Steps:**

```javascript
Given('the user navigates to the {string} page',
    async ({ pageObjects, actionUtils }, pageName) => {
        const pageObject = pageObjects[pageName + "Page"];
        
        if (!pageObject) {
            throw new Error(`Page '${pageName}' not found`);
        }
        
        await pageObject.navigate();
        await actionUtils.waitForPageLoad();
    }
);
```

**Note:** This fixture is specifically for navigation steps where you need to look up a page by name. For action steps, use `getActivePage` instead.

---

### 3. getActivePage

```javascript
getActivePage: async ({ pageObjects }, use) => {
    await use(() => resolveActivePage(pageObjects));
}
```

**Purpose:** Provides a function that returns the currently active page object.

**Depends On:** `pageObjects` (custom fixture)

**Provides:** A function (not a value!) that determines the active page

**Why a Function?**
- The active page can change during test execution
- Each call to `getActivePage()` checks the current URL
- Returns the page object that matches the current URL

**Usage in Steps:**

```javascript
When('the user clicks on the {string} button',
    async ({ getActivePage, actionUtils }, buttonName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(buttons, buttonName, ctx);
        await actionUtils.click(locator);
    }
);
```

**The buildContext Helper:**

```javascript
function buildContext(getActivePage) {
    return {
        active: getActivePage()  // Calls the function to get current page
    };
}
```

---

## Dependency Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   BUILT-IN                    CUSTOM FIXTURES                   │
│   ════════                    ═══════════════                   │
│                                                                 │
│   page ──┬──────────────────► actionUtils                       │
│          │                                                      │
│          └──────────────────► pageObjects ────► getActivePage   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Resolution Order:**
1. `page` - Created by Playwright (built-in)
2. `actionUtils` - Needs `page` ✓
3. `pageObjects` - Needs `page` ✓
4. `getActivePage` - Needs `pageObjects` ✓

---

## How Fixtures Are Resolved at Runtime

When a step runs:

```javascript
When('the user clicks on the {string} button',
    async ({ getActivePage, actionUtils }, buttonName) => {
        // ...
    }
);
```

**Playwright performs these steps:**

```
1. ANALYZE
   Step needs: getActivePage, actionUtils

2. BUILD DEPENDENCY TREE
   getActivePage → needs pageObjects → needs page
   actionUtils → needs page

3. RESOLVE IN ORDER
   a. Create page (no dependencies)
   b. Create actionUtils (has page ✓)
   c. Create pageObjects (has page ✓)
   d. Create getActivePage (has pageObjects ✓)

4. CALL STEP
   Pass { getActivePage, actionUtils } to step function

5. CLEANUP
   After test, run any cleanup code in fixtures
```

---

## Fixture Types in This Framework

| Fixture | Type | Used In |
|---------|------|--------|
| `actionUtils` | Public | All action steps |
| `pageObjects` | Public | Navigation step only |
| `getActivePage` | Public | All action steps |

**Public fixtures** are used directly in step definitions.

---

## Usage Patterns

### Pattern 1: Navigation (uses pageObjects)

```javascript
Given('the user navigates to the {string} page',
    async ({ pageObjects, actionUtils }, pageName) => {
        const pageObject = pageObjects[pageName + "Page"];
        await pageObject.navigate();
        await actionUtils.waitForPageLoad();
    }
);
```

### Pattern 2: Actions (uses getActivePage)

```javascript
When('the user clicks on the {string} button',
    async ({ getActivePage, actionUtils }, buttonName) => {
        const ctx = buildContext(getActivePage);
        const locator = resolveElement(buttons, buttonName, ctx);
        await actionUtils.click(locator);
    }
);
```

### Pattern 3: Assertions (uses getActivePage or actionUtils)

```javascript
Then('the current URL is {string}',
    async ({ actionUtils }, expectedUrl) => {
        await actionUtils.expectUrl(expectedUrl);
    }
);
```

---

## The `use` Function Explained

### Why use() Instead of return?

```javascript
// ❌ WRONG: Cannot do cleanup
actionUtils: async ({ page }) => {
    return new ActionUtils(page);
}

// ✅ CORRECT: Can do cleanup
actionUtils: async ({ page }, use) => {
    const utils = new ActionUtils(page);
    await use(utils);           // Test runs here
    await utils.cleanup();      // Cleanup after test
}
```

### What use() Does

1. **Provides** the fixture value to steps
2. **Waits** for the test to complete
3. **Allows** cleanup code to run after

### Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   const utils = new ActionUtils(page);   ← SETUP                │
│                         │                                       │
│                         ▼                                       │
│   await use(utils); ────┬─────────────► Test runs               │
│                         │               (uses utils)            │
│                         │                                       │
│                         │◄────────────── Test completes         │
│                         ▼                                       │
│   await utils.cleanup();                 ← CLEANUP              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Adding a New Fixture

### Step 1: Define the Fixture

```javascript
const test = base.extend({

    // Existing fixtures...
    actionUtils: async ({ page }, use) => { ... },
    pageObjects: async ({ page }, use) => { ... },
    getActivePage: async ({ pageObjects }, use) => { ... },

    // NEW FIXTURE
    apiClient: async ({ }, use) => {
        const client = new ApiClient(process.env.API_URL);
        await use(client);
    }

});
```

### Step 2: Use in Steps

```javascript
Given('the user has valid API credentials',
    async ({ apiClient }) => {
        await apiClient.authenticate();
    }
);
```

---

## Fixture with Cleanup Example

```javascript
databaseConnection: async ({ }, use) => {
    // SETUP
    const db = await Database.connect('mongodb://localhost');
    
    // PROVIDE (test runs while waiting)
    await use(db);
    
    // CLEANUP (after test)
    await db.disconnect();
}
```

---

## Fixture with Dependencies Example

```javascript
authenticatedUser: async ({ apiClient, database }, use) => {
    // Create test user
    const user = await database.createUser({
        email: 'test@example.com',
        password: 'password123'
    });
    
    // Authenticate
    await apiClient.login(user.email, user.password);
    
    // Provide user to test
    await use(user);
    
    // Cleanup: delete test user
    await database.deleteUser(user.id);
}
```

---

## Best Practices

### 1. Keep Fixtures Focused

Each fixture should do one thing well.

```javascript
// ✅ GOOD: Single responsibility
actionUtils: async ({ page }, use) => {
    await use(new ActionUtils(page));
}

// ❌ BAD: Too many responsibilities
everything: async ({ page }, use) => {
    await use({
        actions: new ActionUtils(page),
        pages: new PageFactory(page).getAll(),
        api: new ApiClient()
    });
}
```

### 2. Name Fixtures Clearly

```javascript
// ✅ GOOD: Clear names
actionUtils, pageObjects, getActivePage

// ❌ BAD: Unclear names
utils, objects, getter
```

### 3. Document Dependencies

```javascript
// ✅ GOOD: Clear what's needed
getActivePage: async ({ pageObjects }, use) => {
    // Depends on pageObjects to find active page
    await use(() => resolveActivePage(pageObjects));
}
```

### 4. Use Fixtures for Shared Setup

If multiple steps need the same setup, create a fixture.

### 5. Avoid Circular Dependencies

```javascript
// ❌ BAD: Circular dependency
fixtureA: async ({ fixtureB }, use) => { ... }
fixtureB: async ({ fixtureA }, use) => { ... }  // Error!
```

---

## Troubleshooting

### Error: Fixture not found

```
Error: Fixture "actionUtils" not found
```

**Solution:** Ensure you import `test` from fixtures.js, not from playwright-bdd:

```javascript
// ❌ WRONG
const { test } = require('playwright-bdd');

// ✅ CORRECT
const { test } = require('../Support/fixtures');
```

### Error: Fixture dependency not found

```
Error: Fixture "pageObjects" required by "getActivePage" not found
```

**Solution:** Ensure all dependencies are defined in the same `extend()` call.

### Error: Circular dependency

**Solution:** Restructure fixtures to avoid circular references.

---

## Summary

| Fixture | Depends On | Provides | Used For |
|---------|------------|----------|----------|
| `actionUtils` | `page` | ActionUtils instance | Browser actions |
| `pageObjects` | `page` | All page instances | Navigation |
| `getActivePage` | `pageObjects` | Function returning active page | Element resolution |

---

## Quick Reference

```javascript
// Import in step files
const { Given, When, Then } = require('../Support/bdd');

// Use fixtures in steps
When('step text', async ({ actionUtils, getActivePage }, param) => {
    // actionUtils and getActivePage are automatically provided
});
```