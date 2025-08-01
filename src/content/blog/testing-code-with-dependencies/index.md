---
title: 'How to Test R Code That Uses LLMs, APIs, or Databases'
description: 'A Practical Guide to Faking External Dependencies in R for Fast, Reliable Tests.'
pubDate: 2025-08-01
tags: [tests, r, llm]
---

Your code often relies on external systems—LLMs, APIs, databases, or third-party libraries. While these are essential for functionality, they don’t need to be part of your tests.

Here’s a practical pattern to test your code without relying on external dependencies, so your tests remain fast, reliable, and cheap.

> 🧪 **[Check out this pattern how to test code with external dependencies.](https://jakubsobolewski.com/r-tests-gallery/external-service-interaction/)**

## 🚫 Why Testing External Dependencies Directly Is a Bad Idea

If you test your code that calls an API as-is:

1. **Tests will be slow**, as they will need to wait for the external resources to respond.
2. **Tests will be flaky**, as the external resources may not always be available or may return different results.
3. **Tests will be expensive**, as you may need to pay for the external resources.

Or **tests won't get written at all**, as there seem to be too many obstacles, it might not be worth it.

The alternative is to write **tests only for the code you own**.

## ✅ Test Only The Code You Own

The key is to test how your code behaves when interacting with external resources, without using the real ones. Here's how:

1. Create interfaces for interacting with the external resources.
2. Use fake objects or mocks to simulate the external resources in your tests.
3. Write tests that verify your code's behavior when interacting with the fake objects or mocks.
4. Use real objects in production code, but use fake objects or mocks in tests.

This way, you can test your code without relying on the external resources, making your tests fast, reliable, and inexpensive.

### 1. Create Interfaces

Don’t hardcode calls to external resources. Instead:

- Create interfaces that define how your code talks to them.
- Use dependency injection to pass these interfaces into your functions or classes.

This makes it easy to substitute real implementations with fakes or mocks during testing.

### 2. Use Fake Objects or Mocks

Simulate external systems in tests using fake objects or mocks:

- Mimic the shape and behavior of expected API/database responses.
- Control edge cases (e.g., timeouts, errors) in a predictable way.

This helps you test how your code handles various scenarios without relying on the real service.

### 3. Write Tests

Test your code's behavior by asserting:

- Correct calls to the fake/mocked interface.
- Correct handling of success, failure, and edge cases.

Follow the Arrange – Act – Assert pattern for each test, and keep each test focused on one expected outcome.

Create your objects the same way as you would in production code, but use the fake objects or mocks instead of the real objects.

### 4. Use Real Objects in Production Code

In production:

- Instantiate the real versions of the dependencies.
- Use a [factory function](https://refactoring.guru/design-patterns/factory-method) to create them. This keeps your production code clean and your tests flexible.

You can still override dependencies in tests while using defaults in production.

---

> 🧪 **[See the example on how to test a function that uses {ellmer}.](https://jakubsobolewski.com/r-tests-gallery/external-service-interaction/)**

External resources are essential to your system, but they don't belong in your unit tests. By isolating them through interfaces and mocks, you get faster, more reliable, and more maintainable tests—while keeping production code just as clean.
