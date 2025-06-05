---
title: 'X Testing Antipatterns'
description: ''
pubDate:  'Oct 24 2024'
draft: true
tags: ["r", "tests", "tdd"]
---



## Vague test titles

```r
test_that("to_upper works correctly", {
  # Arrange
  data <- data.frame(
    a = c("a", "a", "a", "b", "b", "b"),
    b = c("x", "y", "z", "x", "y", "z"),
    c = c("a", "B", "C", "A", "B", "C")
  )

  # Act
  result <- to_upper(data, "c")

  # Assert
  expect_equal(
    result,
    data.frame(
      a = c("a", "a", "a", "b", "b", "b"),
      b = c("x", "y", "z", "x", "Y", "z"),
      c = c("a", "B", "C", "A", "B", "C")
    )
  )
})
```

## Too many assertions in one test

We might think that asserting on more properties of the result can give us more confidence in the correctness of the code. However, it can make the test harder to understand and maintain.

```r
test_that("my_plot creates a plotly object", {
  data <- data.frame(
    x = c(1, 2, 3, 1, 2, 3),
    y = c("a", "a", "a", "b", "b", "b")
  )
  result <- my_plot(data)
  expect_s3_class(result, "plotly")
  expect_equal(result$x$attrs[[1]]$x, ~x)
  expect_equal(result$x$attrs[[1]]$y, ~y)
  expect_equal(result$x$attrs[[1]]$type, "bar")
  expect_equal(result$x$attrs[[1]]$alpha_stroke, 1)
  expect_equal(result$x$layout$width, 800)
  expect_equal(result$x$layout$height, 600)
})
```

Moreover, if the test fails, it will be harder to understand which part of the code is broken.

This pattern also increases the risk of leaking the implementation details into the test.

## Tests revealing implementation details

```r
test_that("my_plot creates a plotly object", {
  # Arrange
  data <- data.frame(
    x = c(1, 2, 3, 1, 2, 3),
    y = c("a", "a", "a", "b", "b", "b")
  )

  # Act
  result <- my_plot(data)

  # Assert
  expect_s3_class(result, "plotly")
  expect_equal(result$x$attrs[[1]]$x, ~x)
  expect_equal(result$x$attrs[[1]]$y, ~y)
  expect_equal(result$x$attrs[[1]]$type, "bar")
})
```

## Multiple calls of the tested code in one test

```r
test_that("my_plot creates a plotly object", {
  data <- data.frame(
    x = c(1, 2, 3, 1, 2, 3),
    y = c("a", "a", "a", "b", "b", "b")
  )
  result <- my_plot(data)
  expect_s3_class(result, "plotly")
  expect_equal(result$x$attrs[[1]]$x, ~x)
  expect_equal(result$x$attrs[[1]]$y, ~y)
  expect_equal(result$x$attrs[[1]]$type, "bar")
  result <- my_plot(data, FALSE)
  expect_s3_class(result, "plotly")
  expect_equal(result$x$attrs[[1]]$x, ~x)
  expect_equal(result$x$attrs[[1]]$y, ~y)
  expect_equal(result$x$attrs[[1]]$type, "boxplot")
})
```

## Testing too many combinations of inputs

```r
test_that("my_function works on 0 row of data", {
  # ...
})

test_that("my_function works on 1 row of data", {
  # ...
})

test_that("my_function works on 2 rows of data", {
  # ...
})

test_that("my_function works on 3 rows of data", {
  # ...
})

test_that("my_function works on 100 rows of data", {
  # ...
})
```
