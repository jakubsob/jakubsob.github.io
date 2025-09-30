---
title: 'The Cadence of Behavior-Driven Development'
description: 'Learn how to effectively implement Behavior-Driven Development (BDD) practices in your projects. Focus on delivering the most valuable scenarios first and avoid the pitfalls of over-specification.'
pubDate:  'September 30 2025'
tags: ["r", "tests", "bdd"]
---

Don't fall into the trap of writing scenarios until you run out of ideas.

This approach misses the fundamental economics of testing. Like any investment, BDD scenarios follow the law of diminishing returns. The first scenario should capture the bulk of user value. The second adds meaningful behavior. By the fifth, you're chasing edge cases that belong in unit tests.

Understanding this cadence transforms how you approach BDD. Instead of exhaustive scenario coverage, you focus on **iterative value delivery** where each scenario must justify its existence.

> [Level-up your testing game! Grab your copy of the R testing roadmap.](https://jakubsobolewski.com/get-roadmap/)

## Start With the Golden Scenario

Write the scenario that captures your system's core promise first.

For document management software, this means the approval workflow that brings immediate value to users. Everything else is secondary.

```gherkin
Feature: Document Approval Workflow
  As a document reviewer
  I want to review and approve documents
  So that I can ensure quality before publication

  Scenario: Document reviewer approves a document
    Given a document "Project Proposal" has been submitted for approval
    When I approve the document
    Then the document status should be "Approved"
```

This scenario embodies the **primary user journey**. It validates that documents can be submitted, reviewed, and approved. Get this first specification working, and you start delivering value immediately.

Notice how the scenario focuses on **behavior, not implementation**. We don't specify database tables, API endpoints, or UI elements. We describe what users experience.

## Add the Second Most Valuable Behavior

The second scenario should address the next essential user need.

In document approval, rejection is equally critical. Users need feedback when documents don't meet standards.

```gherkin
  Scenario: Document reviewer rejects a document with feedback
    Given a document "Project Proposal" has been submitted for approval
    When I reject the document
    And I enter the comment "Missing cost breakdown for Q3"
    Then the document status should be "Rejected"
    And the document should have the comment "Missing cost breakdown for Q3"
```

This scenario introduces **feedback mechanisms**. It ensures rejected documents don't disappear into a black hole but generate actionable communication.

Two scenarios now cover the **complete approval cycle**. You've captured 70-85% of user value with minimal investment.

### Reuse scenario steps

We start building a vocabulary of how to describe behavior of the system:

```gherkin
Given a document {string} has been submitted for approval
```

```gherkin
Then the document status should be {string}
```

Another parametrized step could be:

```gherkin
When I {word} the document
```

Every, even complex system can be described with a surprisingly small set of steps. If you don't get enough reuse, you are probably over-specifying the scenarios, possibly revealing implementation details. That's the hint to make them more abstract, but keep them precise.

Our set of scenarios should grow faster than the library of steps we need to implement to run them.

## The Law of Diminishing Returns

Beyond two or three scenarios, each addition provides less value while increasing maintenance and runtime cost.

After the third scenario, you're in **diminishing returns territory**. Each new scenario costs as much to run as the valuable ones, but contributes mere percentage points of additional coverage. Is it worth waiting extra few minutes in your CI pipeline for a scenario that tests a rare edge case?

Don't write scenarios for edge cases that should live in unit tests.

## Push Edge Cases Down to Unit Tests

Complex validation rules, error conditions, and boundary cases belong in fast unit tests.

Consider these potential BDD scenarios that should actually be unit tests:

- Documents with special characters in names
- Approval workflows with 5+ reviewers
- Network timeouts during submission
- File size limits and format validation
- Concurrent approval attempts

These scenarios test **implementation details** rather than user-visible behavior. They run slower, break more often, and provide minimal business insight.

Unit tests handle these cases better:

```r
test_that("document validation rejects oversized files", {
  # Arrange
  document <- create_document(size_mb = 50)

  # Act
  result <- validate_document(document)

  # Assert
  expect_false(result$is_valid)
  expect_equal(result$error, "File size exceeds 25MB limit")
})
```

Fast, focused, and maintainable.

## Focus on Iterative Value Delivery

This approach aligns perfectly with iterative design principles.

1. You start with the **minimum viable behavior** that provides user value. Ship it. Get feedback. Then add the next most valuable scenario.
2. Each iteration delivers working software that real users can evaluate. You avoid building comprehensive features that nobody wants.
3. BDD scenarios become your **value compass**. If a scenario doesn't represent behavior that users would miss if broken, it probably shouldn't exist.

## Implementation: Cucumber or Internal DSL

You can implement this cadence with [Cucumber](https://jakubsobolewski.com/cucumber/) or a custom Domain Specific Language (DSL).

Cucumber provides the standard Gherkin syntax and step definition mapping:

```r
library(cucumber)

given("a document {string} has been submitted for approval", function(name, context) {
  context$driver$submit_document(name)
})

when("I {word} the document", function(action, context) {
  context$driver$perform_action_on_document(action)
})

then("the document status should be {string}", function(expected_status, context) {
  actual_status <- context$driver$get_document_status()
  expect_equal(actual_status, expected_status)
})
```

Alternatively, build an **internal Domain Specific Language** that captures the same behavior:

```r
given_document_submitted <- function(name, driver) {
  driver$submit_document(name)
}

when_approving_document <- function(name, driver) {
  driver$perform_action_on_document("approve")
}

then_document_status_is <- function(expected_status, driver) {
  actual_status <- driver$get_document_status()
  expect_equal(actual_status, expected_status)
}

test_that("Document Approval Workflow", {
  driver <- new_driver()
  given_document_submitted("Project Proposal", driver)
  when_approving_document("Project Proposal", driver)
  then_document_status_is("Approved", driver)
})
```

Both approaches work. Choose based on team preferences and tooling constraints.

> [For more details on implementing the driver and internal DSL, check out how I did it in this tutorial.](https://github.com/jakubsob/shiny-acceptance-tdd/)

## Build Valuable Things First

This cadence helps you deliver value faster and more predictably.

Instead of spending weeks writing comprehensive scenario suites, you identify and implement the **highest-value behaviors first**. Users see progress immediately.

You avoid the trap of gaming test coverage. Every scenario earns its place by representing genuine user value.

Most importantly, you **focus on behavior rather than implementation**. This keeps your tests resilient to code changes while ensuring they validate what actually matters to users. If your system changes implementation details, those changes won't break your BDD scenarios as long as the behavior remains consistent.

This cadence isn't about writing fewer tests.

It's about **writing most valuable specifications first** and pushing complexity to the appropriate testing layer.
