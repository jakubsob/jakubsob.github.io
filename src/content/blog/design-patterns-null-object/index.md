---
title: 'Simplify Your Conditional Expressions With Polymorphism'
description: "Don't check for NULLs, use Null Object pattern instead."
pubDate:  'Feb 28 2025'
tags: ["r", "tests"]
---

Conditional logic might make the code more difficult to understand than it should be.

One of the common conditional expressions one must include in the code is checking for NULLs. NULLs often represent the absence of a value, they can be passed to our code when something unexpected happens, so we must prepare for them.

But what if we use another object to represent the unexpected or the default?

# Let's consider an algorithm with optional steps

Using conditionals for optional steps of an algorythm might be acceptable when there are only a few of them.

```r
preprocess_data <- function(data, scaler = NULL, imputer = NULL) {
  if (!is.null(scaler)) {
    data <- scaler(data)
  }
  if (!is.null(imputer)) {
    data <- imputer(data)
  }
  data
}

preprocess_data(data = my_data, scaler = scaler, imputer = NULL)
```

As the number of options grow, the conditional logic might become difficult to understand. This is our cue to refactor the code.

# Let's refactor using polymorphism

```r
Preprocessor <- R6::R6Class("Preprocessor",
  public = list(
    transform = function(data) {
      stop("Not implemented")
    }
  )
)

StandardScaler <- R6::R6Class(
  "StandardScaler",
  inherit = Preprocessor,
  public = list(
    transform = function(data) {
      scale(data)
    }
  )
)

MeanImputer <- R6::R6Class(
  "MeanImputer",
  inherit = Preprocessor,
  public = list(
    transform = function(data) {
      apply(data, 2, function(x) {
        x[is.na(x)] <- mean(x, na.rm = TRUE)
        return(x)
      })
    }
  )
)

NullPreprocessor <- R6::R6Class(
  "NullPreprocessor",
  inherit = Preprocessor,
  public = list(
    transform = function(data) {
      data
    }
  )
)

preprocess_data <- function(data, transform = list(StandardScaler$new(), MeanImputer$new())) {
  purrr::reduce(transform, .init = data, function(data, transformer) {
    transformer$transform(data)
  })
}
```

This technique represents the *Tell-Don't-Ask* principle. Instead of checking the object and then deciding what to do, we just tell the object what it needs to do, and the object knows how to do it.

This way we also leave doors open for new implementations (*Open/Closed Principle*). All we need to do is to add a new implementation of the `Preprocessor` class and use it in the `preprocess_data` function. No need to change the add conditional logic to the function.
