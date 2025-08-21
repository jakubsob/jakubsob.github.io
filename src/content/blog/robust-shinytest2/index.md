---
title: 'How to Write Robust shinytest2 Tests for R Shiny Apps'
description: 'A step-by-step guide to stronger R Shiny testing with stable selectors and reusable actions.'
pubDate: 'Aug 18 2025'
tags: ["r", "tests", "shiny", "shinytest2"]
---

Most shinytest2 tests break too easily.

They expose fragile details of your app that break your tests as your implementation changes. It's either by doing snapshots or by using raw input IDs. But you can take back control: make tests describe *behavior*, not wiring.

## The problem with raw shinytest2

shinytest2 is great.

It really democratizes testing for Shiny apps. It's easy to install. It's easy to get your Shiny tests up and running.

But unfortunately it couples your tests tightly with internals of Shiny and entices you to use fragile snapshots. A default, very minimal `shinytest2` test will looks like this (and this probably as simple as you can get):

```r
test_that("...", {
  driver <- shinytest2::AppDriver$new()
  driver$click("setup-data-next")
  driver$click("setup-data-next")
  driver$click("setup-data-next")
  driver$click("setup-data-next")
  driver$set_inputs("plots-colorby" = "AGE")
  # Verify outcome
})
```

It works, but it leaks app internals. Input IDs change when you refactor, redesign, or just evolve your app. Setting inputs through raw IDs ties your tests to the “how,” not the “what.”

Your test can fail not because behavior changed, but because your selectors did.

## Step 1. Use `data-testid` instead of input IDs

[htmltools::tagApendAttributes](https://rstudio.github.io/htmltools/reference/tagAppendAttributes.html) allows you to decorate widgets with attributes. One of the best gifts you can give your tests: add `data-testid` (or use a different attribute name, but use it for testing only).

- `id` of an input or output changes when your Shiny code evolves.
- `data-testid` changes only when *business meaning* changes.

This keeps tests aligned with logic, not code structure.

### Refactor your components to attach `data-testid`

```r
picker_input <- function(inputId, ..., testid) {
  shinyWidgets::pickerInput(
    inputId,
    ...
  ) |>
    htmltools::tagAppendAttributes(
      `data-testid` = testid,
      .cssSelector = "select"
    )
}
```

Ensure you attach `data-testid` to the HTML tag with input ID. In case of `shinyWidgets::pickerInput` it's the `select` tag. Then in the app code, replace `pickerInput(...)` with for example `picker_input(..., testid = "plot_color_variable")`.

It's a very safe refactoring, don't worry.

Then instead of using input IDs in test code we can use `data-testid` to get the input ID:

```r
driver <- shinytest2::AppDriver$new()
id <- driver$get_js(
  sprintf("$('[data-testid=%s]').attr('id')", testable_id)
)
driver$set_inputs(!!!rlang::list2(!!id := "AGE"))
```

Now it looks quite complex, but it'll get better.

### Use `data-testtype` for smarter dispatch

Another simple refactoring that will make our testing lives easier is adding `data-testtype`.

Why do this?

- `data-testid` tells us which is the component we want to interact with,
- `data-testtype` tells us how to interact with the component.

Let's create a unique `data-testtype` for each component in our library:

```r
picker_input <- function(inputId, ..., testid) {
  shinyWidgets::pickerInput(
    inputId,
    ...
  ) |>
    htmltools::tagAppendAttributes(
      `data-testid` = testid,
      `data-testtype` = "picker_input",
      .cssSelector = "select"
    )
}
```

The easiest choice is to just use the name of component we're using. It will be easy to correlate with from the test code.

## Step 3. Refactor test code

Now instead of using `AppDriver` directly, we extend it with our own driver class that uses `data-testid` and `data-testtype` to localize components.

```r
action <- function(type, id, ..., driver) {
  switch(type,
    action_button = driver$click(id),
    picker_input = driver$set_inputs(
      !!!rlang::list2(!!id := rlang::list2(...)[[1]])
    )
  )
}

ShinyDriver <- R6::R6Class(
  inherit = shinytest2::AppDriver,
  public = list(
    dispatch = function(testable_id = missing_arg(), ...) {
      id <- self$get_js(
        sprintf("$('[data-testid=%s]').attr('id')", testable_id)
      )
      type <- self$get_js(
        sprintf("$('[data-testid=%s]').attr('data-testtype')", testable_id)
      )
      action(type, id, ..., driver = self)
    }
  )
)
```

Then our test becomes:

```r
test_that("...", {
  # Given
  driver <- ShinyDriver$new()
  driver$dispatch("next")
  driver$dispatch("next")
  driver$dispatch("next")
  driver$dispatch("next")

  # When
  driver$dispatch("plot_color_variable", c("AGE"))

  # Then
  # Verify the outcome

  # Teardown
  driver$stop()
})
```

## Step 4. Wrap reusable actions in step-functions

Tests are for humans to read first, machines second. Wrapping common interactions in functions gives your test language:

```r
i_use_default_mapping <- function(driver) {
  driver$dispatch("next")
  driver$dispatch("next")
  driver$dispatch("next")
  driver$dispatch("next")
}

i_set <- function(what, to, driver) {
  driver$dispatch(what, to)
}
```

Now your test looks like this:

```r
test_that("...", {
  # Given
  driver <- ShinyDriver$new()
  i_use_default_mapping(driver)

  # When
  i_set("plot_color_variable", to = "AGE", driver)

  # Then
  # Verify the outcome

  # Teardown
  driver$stop()
})
```

You read it as: *Given I use the default mapping, when I set the plot color variable to AGE, then I should see the plot.*

That’s **executable specification.**

## Step 5. Use [Cucumber](https://jakubsobolewski.com/cucumber/) (Optional)

From there you can see that we almost obtained [Cucumber](https://jakubsobolewski.com/cucumber/) syntax with code.

To facilitate collaboration between developers and non-developers, you can use Cucumber to write your tests in an even more natural language format. This allows stakeholders to understand and contribute to the testing process more easily.

Then this test case would become:

```gherkin
Given I use default mapping
When I set "plot_color_variable" to "AGE"
# Then verify the outcome
```

---

With this approach we organize our test code towards:

- **Readability**: Tests are easier to read and understand.
- **Reusability**: Common actions are encapsulated in functions.
- **Maintainability**: Changes in the app's UI require minimal (**or no!**) changes in tests.

This approach preserves business meaning of tests, enables tests to evolve alongside your codebase, allowing you to keep your development speed high.

---

**Don’t let your tests chase implementation details.**

Equip them with stable hooks, let the driver dispatch actions smartly, and express behavior with reusable steps. With these four steps, your `shinytest2` suite speaks the same language as your users: actions, not wiring, and makes tests maintenance easier.
