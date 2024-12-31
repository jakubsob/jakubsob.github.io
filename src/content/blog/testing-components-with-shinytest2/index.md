---
title: 'Effective Testing of Shiny Components with shinytest2'
description: 'Learn how to test Shiny components for correct markup and server communication using shinytest2.'
pubDate:  'May 23 2024'
tags: ["r", "tests"]
---

Components in Shiny not only need to be rendered with correct markup, but also need to successfully communicate with the server. This means that testing the markup only may be not enough to ensure they function correctly.

In the newest addition to [shiny.blueprint](https://appsilon.github.io/shiny.blueprint/), server update functions are added to some of its components. To test that they work correctly, we must:
- render the component with initial values,
- trigger the update,
- check the new value.

## How to run a component with Shiny server?

**One approach is to bunch up a few (or all) components in one Shiny app.** This could allow sharing one app between tests, saving on the time it takes to start up the app, but it would require additional coordination between tests.

Such choice was made for component tests in [shiny.fluent](https://appsilon.github.io/shiny.fluent/), the [test app](https://github.com/Appsilon/shiny.fluent/tree/main/inst/examples/e2e-test) is placed in `inst/` directory and a series of [Cypress tests](https://github.com/Appsilon/shiny.fluent/tree/main/js/cypress/e2e/e2e-test) are run on it. This approach works well, because Cypress quickly refreshes the app between each test case, ensuring clean state in each test case. `shinytest2` doesn't have this feature.

This approach is a bit tricky to maintain, as there are a lot of things rendered on the page.

**The other approach is to run a small Shiny app with only the tested component.**

## Running components in isolation

We can create an app factory that accepts components and their corresponding update functions as parameters.

```r
#' tests/testtthat/setup.R
#' @param component Function, returns the component to test
#' @param update Function, updates the component
serverUpdateApp <- function(
  component = \() { },
  update = \(session) { }
) {
  shinytest2::AppDriver$new(
    shiny::shinyApp(
      ui = shiny::fluidPage(
        shiny::actionButton("trigger", "Trigger"),
        component()
      ),
      server = function(input, output, session) {
        shiny::observeEvent(input$trigger, update(session))
      }
    )
  )
}

#' @param inputId The ID of the tested component
#' @param driver shinytest2::AppDriver of the test app
serverUpdateActions <- function(inputId, driver) {
  list(
    update = function() {
      driver$click("trigger")
    },
    getValue = function() {
      driver$get_value(input = inputId)
    }
  )
}
```

This simple app showcases the behavior we want to test. It will render the component and allow triggering the update. It's simple and it's enough to test this behavior.

We can create a different app, with different parametrization, for testing other behaviors.

## If testing consists of the same steps there is an opportunity to abstract test code.

We can provide a list of actions tests can take on this app – they hide implementation details of those interactions. Tests don’t need to know that a button is clicked to trigger the update, they only know that the update happens. They also don't need to know how the value is retrieved, only that it is and expect a value. This way we can change the implementation of those actions without changing the tests in the future.

This is how a test for a `Checkbox` component looks like:

```r
#' tests/testthat/test-Checkbox.R
describe("Checkbox", {
  it("should allow updating values from the server", {
    # Arrange
    driver <- serverUpdateApp(
      \() Checkbox.shinyInput("checkbox", value = FALSE),
      \(session) {
        updateCheckbox.shinyInput(
          session,
          inputId = "checkbox",
          value = TRUE
        )
      }
    )
    on.exit(driver$stop())
    actions <- serverUpdateActions("checkbox", driver)

    # Act
    actions$update()

    # Assert
    expect_true(actions$getValue())
  })
})
```

and for `NumericInput`:

```r
describe("NumericInput", {
  it("should allow updating values from the server", {
    # Arrange
    driver <- serverUpdateApp(
      \() {
        NumericInput.shinyInput(
          inputId = "numeric",
          value = 1,
          label = "Numeric"
        )
      },
      \(session) {
        updateNumericInput.shinyInput(
          session,
          inputId = "numeric",
          value = 2
        )
      }
    )
    on.exit(driver$stop())
    actions <- serverUpdateActions("numeric", driver)

    # Act
    actions$update()

    # Assert
    expect_equal(actions$getValue(), 2)
  })
})
```

Test code for both cases is similar, and it's good, as they test the same behavior.

## This approach provides:

- ✅ **Clarity**: it’s easy to see which behaviors are tested for each component.
- ✅ **Flexibility**: we can control how each component is tested in its own test file.
- ✅ **Reduced cognitive load**: tests that test the same behavior are implemented using the same approach.
- ❌ **Slower tests**: it takes a moment to spin up each test app. The time it takes to run all tests increases with each added test case.
- ✅ **No state sharing between tests**: each test runs in isolation, so there are no side effects.
- ⚠️ **More test code**: test code is split into more files and has more boilerplate. There is a fine line between too much test code and too much abstraction. I think in this case it's a good trade-off.

Check out the full scope of the changes [here](https://github.com/Appsilon/shiny.blueprint/pull/104/files#diff-6a4f3c75c8d32b37ec5f88889d89b5ec996616e0f30c7219baacc8f3bf4ad41b).
