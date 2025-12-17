# PageFactory.js Documentation

---

## Overview

**File:** `Support/PageFactory.js`

**Purpose:** Creates and caches Page Object instances.

**Pattern:** Factory Pattern with Caching (also known as Flyweight Pattern).

---

## File Location

```
Support/
├── PageFactory.js      ← This file
├── pageRegistry.js     ← Page class registry (used by PageFactory)
├── fixtures.js         ← Creates PageFactory instance
├── bdd.js
└── ...
```

---

## Complete Code

```javascript
// ==========================================
// Support/PageFactory.js
// ==========================================

const pageRegistry = require('./pageRegistry');

class PageFactory {
    constructor(page) {
        this.page = page;
        this.cache = {};
    }

    get(pageKey) {
        if (!this.cache[pageKey]) {
            const PageClass = pageRegistry[pageKey];
            if (!PageClass) {
                throw new Error(`Unknown page: ${pageKey}`);
            }
            this.cache[pageKey] = new PageClass(this.page);
        }
        return this.cache[pageKey];
    }

    getAll() {
        const all = {};
        for (const key of Object.keys(pageRegistry)) {
            all[key + 'Page'] = this.get(key);
        }
        return all;
    }
}

module.exports = { PageFactory };
```

---

## What is a Factory Pattern?

A **Factory** is a design pattern that:
- Creates objects for you
- Hides the creation logic
- Returns ready-to-use instances

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   WITHOUT FACTORY                                                       │
│   ═══════════════                                                       │
│                                                                         │
│   const loginPage = new LoginPage(page);                                │
│   const shopPage = new ShopPage(page);                                  │
│   const homePage = new HomePage(page);                                  │
│   // Must know every class, create each manually                        │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────   │
│                                                                         │
│   WITH FACTORY                                                          │
│   ════════════                                                          │
│                                                                         │
│   const factory = new PageFactory(page);                                │
│   const loginPage = factory.get('login');                               │
│   const shopPage = factory.get('shop');                                 │
│   // Factory knows all classes, creates for you                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Line-by-Line Breakdown

---

### Line 1: Import pageRegistry

```javascript
const pageRegistry = require('./pageRegistry');
```

**What is pageRegistry?**

```javascript
// pageRegistry.js contains:
module.exports = {
    login: LoginPage,
    shop: ShopPage,
    home: HomePage
};
```

**It's a mapping:**

| Key | Value |
|-----|-------|
| `'login'` | `LoginPage` class |
| `'shop'` | `ShopPage` class |
| `'home'` | `HomePage` class |

---

### Lines 3-6: Constructor

```javascript
class PageFactory {
    constructor(page) {
        this.page = page;
        this.cache = {};
    }
```

**What happens when you create a PageFactory:**

```javascript
const factory = new PageFactory(page);
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   PageFactory instance                                                  │
│   ════════════════════                                                  │
│                                                                         │
│   this.page = page (Playwright browser page)                            │
│                                                                         │
│   this.cache = {} (empty object for storing created pages)              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

| Property | Type | Purpose |
|----------|------|---------|
| `this.page` | Playwright Page | Browser page to pass to Page Objects |
| `this.cache` | Object | Stores created Page Objects |

---

### Lines 8-17: get() Method

```javascript
get(pageKey) {
    if (!this.cache[pageKey]) {
        const PageClass = pageRegistry[pageKey];
        if (!PageClass) {
            throw new Error(`Unknown page: ${pageKey}`);
        }
        this.cache[pageKey] = new PageClass(this.page);
    }
    return this.cache[pageKey];
}
```

**Step-by-step breakdown:**

```javascript
get(pageKey) {
//      ↑
//      Input: 'login', 'shop', 'home', etc.
```

```javascript
    if (!this.cache[pageKey]) {
//       ↑
//       Check: "Have I already created this page?"
```

```javascript
        const PageClass = pageRegistry[pageKey];
//            ↑                        ↑
//            │                        └── 'login'
//            └── LoginPage class
```

```javascript
        if (!PageClass) {
            throw new Error(`Unknown page: ${pageKey}`);
        }
//      ↑
//      Error if page not in registry
```

```javascript
        this.cache[pageKey] = new PageClass(this.page);
//                            ↑
//                            Create new instance and cache it
```

```javascript
    return this.cache[pageKey];
//         ↑
//         Return the cached instance
}
```

---

### Visual: get() Method Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   factory.get('login')                                                  │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Is 'login' in cache?                                            │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ├── YES ──────────────────────────────────────┐                  │
│        │                                             │                  │
│        ▼                                             │                  │
│   ┌─────────────────────────────────────────────┐    │                  │
│   │ NO: Create new instance                     │    │                  │
│   │                                             │    │                  │
│   │ 1. Get class from registry                  │    │                  │
│   │    PageClass = pageRegistry['login']        │    │                  │
│   │    PageClass = LoginPage                    │    │                  │
│   │                                             │    │                  │
│   │ 2. Create instance                          │    │                  │
│   │    new LoginPage(this.page)                 │    │                  │
│   │                                             │    │                  │
│   │ 3. Store in cache                           │    │                  │
│   │    this.cache['login'] = LoginPage instance │    │                  │
│   └─────────────────────────────────────────────┘    │                  │
│        │                                             │                  │
│        ▼                                             ▼                  │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Return this.cache['login']                                      │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Lines 19-25: getAll() Method

```javascript
getAll() {
    const all = {};
    for (const key of Object.keys(pageRegistry)) {
        all[key + 'Page'] = this.get(key);
    }
    return all;
}
```

**Step-by-step breakdown:**

```javascript
getAll() {
    const all = {};
//        ↑
//        Empty object to collect all page instances
```

```javascript
    for (const key of Object.keys(pageRegistry)) {
//                    ↑
//                    ['login', 'shop', 'home']
```

```javascript
        all[key + 'Page'] = this.get(key);
//          ↑                ↑
//          │                └── Get or create page instance
//          └── 'loginPage', 'shopPage', 'homePage'
```

```javascript
    return all;
//         ↑
//         { loginPage: LoginPage, shopPage: ShopPage, homePage: HomePage }
}
```

---

### Visual: getAll() Method Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   factory.getAll()                                                      │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Loop through pageRegistry keys: ['login', 'shop', 'home']       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ├── key = 'login'                                                │
│        │      all['loginPage'] = this.get('login')                      │
│        │                                                                │
│        ├── key = 'shop'                                                 │
│        │      all['shopPage'] = this.get('shop')                        │
│        │                                                                │
│        └── key = 'home'                                                 │
│               all['homePage'] = this.get('home')                        │
│                                                                         │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Return:                                                         │   │
│   │ {                                                               │   │
│   │     loginPage: LoginPage instance,                              │   │
│   │     shopPage: ShopPage instance,                                │   │
│   │     homePage: HomePage instance                                 │   │
│   │ }                                                               │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Why Caching Matters

---

### Without Caching (Bad)

```javascript
get(pageKey) {
    const PageClass = pageRegistry[pageKey];
    return new PageClass(this.page);  // New instance EVERY time!
}
```

**Problem:**

```javascript
const page1 = factory.get('login');  // Creates LoginPage #1
const page2 = factory.get('login');  // Creates LoginPage #2

page1 === page2  // false! Different objects
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   factory.get('login')  →  LoginPage #1  (memory: 0x001)                │
│   factory.get('login')  →  LoginPage #2  (memory: 0x002)                │
│   factory.get('login')  →  LoginPage #3  (memory: 0x003)                │
│                                                                         │
│   ❌ Wastes memory                                                      │
│   ❌ State not shared                                                   │
│   ❌ Inconsistent behavior                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### With Caching (Good)

```javascript
get(pageKey) {
    if (!this.cache[pageKey]) {
        // Only create if not cached
        this.cache[pageKey] = new PageClass(this.page);
    }
    return this.cache[pageKey];  // Return same instance
}
```

**Result:**

```javascript
const page1 = factory.get('login');  // Creates and caches
const page2 = factory.get('login');  // Returns cached

page1 === page2  // true! Same object
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   factory.get('login')  →  LoginPage #1  (memory: 0x001) [CREATED]      │
│   factory.get('login')  →  LoginPage #1  (memory: 0x001) [FROM CACHE]   │
│   factory.get('login')  →  LoginPage #1  (memory: 0x001) [FROM CACHE]   │
│                                                                         │
│   ✅ Saves memory                                                       │
│   ✅ State is shared                                                    │
│   ✅ Consistent behavior                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## How PageFactory is Used

---

### In fixtures.js

```javascript
pageObjects: async ({ page }, use) => {
    const pageFactory = new PageFactory(page);
//                      ↑
//                      Create factory with browser page
    
    await use(pageFactory.getAll());
//            ↑
//            Get all page objects
}
```

---

### What getAll() Returns

```javascript
pageFactory.getAll()

// Returns:
{
    loginPage: LoginPage { page, locators, navigate(), ... },
    shopPage: ShopPage { page, locators, navigate(), ... },
    homePage: HomePage { page, locators, navigate(), ... }
}
```

---

### Used in Steps

```javascript
Given('the user navigates to the {string} page',
    async ({ pageObjects }, pageName) => {
        const pageObject = pageObjects[pageName + 'Page'];
//                         ↑
//                         Get from pageObjects (created by PageFactory)
        
        await pageObject.navigate();
    }
);
```

---

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Step needs pageObjects                                                │
│        │                                                                │
│        ▼                                                                │
│   fixtures.js creates PageFactory                                       │
│        │                                                                │
│        │  const pageFactory = new PageFactory(page);                    │
│        │                                                                │
│        ▼                                                                │
│   PageFactory.getAll() is called                                        │
│        │                                                                │
│        │  Loops through pageRegistry                                    │
│        │                                                                │
│        ▼                                                                │
│   For each key, PageFactory.get() is called                             │
│        │                                                                │
│        │  Creates Page Object instance                                  │
│        │  Caches it                                                     │
│        │                                                                │
│        ▼                                                                │
│   Returns { loginPage, shopPage, homePage, ... }                        │
│        │                                                                │
│        ▼                                                                │
│   Step receives pageObjects                                             │
│        │                                                                │
│        │  const pageObject = pageObjects[pageName + 'Page'];            │
│        │                                                                │
│        ▼                                                                │
│   Step uses page object                                                 │
│        │                                                                │
│        │  await pageObject.navigate();                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Naming Convention

**In pageRegistry:**

```javascript
module.exports = {
    login: LoginPage,   // key: 'login'
    shop: ShopPage,     // key: 'shop'
    home: HomePage      // key: 'home'
};
```

**After getAll():**

```javascript
{
    loginPage: LoginPage,   // key + 'Page'
    shopPage: ShopPage,
    homePage: HomePage
}
```

**Why add 'Page' suffix?**

Makes it clearer in steps:

```javascript
// Clear that it's a page object
pageObjects.loginPage.navigate();

// vs less clear
pageObjects.login.navigate();
```

---

## Error Handling

```javascript
get(pageKey) {
    if (!this.cache[pageKey]) {
        const PageClass = pageRegistry[pageKey];
        if (!PageClass) {
            throw new Error(`Unknown page: ${pageKey}`);
        }
        // ...
    }
}
```

**When error is thrown:**

```javascript
factory.get('checkout');  // Error: Unknown page: checkout
```

**Solution:**

Add the page to `pageRegistry.js`:

```javascript
// pageRegistry.js
const { CheckoutPage } = require('../pages/CheckoutPage');

module.exports = {
    login: LoginPage,
    shop: ShopPage,
    home: HomePage,
    checkout: CheckoutPage  // Add this
};
```

---

## Adding a New Page

---

### Step 1: Create Page Class

```javascript
// pages/CheckoutPage.js
class CheckoutPage {
    constructor(page) {
        this.page = page;
    }
    
    async navigate() {
        await this.page.goto('/checkout');
    }
}

module.exports = { CheckoutPage };
```

---

### Step 2: Add to Registry

```javascript
// Support/pageRegistry.js
const { CheckoutPage } = require('../pages/CheckoutPage');

module.exports = {
    login: LoginPage,
    shop: ShopPage,
    home: HomePage,
    checkout: CheckoutPage  // Add here
};
```

---

### Step 3: Use in Steps

```javascript
// Automatically available!
Given('the user navigates to the "checkout" page', ...);

// pageObjects.checkoutPage is now available
```

**No changes needed to PageFactory!**

---

## Class Summary

| Property/Method | Type | Purpose |
|-----------------|------|---------|
| `page` | Property | Playwright page instance |
| `cache` | Property | Stores created page objects |
| `get(pageKey)` | Method | Get or create single page object |
| `getAll()` | Method | Get all page objects as object |

---

## Method Reference

---

### get(pageKey)

```javascript
// Signature
get(pageKey: string): PageObject

// Example
const loginPage = factory.get('login');

// Returns
LoginPage instance
```

---

### getAll()

```javascript
// Signature
getAll(): { [key: string]: PageObject }

// Example
const pages = factory.getAll();

// Returns
{
    loginPage: LoginPage,
    shopPage: ShopPage,
    homePage: HomePage
}
```

---

## Design Benefits

| Benefit | Description |
|---------|-------------|
| **Single Source** | All pages created in one place |
| **Caching** | Same instance reused, saves memory |
| **Easy Extension** | Add pages to registry, factory handles rest |
| **Encapsulation** | Creation logic hidden from steps |
| **Lazy Loading** | Pages created only when needed |

---

## Quick Reference

```javascript
// Import
const { PageFactory } = require('./PageFactory');

// Create
const factory = new PageFactory(page);

// Get one page
const loginPage = factory.get('login');

// Get all pages
const allPages = factory.getAll();
// { loginPage, shopPage, homePage, ... }

// Use in fixtures.js
pageObjects: async ({ page }, use) => {
    const pageFactory = new PageFactory(page);
    await use(pageFactory.getAll());
}
```

---

## Visual Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   PageFactory                                                           │
│   ═══════════                                                           │
│                                                                         │
│   Input:  Playwright page                                               │
│                  │                                                      │
│                  ▼                                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                 │   │
│   │   PageFactory                                                   │   │
│   │   ┌─────────────────────────────────────────────────────────┐   │   │
│   │   │ page: Playwright page                                   │   │   │
│   │   │ cache: { login: LoginPage, shop: ShopPage, ... }        │   │   │
│   │   └─────────────────────────────────────────────────────────┘   │   │
│   │                                                                 │   │
│   │   get('login')  →  Returns cached or creates new               │   │
│   │   getAll()      →  Returns all pages as object                 │   │
│   │                                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                  │                                                      │
│                  ▼                                                      │
│   Output: { loginPage, shopPage, homePage, ... }                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```