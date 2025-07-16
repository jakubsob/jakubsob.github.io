---
title: 'Testing Legacy Shiny Apps: Start with Behavior, Not Code'
description: 'Adding acceptance tests first makes refactoring safer.'
pubDate:  '16 Jul 2025'
tags: ["r", "tests"]
---

Your legacy Shiny app needs a makeover, but you don't know where to start.

Jumping straight into refactoring is like repainting a room with the furniture still inside. It’s a recipe for disaster, creating bugs and breaking features you didn't even know existed. Many developers fall into the trap of trying to write unit tests for messy, monolithic code, only to find their tests are brittle and break with every small change.

There is a safer approach: **write acceptance tests first.**

## The Problem with Brittle Tests

When you write tests that are too closely tied to the current implementation of your app, you create a maintenance nightmare.

These tests know *too much* about the internal workings, like component IDs, or the specific structure of your UI. The moment a developer changes a component's ID, the tests shatter. This creates friction and slows down development, defeating the purpose of having tests in the first place.

The goal is to test *behavior*, not implementation.

## The Three-Step Process to Safe Refactoring

This behavior-focused approach can be broken down into three manageable steps.

### 1. Document Current Behavior

First, become an archeologist. Dig into the application's past by talking with previous maintainers and long-time users.

Don't assume you know everything. Your goal is to uncover the intended behavior. Ask questions like:
*   What is the primary goal of this feature?
*   What should happen when a user performs this action?
*   What data should this table display under these conditions?

Use the **Given-When-Then** syntax to format these behaviors as specifications. This creates a clear, unambiguous description of what the system does.

---

Let's imagine a simple Shiny app. It has a dropdown to select a product category and a button that generates a sales trend plot for that category.

Here’s how *not* to write a test specification for it:

### Bad Specification (Reveals Implementation)

```gherkin
Feature: Sales Plot Generation
  Scenario: User clicks the button to generate a plot
    Given the user is on the main page
    When they select "Electronics" from the "category_dropdown"
    And they click the button with ID "generate_plot_btn"
    Then the plot with CSS class ".sales-output-plot" should be visible
```

This test is extremely brittle. It will fail if you:
*   Rename the dropdown from `category_dropdown`.
*   Change the button ID from `generate_plot_btn`.
*   Alter the CSS class of the plot output.

Now, let's write a test that focuses purely on the user's goal.

### Good Specification (Focuses on Behavior)

```gherkin
Feature: View Sales Trends
  Scenario: User views the sales trend for a product category
    Given the user can view product sales information
    When they view the sales trend for "Electronics"
    Then they should see the sales trend plot for "Electronics"
```

This specification is clean, readable, and describes the business value. It doesn't care *how* the user selects the category or generates the plot. The implementation can change completely, from a button to an automatic update, and the test's intent remains valid.

Be abstract, but precise.


### 2. Create Executable Acceptance Tests

With the behavior documented, it's time to make it executable. This is where a tool like [`{cucumber}`](https://github.com/jakubsob/cucumber) package for R comes in.

Cucumber allows you to take those plain-language Gherkin specifications and link them to code that drives your application. You can implement the test steps using:
* `{shinytest2}`,
* Playwright,
* or Cypress

Your choice of tool depends on your team's expertise, [`{cucumber}`](https://github.com/jakubsob/cucumber) can execute steps written in R; if you use Playwright or Cypress, you write the steps in JavaScript and execute them with [JavaScript implementation of Cucumber](https://www.npmjs.com/package/@cucumber/cucumber).

To make these tests last, you need to use robust selectors that aren't tied to fragile attributes like CSS classes or generated IDs. For a deeper dive on this, read my post on creating [**robust test selectors**](https://jakubsobolewski.com/blog/robust-targetting-of-html-for-tests/) that survive UI refactoring.

### 3. Refactor and Unit Test with a Safety Net

Now you have a safety net.

Your suite of acceptance tests validates the core functionality of the application from a user's perspective. With this net in place, you can begin refactoring with confidence.

Break down large, complex server-side logic into smaller, pure functions. As you carve out these pieces, you can finally write targeted unit tests for them using a framework like `{testthat}`. The acceptance tests will immediately flag any regressions in user-facing behavior, while your new unit tests ensure the correctness of the individual components.

Don't jump too eagerly to this step. Make sure you have a solid set of acceptance tests first.

---

Your legacy Shiny app doesn't have to stay legacy forever. By starting with behavior, you build a foundation of safety that empowers you to modernize your codebase without fear.

Make tests your ally, not your enemy.
