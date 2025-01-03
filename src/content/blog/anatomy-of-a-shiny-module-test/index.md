---
title: Comprehensive Guide to Testing Shiny Modules with shiny::testServer
description: 'Learn how to effectively test Shiny modules using shiny::testServer with examples and best practices.'
pubDate: 'Oct 31 2023'
tags: ["r", "tests", "shiny"]
---

Modules tested with `testServer` run with a session that is a `MockShinySession` object.

For most cases we only need:

- `MockShinySession$setInputs()` method which simulates users interactions with widgets.
- `MockShinySession$returned` which contains the value returned by the module.

Let's take a look an example.

We develop a module that takes a dataset as a parameter, and returns a subset of the data based on the selected variables in a dropdown.

```r
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange

    # Act

    # Assert
  })
})
```

We arrange parameters to pass to the module.

```r
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris) # [!code ++]

    # Act

    # Assert
  })
})
```

Arguments are passed to the module as a list.

```r
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, { # [!code ++]
    # Act # [!code --]
      # Act # [!code ++]

    # Assert # [!code --]
      # Assert # [!code ++]
    }) # [!code ++]
  })
})
```

Code within `testServer` has access to the session, inputs and outputs. We select 2 variables using an input that has `"select"` ID. We assume that we will implement an input with this ID.

```r
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species")) # [!code ++]

      # Assert
    })
  })
})
```

The return value should be a column subset of the `data`. We use `session$returned()` to get the value of the returned `reactive`.

```r {source-line-numbers="10-14" code-line-numbers="10-14"}
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species"))

      # Assert
      expect_equal( # [!code ++]
        colnames(session$returned()), # [!code ++]
        c("Sepal.Length", "Species") # [!code ++]
      ) # [!code ++]
    })
  })
})
```

To use `shiny::testServer` the module must be implemented with `shiny::moduleServer`.

```r {code-line-numbers=""}
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    # ...
  })
}
```

And this is a module that passes this test.

```r {code-line-numbers=""}
ui <- function(id) {
  ns <- NS(id)
  fluidPage(
    selectInput(ns("select"), "Select variables", choices = NULL, multiple = TRUE),
  )
}

server <- function(id, data) {
  moduleServer(id, function(input, output, session) {
    updateSelectInput(session, "select", choices = colnames(data))
    return(reactive(data[, input$select]))
  })
}
```

Notice how we don't check the UI in this test. Using this test we don't know if the module updated the input correctly.

**Use `shiny::testServer` to test low level behaviors of the module.**

Use it to test contracts:
- if it returns the correct value,
- or if it runs a side effect.

This might be especially useful if this is a "low-level" module that is used in many places in the app.

**Use `{shinytest2}` to test both parts of a Shiny module.**

Using `{shinytest2}` can be better to test user behaviors by simulating real interactions with the app.

---

Writing tests first for Shiny modules helps to keep them:

- simple,
- focused,
- and doing exactly what they need to do.

Tests help define what should be the input to the module:
- what it should do,
- and what it should return.

Such modules are easier to reuse and easier to compose them to build the whole app.
