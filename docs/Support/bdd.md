# BDD.js Documentation

## Overview

The `bdd.js` file is the **bridge** between your fixtures and your step definitions. It creates `Given`, `When`, `Then` functions that are aware of your custom fixtures.

**Single Responsibility:** Connect fixtures to Gherkin step definitions.

---

## File Location

```
project-root/
└── Support/
    ├── fixtures.js    ← Defines fixtures
    └── bdd.js         ← Creates Given/When/Then (this file)
```

---

## Complete Code

```javascript
// ==========================================
// Support/bdd.js
// ==========================================

const { createBdd } = require('playwright-bdd');
const { test } = require('./fixtures');

const { Given, When, Then } = createBdd(test);

module.exports = { Given, When, Then };
```

**Just 4 lines of actual code!**

---

## Line-by-Line Breakdown

---

### Line 1: Import createBdd

```javascript
const { createBdd } = require('playwright-bdd');
```

**What is createBdd?**

`createBdd` is a **factory function** from the playwright-bdd library.

| Term | Meaning |
|------|--------|
| Factory function | A function that creates and returns other functions |
| createBdd | Creates Given, When, Then functions |

**What it does:**
- Takes a test object with fixtures as input
- Returns `{ Given, When, Then }` functions as output
- These functions know about your fixtures

---

### Line 2: Import test from fixtures

```javascript
const { test } = require('./fixtures');
```

**What is test?**

Your extended test object containing all fixtures (built-in + custom).

**What test contains:**

| Built-in Fixtures | Custom Fixtures |
|-------------------|-----------------|
| page | actionUtils |
| browser | pageObjects |
| context | getActivePage |
| request | |

**Why import from ./fixtures (not playwright-bdd)?**

```javascript
// ❌ WRONG: Only has built-in fixtures
const { test } = require('playwright-bdd');

// ✅ CORRECT: Has built-in + custom fixtures
const { test } = require('./fixtures');
```

If you import from playwright-bdd, your steps won't have access to `actionUtils`, `pageObjects`, or `getActivePage`.

---

### Line 3: Create Given, When, Then

```javascript
const { Given, When, Then } = createBdd(test);
```

**What happens here:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   createBdd(test)                                                       │
│       │                                                                 │
│       │  Input: test object with fixtures                               │
│       ▼                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                 │   │
│   │   createBdd analyzes test:                                      │   │
│   │                                                                 │   │
│   │   "Available fixtures:                                          │   │
│   │    - page                                                       │   │
│   │    - actionUtils                                                │   │
│   │    - pageObjects                                                │   │
│   │    - getActivePage                                              │   │
│   │                                                                 │   │
│   │   I'll create Given/When/Then that can provide these"           │   │
│   │                                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                 │
│       │  Output: { Given, When, Then }                                  │
│       ▼                                                                 │
│   Functions that can inject fixtures into steps                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Destructuring explained:**

```javascript
// This shorthand:
const { Given, When, Then } = createBdd(test);

// Is equivalent to:
const bddFunctions = createBdd(test);
const Given = bddFunctions.Given;
const When = bddFunctions.When;
const Then = bddFunctions.Then;
```

---

### Line 4: Export

```javascript
module.exports = { Given, When, Then };
```

**What it does:**

Makes `Given`, `When`, `Then` available for other files to import.

**How step files use it:**

```javascript
// In universal.steps.js:
const { Given, When, Then } = require('../Support/bdd');
//     └──────────────────┘          └───────────────┘
//     These come from               This file
//     module.exports
```

---

## What Are Given, When, Then?

They are **functions** used to define step definitions.

### Function Signature

```javascript
Given(pattern, stepFunction)
When(pattern, stepFunction)
Then(pattern, stepFunction)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| pattern | String | Gherkin step text with optional parameters |
| stepFunction | Async Function | Code to execute, receives fixtures |

### Example Usage

```javascript
When(
    'the user clicks on the {string} button',  // pattern
    async ({ actionUtils }, buttonName) => {   // stepFunction
        await actionUtils.click(locator);
    }
);
```

### Pattern Parameters

| Pattern | Matches | Parameter Type |
|---------|---------|----------------|
| `{string}` | "Login", "Submit" | String |
| `{int}` | 1, 42, 100 | Integer |
| `{float}` | 1.5, 3.14 | Float |
| `{word}` | Login, Submit | Single word |

---

## How Given/When/Then Work

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   STEP DEFINITION                                                       │
│   ═══════════════                                                       │
│                                                                         │
│   When('the user clicks on the {string} button',                        │
│        async ({ actionUtils }, buttonName) => { ... })                  │
│              │                 │                                        │
│              │                 │                                        │
│              ▼                 ▼                                        │
│        ┌──────────┐      ┌──────────┐                                   │
│        │ Fixtures │      │ Gherkin  │                                   │
│        │ needed   │      │ parameter│                                   │
│        └──────────┘      └──────────┘                                   │
│                                                                         │
│   AT RUNTIME                                                            │
│   ══════════                                                            │
│                                                                         │
│   Feature file: When the user clicks on the "Login" button              │
│                                                  │                      │
│                                                  ▼                      │
│   1. Match pattern: "the user clicks on the {string} button"            │
│   2. Extract parameter: buttonName = "Login"                            │
│   3. Resolve fixtures: actionUtils = ActionUtils instance               │
│   4. Call step: stepFunction({ actionUtils }, "Login")                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Why createBdd Needs test

### Without test (Broken)

```javascript
const { Given, When, Then } = createBdd();  // No test!

When('...', async ({ actionUtils }) => {
    // ❌ ERROR: actionUtils is undefined!
    // createBdd doesn't know about this fixture
});
```

### With test (Working)

```javascript
const { Given, When, Then } = createBdd(test);  // test has fixtures

When('...', async ({ actionUtils }) => {
    // ✅ Works! createBdd knows actionUtils from test
});
```

---

## Why This File Exists

### Without bdd.js (Repetitive)

Every step file would need:

```javascript
// ❌ In EVERY step file:
const { createBdd } = require('playwright-bdd');
const { test } = require('../Support/fixtures');
const { Given, When, Then } = createBdd(test);

// ... steps
```

### With bdd.js (Clean)

Step files just import:

```javascript
// ✅ In every step file:
const { Given, When, Then } = require('../Support/bdd');

// ... steps
```

**Benefits:**
- DRY (Don't Repeat Yourself)
- Single point of configuration
- Easy to maintain
- If fixtures change, only bdd.js needs updating

---

## File Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   playwright-bdd (npm package)                                          │
│        │                                                                │
│        │ provides createBdd                                             │
│        ▼                                                                │
│   ┌─────────┐                                                           │
│   │ bdd.js  │◄──────────────────────┐                                   │
│   └────┬────┘                       │                                   │
│        │                            │                                   │
│        │ imports test               │ provides createBdd                │
│        ▼                            │                                   │
│   ┌─────────────┐                   │                                   │
│   │ fixtures.js │                   │                                   │
│   └─────────────┘                   │                                   │
│                                     │                                   │
│   bdd.js exports { Given, When, Then }                                  │
│        │                                                                │
│        │ imported by                                                    │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                 │   │
│   │   universal.steps.js                                            │   │
│   │   login.steps.js                                                │   │
│   │   shop.steps.js                                                 │   │
│   │   ... (all step files)                                          │   │
│   │                                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   1. fixtures.js creates test with fixtures                             │
│                    │                                                    │
│                    ▼                                                    │
│   2. bdd.js imports test                                                │
│                    │                                                    │
│                    ▼                                                    │
│   3. createBdd(test) creates Given/When/Then                            │
│                    │                                                    │
│                    ▼                                                    │
│   4. bdd.js exports { Given, When, Then }                               │
│                    │                                                    │
│                    ▼                                                    │
│   5. Step files import Given/When/Then                                  │
│                    │                                                    │
│                    ▼                                                    │
│   6. Steps define patterns with fixture requirements                    │
│                    │                                                    │
│                    ▼                                                    │
│   7. At runtime: fixtures injected, steps executed                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Analogy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   fixtures.js  =  Kitchen (has all the tools and ingredients)           │
│                                                                         │
│   bdd.js       =  Recipe Book (knows how to use the kitchen)            │
│                                                                         │
│   step files   =  Chefs (follow recipes using the kitchen)              │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                         │
│   createBdd(test) = "Here's the kitchen, create recipes for it"         │
│                                                                         │
│   { Given, When, Then } = Recipes that work with this specific kitchen  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Common Mistakes

### Mistake 1: Importing from wrong source

```javascript
// ❌ WRONG: Importing test from playwright-bdd
const { createBdd } = require('playwright-bdd');
const { test } = require('playwright-bdd');  // Wrong!

// ✅ CORRECT: Importing test from fixtures
const { createBdd } = require('playwright-bdd');
const { test } = require('./fixtures');  // Correct!
```

### Mistake 2: Not using bdd.js in step files

```javascript
// ❌ WRONG: Creating Given/When/Then in step file
const { createBdd } = require('playwright-bdd');
const { test } = require('../Support/fixtures');
const { Given, When, Then } = createBdd(test);

// ✅ CORRECT: Importing from bdd.js
const { Given, When, Then } = require('../Support/bdd');
```

### Mistake 3: Forgetting to export

```javascript
// ❌ WRONG: Forgot to export
const { Given, When, Then } = createBdd(test);
// Missing: module.exports = { Given, When, Then };

// ✅ CORRECT: Exported
const { Given, When, Then } = createBdd(test);
module.exports = { Given, When, Then };
```

---

## Adding More Exports (Optional)

If needed, you can export additional items:

```javascript
const { createBdd } = require('playwright-bdd');
const { test } = require('./fixtures');

const { Given, When, Then, Before, After } = createBdd(test);

module.exports = { Given, When, Then, Before, After };
```

| Export | Purpose |
|--------|--------|
| Given | Define Given steps |
| When | Define When steps |
| Then | Define Then steps |
| Before | Run before each scenario |
| After | Run after each scenario |

---

## Quick Reference

### Summary Table

| Line | Code | Purpose |
|------|------|--------|
| 1 | `require('playwright-bdd')` | Get createBdd factory |
| 2 | `require('./fixtures')` | Get test with fixtures |
| 3 | `createBdd(test)` | Create step functions |
| 4 | `module.exports` | Export for step files |

### Import in Step Files

```javascript
const { Given, When, Then } = require('../Support/bdd');
```

### Use in Step Definitions

```javascript
Given('some condition', async ({ fixture1, fixture2 }) => {
    // step code
});

When('some action', async ({ fixture1 }) => {
    // step code
});

Then('some result', async ({ fixture1, fixture2, fixture3 }) => {
    // step code
});
```

---

## One-Line Summary

> **bdd.js connects your fixtures to Gherkin steps by creating Given/When/Then functions that know about your custom fixtures.**