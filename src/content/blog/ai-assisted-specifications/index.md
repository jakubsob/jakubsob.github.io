---
title: 'How to Write Cucumber Specifications the Right Way: From App Description to Scenarios'
description: 'Adding Cucumber specifications to an existing application? Learn how to write Gherkin scenarios that focus on user behavior, not implementation details. Use AI to iterate faster.'
pubDate: Jul 30 2025
tags: [tests, r, bdd, cucumber, llm, shiny]
---

When writing specifications, it’s easy to get caught up in implementation details, especially when adding specifications after the software was built.

Let's see how we can add specifications for existing code and get Cucumber specifications that reflect business concepts rather than UI specifics that makes extension and maintenance easier.

## The Setup

Let's imagine an app with a workflow as follows:

- The app opens on a "Data" page, with a stepper for: Upload → Filtering → Mapping → Preview.
- Users upload or select a default dataset, then proceed step by step.
- After submitting variable mappings, a data preview appears.
- Once this is complete, a "Visualization" feature becomes available for viewing plots.

This workflow is quite straightforward, but also quite complex.

Writing robust, executable specifications for it demands that we express its logic without exposing underlying UI details.

## 1. Define Behavior, Not Implementation

Shift away from UI or implementation-specific language. For example:

- **Avoid:** `Given the user starts on the Data page`
- **Prefer:** `Given the user begins a new data preparation session`

This abstraction ensures scenarios remain stable regardless of changes to the UI or technology stack. The scenario should apply equally well whether the system is a web app, command-line interface, or something else entirely.

## 2. Capture the Flow in Gherkin

Break the user flow down into **core business steps**:

- Start a new data preparation session
- Provide a dataset (custom or default)
- Optionally apply filters
- Submit variable mappings
- View a data preview
- Gain access to visualization
- View a plot

Draft scenarios using the **Given–When–Then** cadence to focus on outcomes and user intentions rather than specific technical steps. This cadence is fundamental BDD best practice, improving clarity and maintainability.

### Example

```gherkin
Feature: Data visualization

  This feature describes the core user flow for preparing a dataset
  and accessing visualizations. The workflow includes optional and
  required steps before plots can be viewed.

  Background:
    Given the user begins a new data preparation session

  Scenario: User completes the workflow using a custom dataset
    Given the user provides a dataset
    When the user proceeds to the Filtering step
    And the user skips filtering
    And the user proceeds to the Mapping step
    And the user accepts the default variable mapping
    When the user submits the mapping
    Then the user reaches the Preview step
    And the dataset is available for inspection
    And the Visualization feature becomes available

  Scenario: User completes the workflow using a default dataset
    Given the user chooses to use a default dataset
    When the user proceeds through the Filtering step without applying filters
    And the user accepts the default variable mapping
    And the user submits the mapping
    Then the user reaches the Preview step
    And the dataset is available for inspection
    And the Visualization feature becomes available

  Scenario: Visualization is not available before data preparation
    Given the Visualization feature is not accessible
    When the user provides a dataset
    And the user skips filtering
    And the user accepts the default variable mapping
    And the user submits the mapping
    Then the Visualization feature becomes accessible

  Scenario: User views a plot after completing data preparation
    Given the user has completed the data preparation workflow
    When the user accesses the Visualization section
    And the user chooses to inspect Individual Plots
    Then the user sees a visualization of the dataset
```

## 3. Review Your Specifications

- **Avoid technical or UI phrasing:** Write steps as business actions, *not* clicks or UI navigation. For instance, use “submit the mapping” instead of “click Submit.”
- **Use correct scenario structure:** Always adhere to the **Given–When–Then** cadence for clarity and consistency. Don't mix up the order. To keep the scenarios readable, you can use alternative [steps phrasings like "And" or "But"](https://jakubsobolewski.com/cucumber/articles/reference-gherkin.html#steps).
- **Favor reusable, high-level steps:** Steps like `the user provides a dataset` or `the user submits the mapping` are platform-agnostic and extensible. This makes feature files easier to read, update, and automate.

## Iterate with AI

Use this prompt to make AI assist you in writing Gherkin scenarios:

```md
I'm adding Cucumber tests to an app. You're a BDD expert helping me discover business concepts and user flows.

I will provide a description of how I interact with the app. Your task is to help me write executable specifications for given description. When writing specifications:

- Don't reveal implementation details (like UI elements).
- Imagine at least 3 different ways this system could be implemented, e.g. CLI, API, mind control. Those specifications need to be true no matter how the system is implemented.
- Always use the Given–When–Then cadence.

If something is not clear, ask me questions.
```

Starting with this prompt, you can follow the process:

1. Provide description of what you can do with the app.
2. AI will suggest Gherkin steps.
3. Review the steps, and ask AI to build scenarios.
4. Review the scenarios, and iterate as needed.

This can help you refine your specifications and ensure they accurately capture the desired user behavior.

---

**When working with AI, pay attention to not accidentally reveal confidential information. Write your app description carefully.**

---

Abstracting away from implementation details, especially if they already exist, is difficult.

But it is crucial for writing maintainable and extensible specifications. By focusing on user behavior and outcomes, you can create specifications that remain relevant even as the underlying technology evolves.

And with the help of AI, you get a fresh perspective on your application, which can lead to creating better specifications.
