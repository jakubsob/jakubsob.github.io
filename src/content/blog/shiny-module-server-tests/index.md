---
title: BDD Style Shiny Module Server Tests
description: ''
pubDate: Jan 30 2024
tags: ["r", "tests"]
---

Writing tests for Shiny modules can be difficult, especially when multiple actions need to be taken to bring the system to the desired state.

**Providing a simple [internal DSL](https://martinfowler.com/bliki/InternalDslStyle.html) to drive the tests helps with their readability and keeps focus on the business requirements.**

We can use a simple `R6` object that provides methods to interact with the module. This way we will obtain tests that describe the behavior of the module in almost natural language. We will also get a separation between what we are testing and how we are testing it.

In [acceptance test-driven development of Shiny modules](../acceptance_test_driven_development_of_shiny_modules) we've seen how we can use abstraction to create Business Driven tests. That approach leverages `shinytest2` to run the module as a standalone Shiny app. For simpler modules using `shinytest2` can be an overkill. It will also slow down the test suite.

From the test perspective it shouldn't matter what we use to drive tests of a module. If we can assert that a module works as expected from the server perspective alone, why not do that?

### Using `testServer` might be messy.

I'm not a fan of the interface of `testServer`. On one hand it's super easy to use and allows us to interact `session` however we like it. On the other hand these tests will end up exposing a lot of internal information about the server.

If we don't take extra steps to manage code within `testServer` and implementation of the module changes, we may end up refactoring a lot of test code. Let's take a look at an example from [the docs](https://shiny.posit.co/r/articles/improve/server-function-testing/):

```r
testServer(server, {
  expect_equal(output$txt, "1")

  rv$a <- 2

  # testServer has no innate knowledge of our `rv` variable;
  # therefore, it hasn't been updated
  expect_equal(output$txt, "1")

  # We'll need to manually force a flush of the reactives
  session$flushReact()

  expect_equal(output$txt, "2")
})
```

Does a test need to know when you need to flush reactives (or even do `Sys.sleep` as in another example)? Does a test need to know that ther is a `rv` object or that there is a `txt` output to correctly assert the behavior?

With this approach we'll end up with **tests that tell a lot about how we test, obscuring the image of what we are testing.**

### Commiting to `testServer` isn't future proof.

Using raw `testServer` we commit ourselves to a specific way of testing. If we find out in the future that it no longer provides all necessary tools, we might want to switch to  `shinytest2` for new tests or rewrite all tests to new driver.

Such test rewrites are risky as we may alter what tests are asserting. We should aim to write tests that are independent from such details.

### Wrap `testServer` in an R6 class to enable BDD style tests.

The interface we introduce represents business requirements that should be indifferent to module driver.

The imperative style of `testServer` makes it impossible to use in such objects. With a simple wrapper object we can introduce `add_step` function that adds an action to a queue of steps to be executed by the server and exposes something to be asserted on, here we use the return value of a module.

```r
library(shiny)
library(rlang)
library(R6)

ServerDriver <- R6Class(
  classname = "ServerDriver",
  private = list(
    args = NULL,
    steps = NULL,
    server = NULL,
    return_value = NULL
  ),
  public = list(
    initialize = function(server, args) {
      private$server <- server
      private$args <- args
      private$steps <- list()
    },
    #' It adds an expression to the queue of steps to be executed by the server.
    add_step = function(expr) {
      private$steps <- append(private$steps, enquo(expr))
    },
    #' It runs the server and executes all the steps in the queue.
    run = function() {
      testServer(private$server, args = private$args, {
        for (step in private$steps) {
          eval_bare(step)
        }
        private$return_value <- if (inherits(session$returned, "reactive")) {
          session$returned()
        } else {
          session$returned
        }
      })
    },
    #' It returns the value returned by the server.
    get_return_value = function() {
      private$return_value
    }
  )
)
```

With this object we can write tests in a BDD style. This could be an object that drives tests of a module that allows users to select a dataset and preview its summary.

```r
DatasetSummary <- R6Class(
  classname = "DatasetSummary",
  private = list(
    driver = NULL
  ),
  public = list(
    initialize = function(args = list()) {
      private$driver <- server_driver$new(
        module$server,
        args
      )
    },
    select = function(name) {
      private$driver$add_step(
        session$setInputs(name = name)
      )
      # flushReact is not needed here, but it's just to show that we could add it here
      # and it wouldn't be visible in the test
      private$driver$add_step(session$flushReact())
    },
    get_summary = function() {
      private$driver$run()
      private$driver$get_return_value()
    }
  )
)
```

The test doesn't know what runs the test. All it knows is how to interact with the module.

```r
test_that(
  "Scenario: A user can preview a summary of the selected dataset.

  Given: User is at the summary section.

  When: User selects the 'iris' dataset.

  Then: User can see a summary of the 'iris' dataset.", {
  # Given
  page <- DatasetSummary$new()

  # When
  page$select("iris")

  # Then
  expect_equal(page$get_summary(), ...)
})
```

We can now freely change the internals of the `DatasetSummary` class to use `shinytest2` or any other driver. We can refactor `DatasetSummary` to use different inputs and outputs and those changes won't affect test cases.

With this simple method, it is easier to keep what's important -- a description of how the system is supposed to behave.
