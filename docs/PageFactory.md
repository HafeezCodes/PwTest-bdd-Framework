# PageFactory.md

## Overview

**PageFactory** is a centralized factory class that automatically discovers, registers, and instantiates all Page Object Model (POM) classes in your framework. It uses the **Factory Pattern** combined with **Registry Pattern** and **Lazy Loading** to efficiently manage page objects throughout test execution.

## Purpose

- **Auto-Discovery**: Automatically finds all `*Page.js` files in the `pages/` directory
- **Centralized Management**: Single source of truth for all page objects
- **Lazy Instantiation**: Creates page instances only when needed (performance optimization)
- **Caching**: Reuses page instances to avoid redundant creation
- **Type Safety**: Validates page class exports at runtime

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      PageFactory                            │
├─────────────────────────────────────────────────────────────┤
│  Properties:                                                │
│    • page (Playwright Page instance)                        │
│    • cache (stores instantiated pages)                      │
│    • registry (maps pageKey → PageClass)                    │
├─────────────────────────────────────────────────────────────┤
│  Methods:                                                   │
│    • _buildRegistry()  → Auto-discovers pages               │
│    • get(pageKey)      → Returns single page instance       │
│    • getAll()          → Returns all page instances         │
└─────────────────────────────────────────────────────────────┘
```

### Component Relationships

```
┌──────────────┐
│ pages/ dir   │
│ ├─LoginPage  │
│ ├─ShopPage   │
│ └─BasePage   │
└──────┬───────┘
       │ scans
       ▼
┌──────────────────┐      builds      ┌──────────────┐
│  _buildRegistry  │─────────────────→│   registry   │
└──────────────────┘                  │ {            │
                                      │  login: LP,  │
                                      │  shop: SP    │
                                      │ }            │
                                      └──────┬───────┘
                                             │ uses
                                             ▼
                                      ┌──────────────┐
                                      │  get(key)    │
                                      │  getAll()    │
                                      └──────┬───────┘
                                             │ stores
                                             ▼
                                      ┌──────────────┐
                                      │    cache     │
                                      │ {            │
                                      │  login: lp1, │
                                      │  shop: sp1   │
                                      │ }            │
                                      └──────────────┘
```

## Key Components

### 1. Registry (`this.registry`)

**Purpose**: Maps page keys to their corresponding class constructors

**Structure**:
```javascript
{
  "login": LoginPage,    // Class reference
  "shop": ShopPage,      // Class reference
  "checkout": CheckoutPage
}
```

**How it's Built**:

| Step | Action | Example |
|------|--------|---------|
| 1 | Scan `pages/` directory | Finds: `LoginPage.js`, `ShopPage.js` |
| 2 | Filter valid files | Keep: `*Page.js`, Skip: `BasePage.js` |
| 3 | Extract page key | `LoginPage.js` → `"login"` |
| 4 | Extract class name | `LoginPage.js` → `"LoginPage"` |
| 5 | Require the file | `require('./pages/LoginPage')` |
| 6 | Validate export | Check for `{ LoginPage }` export |
| 7 | Store in registry | `registry["login"] = LoginPage` |

### 2. Cache (`this.cache`)

**Purpose**: Stores already-instantiated page objects to avoid re-creation

**Structure**:
```javascript
{
  "login": loginPageInstance,   // Actual instance
  "shop": shopPageInstance       // Actual instance
}
```

**Benefits**:
- ✅ **Performance**: Create each page only once
- ✅ **Consistency**: Same instance across test
- ✅ **Memory Efficiency**: Reuse instances

### 3. Page Instance (`this.page`)

**Purpose**: Playwright Page object shared across all page instances

**Flow**:
```
Playwright Page → PageFactory → Individual Page Objects
```

## Data Flow Diagrams

### Complete Initialization Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Test Execution Starts                                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ testSetup.js: pageObjects fixture executes                  │
│ → new PageFactory(page)                                     │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ PageFactory Constructor                                     │
│ 1. this.page = page                                         │
│ 2. this.cache = {}                                          │
│ 3. this.registry = this._buildRegistry()                    │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ _buildRegistry() executes                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Read pages/ directory                                │ │
│ │ 2. Filter: *Page.js (exclude BasePage.js)               │ │
│ │ 3. For each file:                                       │ │
│ │    • Extract pageKey (e.g., "login")                    │ │
│ │    • Extract className (e.g., "LoginPage")              │ │
│ │    • Require the file                                   │ │
│ │    • Validate export format                             │ │
│ │    • Store: registry[pageKey] = PageClass               │ │
│ │ 4. Return registry object                               │ │
│ └─────────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ PageFactory Ready                                           │
│ • registry: { login: LoginPage, shop: ShopPage }            │
│ • cache: {}  (empty - no pages created yet)                 │
│ • page: [Playwright Page instance]                          │
└─────────────────────────────────────────────────────────────┘
```

### get() Method Flow

```
Step Definition calls: pageObjects.loginPage
                │
                ▼
        getAll() executes
                │
                ▼
        get("login") called
                │
                ▼
        ┌───────────────────┐
        │ Check cache       │
        │ cache["login"]?   │
        └────┬──────────────┘
             │
     ┌───────┴────────┐
     │                │
   YES              NO
     │                │
     │                ▼
     │        ┌──────────────────┐
     │        │ Get class from   │
     │        │ registry         │
     │        │ PageClass =      │
     │        │ registry["login"]│
     │        └────┬─────────────┘
     │             │
     │             ▼
     │        ┌──────────────────┐
     │        │ Validate class   │
     │        │ exists           │
     │        └────┬─────────────┘
     │             │
     │             ▼
     │        ┌──────────────────┐
     │        │ Instantiate      │
     │        │ new PageClass(   │
     │        │   this.page      │
     │        │ )                │
     │        └────┬─────────────┘
     │             │
     │             ▼
     │        ┌──────────────────┐
     │        │ Store in cache   │
     │        │ cache["login"] = │
     │        │ instance         │
     │        └────┬─────────────┘
     │             │
     └─────────────┴───────┐
                           ▼
                  ┌─────────────────┐
                  │ Return instance │
                  └─────────────────┘
```

### getAll() Method Flow

```
getAll() called
      │
      ▼
┌──────────────────────────────────┐
│ Create empty object: all = {}    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Loop through registry keys       │
│ ["login", "shop", "checkout"]    │
└────────┬─────────────────────────┘
         │
         ▼
    ┌────────────┐
    │ For "login"│
    └────┬───────┘
         │
         ▼
┌──────────────────────────────────┐
│ Call get("login")                │
│ → Returns loginPageInstance      │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Store as: all["loginPage"]       │
│ (adds "Page" suffix)             │
└────────┬─────────────────────────┘
         │
         ▼
    [Repeat for all keys]
         │
         ▼
┌──────────────────────────────────┐
│ Return all object:               │
│ {                                │
│   loginPage: <instance>,         │
│   shopPage: <instance>,          │
│   checkoutPage: <instance>       │
│ }                                │
└──────────────────────────────────┘
```

## Method Details

### `_buildRegistry()`

**Purpose**: Auto-discover and register all page classes

**Algorithm**:

```javascript
// Pseudocode
function _buildRegistry() {
    1. Get path to pages/ directory
    2. Read all files in pages/
    3. For each file:
        IF filename ends with 'Page.js' AND is not 'BasePage.js':
            a. Extract pageKey (lowercase, remove 'Page.js')
            b. Extract className (remove '.js')
            c. Load the file with require()
            d. Validate export format
            e. Store in registry
    4. Return registry object
}
```

**File Naming Convention**:

| Filename | pageKey | className | Valid? |
|----------|---------|-----------|--------|
| `LoginPage.js` | `login` | `LoginPage` | ✅ Yes |
| `ShopPage.js` | `shop` | `ShopPage` | ✅ Yes |
| `BasePage.js` | - | - | ❌ Skipped |
| `userProfilePage.js` | `userprofile` | `userProfilePage` | ✅ Yes |
| `Login.js` | - | - | ❌ No (missing 'Page') |

**Export Validation**:

```javascript
// ✅ CORRECT - Named export matching class name
module.exports = { LoginPage };

// ❌ WRONG - Default export
module.exports = LoginPage;

// ❌ WRONG - Different name
module.exports = { Login };
```

**Error Handling**:

```javascript
// If file doesn't have correct export
throw new Error(`LoginPage.js must export { LoginPage }`);
```

### `get(pageKey)`

**Purpose**: Get a single page object instance (with caching)

**Parameters**:
- `pageKey` (string): Lowercase page identifier (e.g., `"login"`)

**Returns**: Page object instance

**Behavior**:

| Scenario | Action | Example |
|----------|--------|---------|
| Page in cache | Return cached instance | Cache hit → return `cache["login"]` |
| Page not in cache | Create, cache, return | Create `new LoginPage(page)` |
| Page key invalid | Throw error | `Unknown page: xyz` |

**Example Usage**:

```javascript
const pageFactory = new PageFactory(page);

// First call - creates instance
const loginPage1 = pageFactory.get('login');

// Second call - returns cached instance
const loginPage2 = pageFactory.get('login');

// loginPage1 === loginPage2 (same instance)
```

**Performance Characteristics**:

```
First Call:  O(1) lookup + O(n) instantiation
Subsequent:  O(1) lookup (cache hit)
```

### `getAll()`

**Purpose**: Get all page objects as a single object

**Returns**: Object with all page instances

**Return Format**:

```javascript
{
  loginPage: <LoginPage instance>,      // Note: "Page" suffix added
  shopPage: <ShopPage instance>,
  checkoutPage: <CheckoutPage instance>
}
```

**Key Transformation**:

```javascript
// Registry key → Return object key
"login"    → "loginPage"
"shop"     → "shopPage"
"checkout" → "checkoutPage"
```

**Example Usage**:

```javascript
const pageFactory = new PageFactory(page);
const allPages = pageFactory.getAll();

// Access individual pages
await allPages.loginPage.navigate();
await allPages.shopPage.addToCart();
```

## Integration with Framework

### Used in testSetup.js Fixture

```javascript
// Support/testSetup.js
const test = base.extend({
    pageObjects: async ({ page }, use) => {
        const pageFactory = new PageFactory(page);
        await use(pageFactory.getAll());  // ← Provides all pages
    }
});
```

### Used in Step Definitions

```javascript
// steps/universal.steps.js
Given(
    'the user navigates to the {string} page',
    async ({ pageObjects }, pageName) => {
        const pageObject = pageObjects[pageName + "Page"];
        await pageObject.navigate();
    }
);
```

### Integration Flow

```
┌──────────────────────────────────────────────────────────┐
│ Test Starts                                              │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ testSetup.js fixture: pageObjects                        │
│ → PageFactory created                                    │
│ → getAll() called                                        │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ pageObjects available in step:                           │
│ {                                                        │
│   loginPage: <instance>,                                 │
│   shopPage: <instance>                                   │
│ }                                                        │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ Step accesses: pageObjects.loginPage                     │
│ → Already instantiated (from cache)                      │
│ → Ready to use immediately                               │
└──────────────────────────────────────────────────────────┘
```

## Practical Examples

### Example 1: Adding a New Page

**Step 1: Create the page file**

```javascript
// pages/CheckoutPage.js
const { BasePage } = require('./BasePage');
const { ElementFactory } = require('../Support/ElementFactory');
const envConfig = require('../.env.config');

class CheckoutPage extends BasePage {
    constructor(page) {
        super(page, `${envConfig.BASEURL}/checkout/`);
        const elementFactory = new ElementFactory(page);
        Object.assign(this, elementFactory.getAll('checkout'));
    }
}

module.exports = { CheckoutPage };  // ← Must export with class name
```

**Step 2: PageFactory auto-discovers it**

```javascript
// No configuration needed!
// Next test run:
// - PageFactory scans pages/
// - Finds CheckoutPage.js
// - Registers as "checkout"
// - Available as pageObjects.checkoutPage
```

**Step 3: Use in tests**

```javascript
// Immediately available in all steps
Given('the user navigates to the {string} page', async ({ pageObjects }, pageName) => {
    await pageObjects.checkoutPage.navigate();  // ← Works automatically!
});
```

### Example 2: Accessing Pages in Tests

```javascript
// Scenario 1: Via fixture (recommended)
test('login test', async ({ pageObjects }) => {
    await pageObjects.loginPage.navigate();
    await pageObjects.loginPage.usernameInput.fill('user');
});

// Scenario 2: Direct instantiation (not recommended)
test('login test', async ({ page }) => {
    const factory = new PageFactory(page);
    const login = factory.get('login');
    await login.navigate();
});
```

### Example 3: Dynamic Page Access

```javascript
// Step definition with dynamic page selection
Given(
    'the user navigates to the {string} page',
    async ({ pageObjects }, pageName) => {
        const pageKey = pageName + "Page";  // "login" → "loginPage"
        const pageObject = pageObjects[pageKey];
        
        if (!pageObject) {
            throw new Error(`Page '${pageName}' not found`);
        }
        
        await pageObject.navigate();
    }
);
```

## Performance Optimization

### Lazy Loading Strategy

**Problem**: Creating all page objects upfront is expensive

**Solution**: Create pages only when accessed

**Impact**:

```javascript
// Without lazy loading (bad)
const allPages = {
    loginPage: new LoginPage(page),      // Created even if not used
    shopPage: new ShopPage(page),        // Created even if not used
    checkoutPage: new CheckoutPage(page) // Created even if not used
};

// With lazy loading (good)
const factory = new PageFactory(page);
const allPages = factory.getAll();
// Only creates pages when you call get()
```

**Performance Comparison**:

| Scenario | Without Lazy Loading | With Lazy Loading |
|----------|---------------------|-------------------|
| Test uses 1 page | Creates all 10 pages | Creates 1 page |
| Test uses 3 pages | Creates all 10 pages | Creates 3 pages |
| Initialization time | High (all upfront) | Low (on-demand) |

### Caching Strategy

**Problem**: Re-creating page instances is wasteful

**Solution**: Cache instances after first creation

**Benefit**:

```javascript
// First access
pageFactory.get('login');  // Creates new LoginPage instance (50ms)

// Second access
pageFactory.get('login');  // Returns cached instance (0.1ms)

// 500x faster!
```

## Validation & Error Handling

### Export Format Validation

**Valid Export**:
```javascript
class LoginPage extends BasePage { }
module.exports = { LoginPage };  // ✅ Named export
```

**Invalid Exports**:
```javascript
// ❌ Default export
module.exports = LoginPage;

// ❌ Different name
module.exports = { Login };

// ❌ No export
// (missing module.exports)
```

**Error Message**:
```
Error: LoginPage.js must export { LoginPage }
```

### Unknown Page Handling

**Code**:
```javascript
const page = factory.get('nonexistent');
```

**Error**:
```
Error: Unknown page: nonexistent
```

**Available Pages Debugging**:
```javascript
// List all registered pages
console.log(Object.keys(factory.registry));
// Output: ['login', 'shop', 'checkout']
```

## File System Requirements

### Directory Structure

```
project/
├── Support/
│   └── PageFactory.js
└── pages/
    ├── BasePage.js          ← Skipped (base class)
    ├── LoginPage.js         ← Registered as "login"
    ├── ShopPage.js          ← Registered as "shop"
    └── CheckoutPage.js      ← Registered as "checkout"
```

### Path Resolution

**How PageFactory finds pages/**:

```javascript
// In PageFactory.js (located at Support/PageFactory.js)
const pagesDir = path.join(__dirname, '../pages');

// __dirname = E:\Automation\Project\Support
// Result:     E:\Automation\Project\pages
```

**Path Calculation**:
```
PageFactory.js location:  Support/PageFactory.js
Relative path to pages:   ../pages
Absolute path:            <project_root>/pages
```

## Comparison with Alternatives

### Manual Page Management (Before PageFactory)

```javascript
// ❌ OLD WAY - Manual imports in every test
const { LoginPage } = require('./pages/LoginPage');
const { ShopPage } = require('./pages/ShopPage');

test('example', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const shopPage = new ShopPage(page);
    // ... test code
});
```

**Problems**:
- ❌ Repetitive imports in every test file
- ❌ Manual instantiation required
- ❌ No caching (creates duplicates)
- ❌ Hard to add new pages (update all tests)

### With PageFactory (Current)

```javascript
// ✅ NEW WAY - Automatic via fixture
test('example', async ({ pageObjects }) => {
    await pageObjects.loginPage.navigate();
    await pageObjects.shopPage.addToCart();
    // Auto-discovered, cached, ready to use
});
```

**Benefits**:
- ✅ Zero manual imports in tests
- ✅ Automatic instantiation
- ✅ Built-in caching
- ✅ Add new page → works everywhere automatically

## Design Patterns Used

### 1. Factory Pattern

**Definition**: Creates objects without specifying exact class

**Implementation**:
```javascript
// Instead of: new LoginPage(page)
// You do: factory.get('login')
```

**Benefit**: Centralized object creation logic

### 2. Registry Pattern

**Definition**: Central lookup table for available objects

**Implementation**:
```javascript
registry = {
    "login": LoginPage,
    "shop": ShopPage
}
```

**Benefit**: Dynamic discovery and access

### 3. Singleton Pattern (per page type)

**Definition**: One instance per page class

**Implementation**:
```javascript
cache = {
    "login": loginPageInstance  // Reused
}
```

**Benefit**: Memory efficiency, consistent state

### 4. Lazy Initialization

**Definition**: Create objects only when needed

**Implementation**:
```javascript
get(pageKey) {
    if (!this.cache[pageKey]) {  // Check first
        this.cache[pageKey] = new PageClass(this.page);  // Create if needed
    }
    return this.cache[pageKey];
}
```

**Benefit**: Faster startup, less memory

## Troubleshooting Guide

### Error: "Unknown page: xyz"

**Cause**: Page key doesn't exist in registry

**Solution**:
```javascript
// 1. Check file exists: pages/XyzPage.js
// 2. Check filename ends with 'Page.js'
// 3. Verify export format: module.exports = { XyzPage }
// 4. Check pageKey matches: "xyz" → XyzPage.js (lowercase)
```

### Error: "must export { ClassName }"

**Cause**: Incorrect export format in page file

**Solution**:
```javascript
// ❌ Wrong
module.exports = LoginPage;

// ✅ Correct
module.exports = { LoginPage };
```

### Page not auto-discovered

**Checklist**:
- [ ] File in `pages/` directory
- [ ] Filename ends with `Page.js`
- [ ] Not named `BasePage.js`
- [ ] Exports `{ ClassName }` format
- [ ] Class name matches filename

### Pages created multiple times

**Cause**: Not using `pageObjects` fixture

**Solution**:
```javascript
// ❌ Wrong - creates new factory each time
test('example', async ({ page }) => {
    const factory = new PageFactory(page);
    const pages = factory.getAll();
});

// ✅ Correct - uses cached factory
test('example', async ({ pageObjects }) => {
    // pageObjects already cached
});
```

## Best Practices

### ✅ DO

1. **Follow naming convention**: `*Page.js` for all page files
2. **Use correct export**: `module.exports = { ClassName }`
3. **Access via fixture**: Use `pageObjects` in tests
4. **Extend BasePage**: All pages should extend `BasePage`
5. **Implement isAt()**: For active page resolution

### ❌ DON'T

1. **Don't rename BasePage.js**: It's specifically excluded
2. **Don't use default exports**: Use named exports only
3. **Don't create factory manually**: Use `pageObjects` fixture
4. **Don't mix naming**: Stick to `*Page.js` convention
5. **Don't bypass caching**: Always use `get()` method

## Quick Reference

### API Summary

| Method | Parameters | Returns | Purpose |
|--------|------------|---------|---------|
| `constructor(page)` | Playwright Page | PageFactory instance | Initialize factory |
| `get(pageKey)` | string | Page instance | Get single page (cached) |
| `getAll()` | none | Object | Get all pages |
| `_buildRegistry()` | none | Object | Build page registry (internal) |

### Registry Key Format

| Filename | Registry Key | Object Key (getAll) |
|----------|-------------|-------------------|
| `LoginPage.js` | `"login"` | `loginPage` |
| `ShopPage.js` | `"shop"` | `shopPage` |
| `UserProfilePage.js` | `"userprofile"` | `userprofilePage` |

### Common Usage Patterns

```javascript
// Pattern 1: Access all pages
const { loginPage, shopPage } = pageObjects;

// Pattern 2: Dynamic page access
const page = pageObjects[pageName + "Page"];

// Pattern 3: Check if page exists
if (pageObjects.loginPage) { /* ... */ }

// Pattern 4: Direct get (rare)
const factory = new PageFactory(page);
const login = factory.get('login');
```

## Summary

**PageFactory** is the foundation of your Page Object Model architecture:

- 🔍 **Auto-discovers** all page classes without manual configuration
- 🏭 **Creates instances** on-demand using factory pattern
- 💾 **Caches instances** for performance and consistency
- 🎯 **Provides unified access** via `pageObjects` fixture
- ✅ **Validates exports** to catch errors early
- 🚀 **Optimizes performance** with lazy loading

**Key Takeaway**: Add a new `*Page.js` file, and it's immediately available everywhere—no configuration needed!