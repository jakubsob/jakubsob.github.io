---
title: Acceptance Test-Driven Development of Shiny Modules
description: ''
pubDate: Dec 12 2023
tags: ["tests"]
---

Tests can be a slow you down or increase your confidence and speed up your development. It all depends on the way you write them. We should aim to have tests that are independent from implementation detail.

### Write test cases that describe business requirements.

We want to develop a feature that allows users to select a dataset and preview its summary. This can be a part of an existing page, a new page, or a whole new app. The approach is the same.

We can write the following test case to get started.

```r
library(testthat)

test_that(
  "Scenario: A user can preview a summary of the selected dataset.

  Given: User is at the summary section.

  When: User selects the 'iris' dataset.

  Then: User can see a summary of the 'iris' dataset.", {
  app <- DatasetSummary$new()

  app$select("iris")

  app$expect_summary()
})
```

We write the business requirements in a way that is abstract and doesn't tie the test to any UI elements.
All we need to know is that:
- There is a section in the app (`DatasetSummary`).
- We can select a dataset (`DatasetSummary$select`).
- We can see a summary of the selected dataset (`DatasetSummary$expect_summary`).

This test fails because we haven't implemented the `DatasetSummary` class yet.

### Use {R6} to implement the object tests are interacting with.

We can start from implementing the skeleton of the class and then fill in the gaps.

```r
library(R6)

DatasetSummary <- R6Class(
  classname = "DatasetSummary",
  private = list(
    driver = NULL
  ),
  public = list(
    initialize = function() {

    },
    select = function(name) {

    },
    expect_summary = function() {

    }
  )
)

```

We also don't have the app or a Shiny module yet.

The whole process is as follows:

1. Use `shinytest2::AppDriver` or `shiny::testServer` to implement the internals of `R6` class, make sure tests fail 🔴.

2. Implement unit tests of lower-level functions with TDD (🔴 → 🟢 → ♻️), build the code up until you can glue all pieces together to make Acceptance Tests pass 🟢.

3. If implementation detail changes, change the code, fix unit-tests, fix `R6` class implementation.

4. Don’t change Acceptance Tests until business requirements change.
