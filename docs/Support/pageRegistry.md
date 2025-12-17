# pageRegistry.js Documentation

---

## Overview

`pageRegistry.js` is an **auto-discovery module** that automatically finds and registers all Page Object classes in your project. It eliminates manual page registration by scanning the `pages/` directory at runtime.

**Single Responsibility:** Discover and register all page classes automatically.

---

## File Location

```
project-root/
├── Support/
│   ├── pageRegistry.js    ← THIS FILE
│   ├── PageFactory.js     ← Uses this registry
│   ├── fixtures.js
│   └── bdd.js
├── pages/
│   ├── BasePage.js        (excluded - base class)
│   ├── LoginPage.js       ← Auto-discovered
│   ├── ShopPage.js        ← Auto-discovered
│   └── HomePage.js        ← Auto-discovered
```

---

## Complete Code

```javascript
// ==========================================
// Support/pageRegistry.js
// ==========================================

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../pages');
const registry = {};

const files = fs.readdirSync(pagesDir);

for (const file of files) {
    if (file.endsWith('Page.js') && file !== 'BasePage.js') {
        const fullPath = path.join(pagesDir, file);
        const pageKey = file.replace('Page.js', '').toLowerCase();
        const exported = require(fullPath);
        const className = Object.keys(exported)[0];
        registry[pageKey] = exported[className];
    }
}

module.exports = registry;
```

---

## What Does This File Do?

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   BEFORE (Without Auto-Discovery)                                       │
│   ════════════════════════════════                                      │
│                                                                         │
│   // Manual registration - must update for every new page               │
│   const registry = {                                                    │
│       login: require('../pages/LoginPage').LoginPage,                   │
│       shop: require('../pages/ShopPage').ShopPage,                      │
│       home: require('../pages/HomePage').HomePage,                      │
│       // Add new pages manually... easy to forget!                      │
│   };                                                                    │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────   │
│                                                                         │
│   AFTER (With Auto-Discovery)                                           │
│   ═══════════════════════════                                           │
│                                                                         │
│   // Automatic - just add files to pages/ folder                        │
│   // pageRegistry.js finds them automatically!                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Line-by-Line Breakdown

---

### Lines 1-2: Import Node.js Modules

```javascript
const fs = require('fs');
const path = require('path');
```

| Module | Purpose |
|--------|---------|
| `fs` | File System - Read directory contents |
| `path` | Path utilities - Build file paths safely |

**Why these built-in modules?**
- `fs.readdirSync()` - Lists all files in a directory
- `path.join()` - Creates cross-platform file paths (Windows/Mac/Linux)

---

### Line 3: Define Pages Directory

```javascript
const pagesDir = path.join(__dirname, '../pages');
```

**What is `__dirname`?**

A Node.js variable containing the current file's directory path.

**Path Resolution:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   __dirname = /project/Support                                          │
│                                                                         │
│   path.join(__dirname, '../pages')                                      │
│            = /project/Support + ../pages                                │
│            = /project/pages                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Why use `path.join()`?**

```javascript
// ❌ BAD: Won't work on Windows (uses backslashes)
const pagesDir = __dirname + '/../pages';

// ✅ GOOD: Works on all operating systems
const pagesDir = path.join(__dirname, '../pages');
```

---

### Line 4: Initialize Empty Registry

```javascript
const registry = {};
```

**This will become:**

```javascript
{
    login: LoginPage,      // class reference
    shop: ShopPage,        // class reference
    home: HomePage,        // class reference
    // ... more pages
}
```

---

### Line 5: Read All Files in Pages Directory

```javascript
const files = fs.readdirSync(pagesDir);
```

**What `readdirSync` returns:**

```javascript
[
    'BasePage.js',
    'HomePage.js',
    'LoginPage.js',
    'ShopPage.js'
]
```

**Why `readdirSync` (not `readdir`)?**

| Method | Type | Use Case |
|--------|------|----------|
| `readdirSync` | Synchronous | Module initialization (runs once at startup) |
| `readdir` | Asynchronous | Runtime operations (doesn't block) |

Since this runs once when the module loads, synchronous is fine.

---

### Lines 6-13: Process Each File

```javascript
for (const file of files) {
    if (file.endsWith('Page.js') && file !== 'BasePage.js') {
        const fullPath = path.join(pagesDir, file);
        const pageKey = file.replace('Page.js', '').toLowerCase();
        const exported = require(fullPath);
        const className = Object.keys(exported)[0];
        registry[pageKey] = exported[className];
    }
}
```

**Let's break this down step by step:**

---

#### Step 1: Filter Files

```javascript
if (file.endsWith('Page.js') && file !== 'BasePage.js')
```

| Condition | Purpose |
|-----------|--------|
| `file.endsWith('Page.js')` | Only process page files |
| `file !== 'BasePage.js'` | Exclude the base class |

**Filter Results:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   All Files              After Filter                                   │
│   ─────────              ────────────                                   │
│   BasePage.js      →     (excluded - base class)                        │
│   HomePage.js      →     ✓ HomePage.js                                  │
│   LoginPage.js     →     ✓ LoginPage.js                                 │
│   ShopPage.js      →     ✓ ShopPage.js                                  │
│   utils.js         →     (excluded - not *Page.js)                      │
│   README.md        →     (excluded - not *Page.js)                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

#### Step 2: Build Full Path

```javascript
const fullPath = path.join(pagesDir, file);
```

**Example:**

```
pagesDir = /project/pages
file = LoginPage.js
fullPath = /project/pages/LoginPage.js
```

---

#### Step 3: Create Registry Key

```javascript
const pageKey = file.replace('Page.js', '').toLowerCase();
```

**Transformation:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   File Name              Page Key                                       │
│   ─────────              ────────                                       │
│   LoginPage.js     →     'login'                                        │
│   ShopPage.js      →     'shop'                                         │
│   HomePage.js      →     'home'                                         │
│   CheckoutPage.js  →     'checkout'                                     │
│                                                                         │
│   Steps:                                                                │
│   1. 'LoginPage.js'.replace('Page.js', '') → 'Login'                    │
│   2. 'Login'.toLowerCase() → 'login'                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

#### Step 4: Import the Page File

```javascript
const exported = require(fullPath);
```

**What `require` returns:**

```javascript
// If LoginPage.js exports:
module.exports = { LoginPage };

// Then exported = 
{ LoginPage: [class LoginPage] }
```

---

#### Step 5: Extract Class Name

```javascript
const className = Object.keys(exported)[0];
```

**What this does:**

```javascript
exported = { LoginPage: [class LoginPage] }

Object.keys(exported) = ['LoginPage']

Object.keys(exported)[0] = 'LoginPage'
```

---

#### Step 6: Register the Class

```javascript
registry[pageKey] = exported[className];
```

**Final result:**

```javascript
registry['login'] = LoginPage  // The actual class
```

---

## Complete Transformation Example

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   FILE: LoginPage.js                                                    │
│   ══════════════════                                                    │
│                                                                         │
│   Step 1: file = 'LoginPage.js'                                         │
│                                                                         │
│   Step 2: Passes filter?                                                │
│           - ends with 'Page.js'? ✓                                      │
│           - not 'BasePage.js'? ✓                                        │
│           → YES, process it                                             │
│                                                                         │
│   Step 3: fullPath = '/project/pages/LoginPage.js'                      │
│                                                                         │
│   Step 4: pageKey = 'LoginPage.js'                                      │
│                      .replace('Page.js', '') → 'Login'                  │
│                      .toLowerCase() → 'login'                           │
│                                                                         │
│   Step 5: exported = require(fullPath)                                  │
│                    = { LoginPage: [class] }                             │
│                                                                         │
│   Step 6: className = Object.keys(exported)[0]                          │
│                     = 'LoginPage'                                       │
│                                                                         │
│   Step 7: registry['login'] = exported['LoginPage']                     │
│                             = LoginPage class                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Final Registry Output

```javascript
// After processing all files:
registry = {
    login: LoginPage,      // Class reference (not instance)
    shop: ShopPage,        // Class reference
    home: HomePage,        // Class reference
    checkout: CheckoutPage // Class reference
}
```

---

## How PageFactory Uses This

```javascript
// In PageFactory.js:
const pageRegistry = require('./pageRegistry');

class PageFactory {
    get(pageKey) {
        const PageClass = pageRegistry[pageKey];  // Get class from registry
        return new PageClass(this.page);          // Create instance
    }
}

// Usage:
factory.get('login')  // → new LoginPage(page)
factory.get('shop')   // → new ShopPage(page)
```

---

## Naming Convention Requirements

**For auto-discovery to work, files MUST follow this pattern:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   FILE NAMING                                                           │
│   ═══════════                                                           │
│                                                                         │
│   ✅ CORRECT                    ❌ WRONG                                │
│   ───────────                   ─────────                               │
│   LoginPage.js                  Login.js                                │
│   ShopPage.js                   ShopPageFile.js                         │
│   CheckoutPage.js               checkout-page.js                        │
│   MyCustomPage.js               myCustomPage.js                         │
│                                                                         │
│   Pattern: {Name}Page.js                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   EXPORT NAMING                                                         │
│   ═════════════                                                         │
│                                                                         │
│   // ✅ CORRECT: Named export matching file name                        │
│   class LoginPage { ... }                                               │
│   module.exports = { LoginPage };                                       │
│                                                                         │
│   // ❌ WRONG: Default export                                           │
│   module.exports = LoginPage;                                           │
│                                                                         │
│   // ❌ WRONG: Different export name                                    │
│   module.exports = { Page: LoginPage };                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Adding a New Page

**Just create the file - no registration needed!**

```javascript
// pages/ProductPage.js

class ProductPage {
    constructor(page) {
        this.page = page;
        this.url = '/products';
    }

    async navigate() {
        await this.page.goto(this.url);
    }
}

module.exports = { ProductPage };
```

**That's it!** The registry automatically discovers it:

```javascript
// registry now includes:
{
    login: LoginPage,
    shop: ShopPage,
    home: HomePage,
    product: ProductPage  // ← Automatically added!
}
```

---

## Visual: Auto-Discovery Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   pages/ directory                                                      │
│   ════════════════                                                      │
│                                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│   │ LoginPage.js │  │ ShopPage.js  │  │ HomePage.js  │                  │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│          │                 │                 │                          │
│          │    fs.readdirSync()               │                          │
│          └─────────────────┼─────────────────┘                          │
│                            │                                            │
│                            ▼                                            │
│                    ┌───────────────┐                                    │
│                    │ pageRegistry  │                                    │
│                    │               │                                    │
│                    │ for each file │                                    │
│                    │   → filter    │                                    │
│                    │   → require   │                                    │
│                    │   → register  │                                    │
│                    └───────┬───────┘                                    │
│                            │                                            │
│                            ▼                                            │
│                    ┌───────────────┐                                    │
│                    │   registry    │                                    │
│                    │               │                                    │
│                    │ login: Class  │                                    │
│                    │ shop: Class   │                                    │
│                    │ home: Class   │                                    │
│                    └───────────────┘                                    │
│                            │                                            │
│                            │ module.exports                             │
│                            ▼                                            │
│                    ┌───────────────┐                                    │
│                    │  PageFactory  │                                    │
│                    │               │                                    │
│                    │ Uses registry │                                    │
│                    │ to create     │                                    │
│                    │ instances     │                                    │
│                    └───────────────┘                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Why Auto-Discovery?

### Benefits

| Benefit | Description |
|---------|-------------|
| **Zero Configuration** | Just add files, they're automatically found |
| **No Forgotten Pages** | Can't forget to register a new page |
| **Single Source of Truth** | File system IS the registry |
| **Easy Refactoring** | Rename/delete files, registry updates automatically |
| **Scalability** | Works with 5 pages or 500 pages |

### Trade-offs

| Trade-off | Description |
|-----------|-------------|
| **Naming Convention** | Must follow `{Name}Page.js` pattern |
| **Export Format** | Must use `module.exports = { ClassName }` |
| **Single Directory** | All pages must be in `pages/` folder |

---

## Common Issues

---

### Issue 1: Page Not Found

```
Error: Unknown page: product
```

**Possible causes:**

| Cause | Solution |
|-------|----------|
| Wrong file name | Rename to `ProductPage.js` |
| Wrong location | Move to `pages/` directory |
| Wrong export | Use `module.exports = { ProductPage }` |

---

### Issue 2: Class is Undefined

```
TypeError: PageClass is not a constructor
```

**Cause:** Wrong export format

```javascript
// ❌ WRONG
module.exports = ProductPage;

// ✅ CORRECT
module.exports = { ProductPage };
```

---

### Issue 3: BasePage Being Registered

**This shouldn't happen** - BasePage is explicitly excluded:

```javascript
if (file.endsWith('Page.js') && file !== 'BasePage.js')
//                              ^^^^^^^^^^^^^^^^^^^^^^^^
//                              This excludes BasePage
```

---

## Relationship with Other Files

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   pageRegistry.js                                                       │
│   ═══════════════                                                       │
│   Discovers: All page classes                                           │
│   Exports: { login: LoginPage, shop: ShopPage, ... }                    │
│                                                                         │
│        │                                                                │
│        │ imported by                                                    │
│        ▼                                                                │
│                                                                         │
│   PageFactory.js                                                        │
│   ══════════════                                                        │
│   Uses: pageRegistry to find classes                                    │
│   Creates: Page instances with caching                                  │
│                                                                         │
│        │                                                                │
│        │ used in                                                        │
│        ▼                                                                │
│                                                                         │
│   fixtures.js                                                           │
│   ═══════════                                                           │
│   Creates: PageFactory instance                                         │
│   Provides: pageObjects fixture                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### What It Does

| Input | Output |
|-------|--------|
| `pages/LoginPage.js` | `{ login: LoginPage }` |
| `pages/ShopPage.js` | `{ shop: ShopPage }` |
| `pages/BasePage.js` | (excluded) |

### File Requirements

| Requirement | Example |
|-------------|--------|
| File name | `{Name}Page.js` |
| Location | `pages/` directory |
| Export | `module.exports = { ClassName }` |

### Usage

```javascript
// Imported by PageFactory
const pageRegistry = require('./pageRegistry');

// Access a class
const LoginPage = pageRegistry['login'];
const instance = new LoginPage(page);
```

---

## One-Line Summary

> **pageRegistry.js automatically scans the `pages/` folder and creates a lookup table mapping page keys (like 'login') to their class constructors (like LoginPage).**