---
title: 'Mastering Test Driven Development: Build the Right Thing First'
description: 'Learn how Test Driven Development (TDD) ensures you build the right thing on the first try with no rewrites.'
pubDate: 'Oct 12 2023'
tags: ["r", "tests", "tdd"]
---

Writing test cases first helps us understand better what we need to build.

Tests allow us to express how the code should behave.

If we focus on asserting the behavior of code, we end up with tests that are also a functional documentation.

A business expert or other developer can read the tests and quickly understand what the code does, making it easier to correct any misunderstandings.

## ❌ Change your tests like these:

```r
describe("validate", {
  it("should work correctly", {
    # Complex setup
    # Many expectations
  })
})
```

## ✅ To tests like these:

```r
describe("validate", {
  it("should return TRUE if data passes validation", {
    # Arrange

    # Act

    # Assert

  })

  it("should return FALSE if data does not pass validation", {
    # ...
  })

  it("should throw an error if input is not a table", {
    # ...
  })
})
```

**Before writing each test case, ask yourself:**

- What is the input to the system? → Arrange
- How it interacts with other code? → Act
- What is the expected outcome? → Assert

Answering those questions:

- Reduces the risk of not understanding the requirements correctly.
- Reduces the risk of not handling critical edge cases.
- Reduces the risk of having to go back and rewrite the code.

And it all comes down to writing tests first. Build the right thing on the first try.
