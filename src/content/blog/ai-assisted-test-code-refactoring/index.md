---
title: 'Refactoring Cucumber and Playwright Acceptance Tests with GitHub Copilot'
description: 'Given a set of existing Cucumber and Playwright acceptance tests, I asked Copilot to refactor them according to best practices for step organization and anti-patterns.'
pubDate: Jul 29 2025
tags: [tests, r, bdd, cucumber, llm]
---

From my experience, LLMs are much better at writing JavaScript code than they are at writing R code at the moment.

I wanted to check how well Copilot does with refactoring existing Playwright and Cucumber test code.

## Refactoring existing test code

Before refactoring, I had a single step definition file that contained all step implementations:

- interactions with forms,
- navigation steps,
- output verifications,
- and hooks

mixed together.

Putting all step definitions in a single file when you're just starting writing tests is fine, but as more steps are added, it becomes unwieldy.

## Ask with documentation context

I prompted Copilot with the following instruction to refactor my step files according to the best practices outlined in the referenced articles about [step organization](https://cucumber.io/docs/gherkin/step-organization) and [anti-patterns](https://cucumber.io/docs/guides/anti-patterns) from the Cucumber documentation.

It suggests organizing step definitions by *domain concepts* to avoid duplication and support easier maintenance, and reuse across features. Let's see how Copilot handles this.

```**md**
I want to refactor my cucumber steps implementations to follow best practices.

Read those articles:
#fetch https://cucumber.io/docs/gherkin/step-organization
#fetch https://cucumber.io/docs/guides/anti-patterns
and apply what is suggested.

Before doing the changes, explain the plan.
```

The response was as follows:

```md
I'll help you refactor your cucumber steps implementation to align with industry standards. Let me first gather information from the articles you've shared so I can create a comprehensive plan. Based on the Cucumber documentation, here's my plan to refactor your steps implementation to align with industry standards:

## Refactoring Plan for Cucumber Steps

### 1. Reorganize Step Files by Domain Concept

Currently, all your step definitions are in a single `steps.step.mjs` file. While this works for smaller projects, as your project grows, it's better to organize steps by domain concept.

**Plan**:
- Create separate step files for different domains in your application
- Group related step definitions together based on functionality
- Potential files could include:
  - `navigation.steps.mjs` - For navigation steps
  - `form.steps.mjs` - For form interactions
  - `chat.steps.mjs` - For chat-related interactions
  - `configuration.steps.mjs` - For configuration-related steps
  - `file-operations.steps.mjs` - For file upload/download operations

### 2. Create Helper Methods for Reusable Code

The current implementation has several step definitions with similar code patterns. We should extract common functionality into helper methods.

**Plan**:
- Create a `helpers/` directory with utility functions
- Extract common patterns for:
  - File operations (upload/download)
  - Form interactions
  - Waiting for UI elements
  - JSON assertions and handling

### 3. Make Steps More Atomic and Reusable

Some of your steps are doing multiple things at once, which makes them less reusable.

**Plan**:
- Split conjunction steps to make them more atomic
- Make step definitions more generalized to increase reusability
- Parameterize steps to handle more variations without duplicating code

### 4. Improved World Context and State Management

Currently, you're using a global `state` object. A more structured approach would be beneficial.

**Plan**:
- Use Cucumber's World object for state management
- Create custom World extensions for different domains
- Implement proper scoping of state variables

### 5. Better Error Handling and Reporting

Enhance error handling to provide more meaningful feedback when tests fail.

**Plan**:
- Add better error messages and context when assertions fail
- Implement custom error handling where needed

## Implementation Steps

Let me start implementing these changes:

1. First, I'll create a directory structure for our step definitions
2. Create helper methods for common functionality
3. Refactor the existing steps to use the new structure
4. Apply proper state management patterns

Let me know if you'd like me to proceed with these changes or if you want to modify the plan before I begin implementation.
```

## Results

### Was it a good split of files?

Copilot indeed split the file into multiple ones. But is it any good?

It created the following files:

- `navigation.steps.mjs` - For navigation steps
- `form.steps.mjs` - For form interactions
- `chat.steps.mjs` - For chat-related interactions
- `configuration.steps.mjs` - For configuration-related steps
- `file-operations.steps.mjs` - For file upload/download operations

Is it a split by a *domain*? I'm not sure. It seems more like a split by *functionality*.

But in my case, it's still a good split, as it organizes the test code better than before. I can work with it and see if other domains emerge in the future. It definitely is not a tight coupling between features and step definitions, which is a step in the right direction.

### Improvement in helper methods

It created a `/helpers` directory with utility functions for:

- File operations (upload/download)
- Form interactions
- Waiting for UI elements
- JSON assertions and handling

It helped me avoid code duplication and made the step definitions cleaner. Copilot wasn't asked about it explicitly, but it was a good addition.

### Copilot taught me about Cucumber features I didn't know

As Copilot refactored the code, it introduced me to a Cucumber feature I wasn't aware of – the [World object](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md).

Turns out this is a more convenient approach to manage state in Cucumber tests. You don't need to implement your own state management logic. Instead, you can use the built-in World object to store and access state across steps.

**Copilot may know more about the library you're using than you do, so it's worth paying attention to its suggestions.**

## Conclusions

While the refactoring wasn't perfect, it was quite an improvement over the original code.

Telling an agent explicitly to follow practices in a given article can help prompt it to follow specific patterns that you want to see in the code. The biggest win was that I learned some new Cucumber features that I wasn't aware of before.

**I plan to test how well Copilot does in writing Playwright and Cucumber test code from scratch, maybe its good enough to quickly cover legacy Shiny apps with acceptance tests.**

> 🧪 **[Check this guide on testing legacy Shiny apps.](https://jakubsobolewski.com/blog/testing-legacy-shiny/)**
