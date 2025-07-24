---
title: 3 Reasons Blocking You From Doing Automated Testing
description: Get them out of your way to start testing your code effectively.
pubDate: Jul 23 2025
tags: [tests, r]
---

No, lack of time is not one of them.

Automated testing is celebrated as the cornerstone of high-quality, maintainable software. Yet, many teams still struggle to fully adopt it. The obstacles rarely boil down to “we’re too busy”—the real blockers are deeper and more fundamental.

## 1. Your Code is Not Testable by Design

A major blocker for automated testing: legacy code that's not testable by design.

Many teams inherit codebases where the architecture actively resists test automation. You might face:

- Tightly coupled components without clear boundaries, making it nearly impossible to test parts of the system in isolation.
- Hard-coded configuration (like direct references to production databases or APIs), which makes automated or even safe manual testing a high-risk proposition.
- Missing interfaces or points of control for injecting test doubles, dependencies, or test data.

With code that isn’t designed for testability, introducing automated tests, even acceptance tests, can be a monumental task. Often, a significant refactor or even an architectural redesign is required before meaningful automated testing can be added at all. Until the system is made "acceptance testable,” every attempt at automation hits a wall.

> 🧪 **[Check this guide on testing legacy Shiny apps.](https://jakubsobolewski.com/blog/testing-legacy-shiny/)**

## 2. Lack of Test Data

Writing automated tests is easy, if you have the data.

Developing on production data might sound easier, but it comes with significant risks. If the project is supposed to run on production data, why bother creating test version? That's just extra work, right?

It is extra work, but you won't get far without it.

Without accessible, realistic test data, tests either become brittle or, worse, never get written. Not only it prevents testing, but makes onboarding new developers difficult and hurts reproducibility. You shouldn't have to give access to every production system to every developer for them to contribute to the project.

Make your projects self-contained and testable.

### Solution

Build a catalog of fakes, mocks, and factories that let you simulate data for every isolated piece of your codebase. Not only will your tests run safely, but they’ll be reliable and easy to maintain.

**Have reusable data structures? Wrap each in a factory function to reuse across tests.**

I name those functions `fixture_<name>`. That way, when I start typing `fixture_`, I get autocompletion for all available fixtures. This makes it easy to find and use the right data in tests.

If a fixture is only used in one test file, define it in that file. If it’s used across multiple files, put it in a shared location, e.g. `tests/testthat/setup-fixtures.R`.

> 🧪 **[See this guide how you can capture data from a session to save and reuse for testing.](https://jakubsobolewski.com/blog/capturing-output-for-tests/)**

**Is your test data too big to define programatically?**

Put those structures in files, it can be a JSON, CSV, YAML, or any other format that suits your needs. I recommend using any human-readable format, so you can easily read and edit it. Load this data in your fixture function.

If you load this data in a fixture function, you can easily swap it out for different data in the future and change only the fixture function, not every test that uses it.

## 3. Tight Coupling with External Dependencies

Does your code only work when it talks to a “real” database or an external API? Tight coupling with external services, legacy systems, or specialized environments turns every test run into a intermittency nightmare.

### Solution

Refactor code to decouple business logic from external dependencies via interfaces, adapters, or dependency injection.

- Need a database? Create a local instance and populate it.
- Need files from a datastore? Substitute them with local files.
- Need access to an LLM? Mock the responses.

With [testthat::local_mocked_bindings](https://testthat.r-lib.org/reference/local_mocked_bindings.html), you can substitute dependencies with controlled, predictable data, although dependency injection can achieve the same results. For mocking with finer control, consider using [mockery](https://github.com/r-lib/mockery).

---

Refactor toward a testable architecture.

Start by enabling automated acceptance tests: introduce decoupling, configuration via files or environment variables instead of hard-coded values, and clear, replaceable interfaces for dependencies. Only once you have a test-friendly foundation can you systematically introduce automated tests across the codebase.

Isolate yourself from external dependencies, and you’ll find that automated testing becomes not just feasible, but a natural part of your development process.
