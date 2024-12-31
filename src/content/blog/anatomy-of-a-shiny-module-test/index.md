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

## Example

We develop a module that takes a dataset as a parameter, and returns a subset of the data based on the selected variables in a dropdown.

```r
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species"))

      # Assert
      expect_equal(
        colnames(session$returned()),
        c("Sepal.Length", "Species")
      )
    })
  })
})
```

```r
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species"))

      # Assert
      expect_equal(
        colnames(session$returned()),
        c("Sepal.Length", "Species")
      )
    })
  })
})
```

We arrange parameters to pass to the module.

```r {source-line-numbers="6" code-line-numbers="6"}
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species"))

      # Assert
      expect_equal(
        colnames(session$returned()),
        c("Sepal.Length", "Species")
      )
    })
  })
})
```

Arguments are passed to the module as a list.

```r {source-line-numbers="6-15" code-line-numbers="6-15"}
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species"))

      # Assert
      expect_equal(
        colnames(session$returned()),
        c("Sepal.Length", "Species")
      )
    })
  })
})
```

Code within `testServer` has access to the session, inputs and outputs.

```r {source-line-numbers="7-8" code-line-numbers="7-8"}
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species"))

      # Assert
      expect_equal(
        colnames(session$returned()),
        c("Sepal.Length", "Species")
      )
    })
  })
})
```

We select 2 variables using an input that has `"select"` ID.

It will be accessed with `input$select`.

```r {source-line-numbers="10-14" code-line-numbers="10-14"}
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species"))

      # Assert
      expect_equal(
        colnames(session$returned()),
        c("Sepal.Length", "Species")
      )
    })
  })
})
```

The return value should be a column subset of the `data`.

```r {source-line-numbers="10-14" code-line-numbers="10-14"}
describe("server", {
  it("should subset the data with selected variables", {
    # Arrange
    args <- list(data = iris)

    shiny::testServer(server, args = args, {
      # Act
      session$setInputs(select = c("Sepal.Length", "Species"))

      # Assert
      expect_equal(
        colnames(session$returned()),
        c("Sepal.Length", "Species")
      )
    })
  })
})
```

We use `session$returned()` to get the value of the returned `reactive`.

To use `shiny::testServer` the module must be implemented with `shiny::moduleServer`.

```r {code-line-numbers=""}
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    # ...
  })
}
```

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

And this is the module that passes this test.

##

Writing tests first for Shiny modules helps to keep them:

- simple,
- focused,
- and doing exactly what they need to do.

##

Tests help define what should be the input to the module.

What it should do.

And what it should return.

##

Such modules are easier to reuse and easier to compose them to build the whole app.
