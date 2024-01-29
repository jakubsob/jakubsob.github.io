---
title: How TDD Helps You Prototype Faster By Allowing You To Experiment With Your Code.
description: ''
pubDate: 'Oct 29 2023'
---

Writing tests may be seen as a thing that slows you down because it makes you write more code.

Not if you start development by writing tests. Those tests help you find a better solution sooner. You save time on rewriting production code in case it turns out to be not flexible enough. Tests written first are also more robust because they prevent you from testing implementation
details, which don't exist yet! You save time on rewriting brittle tests.

Let's imagine we need to write code that validates a `data.frame` against some rules.

```r
describe("validate", {
  it("should return TRUE if data passes validation", {

  })
})
```

We need data and validation rules. We don't need to know how to represent validation rules yet. It may be just a `ValidationRules` object. We can come back to it later.

```r
describe("validate", {
  it("should return TRUE if data passes validation", {
    # Arrange
    data <- data.frame(x = 1, y = "a")
    validation_rules <- structure(
      list(),
      class = "ValidationRules"
    )
  })
})
```

What matters is that we know we need a representation for those rules. We obtain a **separation of concerns**, rules are **decoupled** from this validator.

```r
describe("validate", {
  it("should return TRUE if data passes validation", {
    # Arrange
    data <- data.frame(x = 1, y = "a")
    validation_rules <- structure(
      list(),
      class = "ValidationRules"
    )
  })
})
```

We might want to represent the validator with `R6` class object. Let's initialize it with data and validation rules.

```r
describe("validate", {
  it("should return TRUE if data passes validation", {
    # Arrange
    data <- data.frame(x = 1, y = "a")
    validation_rules <- structure(
      list(),
      class = "ValidationRules"
    )
    validator <- data_validator$new(data, validation_rules)
  })
})
```

It may have a `validate` method that returns a flag indicating if the data passes validation.

```r
describe("validate", {
  it("should return TRUE if data passes validation", {
    # Arrange
    data <- data.frame(x = 1, y = "a")
    validation_rules <- structure(
      list(),
      class = "ValidationRules"
    )
    validator <- data_validator$new(data, validation_rules)

    # Act
    result <- validator$validate()

    # Assert
    expect_true(result)
  })
})
```

We can already see that this may be not flexible enough. We construct the object with data and validation rules.

```r
describe("validate", {
  it("should return TRUE if data passes validation", {
    # Arrange
    data <- data.frame(x = 1, y = "a")
    validation_rules <- structure(
      list(),
      class = "ValidationRules"
    )
    validator <- data_validator$new(data, validation_rules)

    # Act
    result <- validator$validate()

    # Assert
    expect_true(result)
  })
})
```

Let's go back to validation rules. We might experiment with them being a list of `checkmate` assertions.

```r
describe("validate", {
  it("should return TRUE if data passes validation", {
    # Arrange
    data <- data.frame(x = 1, y = "a")
    validation_rules <- structure(
      list(
        \(x) checkmate::test_data_frame(x),
        \(x) checkmate::test_subset(c("x", "y"), colnames(x))
      ),
      class = "ValidationRules"
    )
    validator <- data_validator$new(validation_rules)

    # Act
    result <- validator$validate(data)

    # Assert
    expect_true(result)
  })
})
```

Or an object that provides a `{pointblank}` agent.

```r
describe("validate", {
  it("should return TRUE if data passes validation", {
    # Arrange
    data <- data.frame(x = 1, y = "a")
    validation_rules <- structure(
      list(get = function() {
        pointblank::create_agent(tbl = ~ x) |>
          pointblank::col_exists(columns = c("x", "y"))
      }),
      class = "ValidationRules"
    )
    validator <- data_validator$new(validation_rules)

    # Act
    result <- validator$validate(data)

    # Assert
    expect_true(result)
  })
})
```

If we take the time to write tests first we can quickly iterate different ideas and arrive at a better solution faster.

- We'll probably end up with code that is easy to use.
- One that has better separation of concerns.
- One that promotes dependency injection.

Start development from tests and save time on rewrites and refactors.
Writing tests first pays off very quickly.
