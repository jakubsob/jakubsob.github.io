---
title: 'Testing your Plumber APIs from R'
description: 'Learn how to effectively test your Plumber APIs in R using a two-layer testing strategy that separates business logic from API contracts.'
pubDate: 'Jul 20 2025'
tags: ["r", "tests", "plumber"]
---

When building Plumber APIs in R, effective testing is crucial for ensuring reliability and maintainability.

This guide explores a proven pattern for testing own Plumber APIs that maintains fast feedback loops while providing robust coverage of both business logic and API contracts.

> **✨ Check out the example in [R Tests Gallery.](https://jakubsobolewski.com/r-tests-gallery)**

## The Power of Separation of Concerns

The key to effective API testing lies in **separating business logic from API contracts**. This separation serves two critical purposes: it keeps your feedback loop short and ensures each layer of your application can be tested independently.

When you wrap your business logic in functions or objects that can be tested without starting an API server, you gain the ability to verify core functionality instantly. This approach allows rapid iteration during development, as you don't need to spin up an entire web server just to test a calculation or data transformation.

Meanwhile, API contract testing focuses on verifying the **shapes of responses rather than their specific content**. This distinction is vital because API tests should validate what defines the contract of your API, not the underlying business rules that are already tested elsewhere.

## The Two Layer Testing Strategy

Effective Plumber API testing employs a two-layer approach that mirrors the principle of separation of concerns:

- **Business Logic Layer**: Test your core functions independently using standard `testthat` unit tests. These should run fast and cover edge cases, error conditions, and various input scenarios without any HTTP overhead.

- **API Contract Layer**: Test the HTTP interface to ensure endpoints respond correctly, return proper status codes, and maintain expected response structures. These tests verify serialization, deserialization, and API-specific concerns.

## Implementation with mirai and httr2

The recommended implementation leverages `mirai` for background process management and `httr2` for HTTP testing.

### Background Process Management with [mirai](https://mirai.r-lib.org/index.html)

`mirai` provides an elegant solution for launching your Plumber API in a background process.

The `mirai` package implements futures in R, allowing asynchronous evaluation of R expressions in separate processes. When testing APIs, you can launch your Plumber in a background daemon and immediately continue with your test setup, creating a non-blocking testing environment.

### HTTP Testing with [httr2](https://httr2.r-lib.org/index.html)

`httr2` serves as your HTTP client for making requests against your running API. Its pipeable API makes it straightforward to construct requests, handle authentication, and process responses in a readable manner.

## The Arrange-Act-Assert Pattern

Structure your API tests using the **Arrange-Act-Assert (AAA) pattern** to maintain clarity and consistency:

- **Arrange**: Start your API in a background process, prepare your test data, and set up any required authentication or configuration. This phase handles all the setup work needed for your test scenario. *If your API is stateless, start the API before all tests to save time on repeated startup.*

- **Act**: Make the HTTP request to your API endpoint using `httr2`. This step should focus solely on executing the action you want to test.

- **Assert**: Verify the response meets your expectations. Check status codes, response headers, and the structure of returned data. Focus on contract validation rather than business logic verification.

This pattern ensures your tests remain focused, readable, and maintainable while providing clear separation between test setup, execution, and verification phases.

## [File Organization for Fast Feedback](https://jakubsobolewski.com/blog/want-to-get-faster-feedback-from-unit-tests/)

Adopt a `test-api-<endpoint>.R` file naming pattern to enable testing individual endpoints in isolation. This organization allows you to run tests for specific API endpoints without executing your entire test suite, significantly reducing feedback time during development.

When working on a particular endpoint, you can run just its associated test file to get immediate feedback on your changes. This targeted testing approach is particularly valuable during test-driven development workflows where rapid iteration is essential.

## Testing Response Shapes, Not Content

A key insight in API testing is focusing on **response shapes rather than specific content**. Your API contract defines the structure of responses: which fields are present, their data types, and the overall format. The actual values within those fields are typically determined by your business logic, which should be tested separately.

For example, when testing an endpoint that returns user information, verify that the response contains the expected fields like `id`, `name`, and `email`, and that they have appropriate data types. Don't test whether a specific user's name is "John Doe" – that's a business logic concern that belongs in your unit tests.

## Alternative Approaches: Using [nanonext](https://nanonext.r-lib.org/index.html) for Concurrent Requests

While `httr2` provides excellent HTTP client capabilities, the `nanonext` package offers an alternative approach for testing concurrent requests.

When your API testing requires validation of concurrent request handling or high-performance scenarios, `nanonext` can serve as a powerful alternative to `httr2`. It's particularly suitable for testing scenarios involving multiple simultaneous requests.
****
## Avoiding Common Pitfalls

Several anti-patterns can undermine your API testing efforts:

- **Don't duplicate business logic tests** in your API tests. If you've already tested edge cases and error conditions in your business logic layer, don't repeat those same tests at the API layer. Focus API tests on concerns specific to the HTTP interface.

- **Avoid testing implementation details** through the API. Your API tests should remain stable even when internal implementation changes, as long as the external behavior remains consistent.

- **Don't make tests dependent on external services** unless absolutely necessary. Use mocks or test doubles for external dependencies to ensure your tests remain fast and reliable.

## Wrapping Request Code in Functions

To maintain clean, readable tests and avoid code duplication, wrap your request logic in reusable functions. These helper functions can encapsulate common request patterns, authentication setup, and response parsing logic.

This approach not only reduces repetition but also makes your tests more maintainable. When API request patterns change, you only need to update the helper functions rather than modifying every individual test.

## Get Feedback Fast

The separation of concerns delivers significant advantages in development speed and code quality. By testing business logic independently of the API layer, you can achieve rapid feedback cycles that support test-driven development practices.

When business logic tests run in milliseconds and API tests complete in seconds, you can afford to run them frequently during development. This fast feedback enables you to catch issues early, refactor with confidence, and maintain high code quality without sacrificing development velocity.

The testing pattern outlined here represents a mature approach to API testing that balances thoroughness with practicality. By separating concerns, using appropriate tools, and following established patterns, you can build a testing strategy that supports both rapid development and long-term maintainability of your Plumber APIs.

> **✨ Check out the example in [R Tests Gallery.](https://jakubsobolewski.com/r-tests-gallery)**
