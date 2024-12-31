---
title: 'How to Test Code with External Dependencies Using Stubs in R'
description: 'Learn how to test R functions with external dependencies using stubs and the testthat package.'
pubDate:  'Oct 17 2023'
tags: ["r", "tests"]
---

A stub is a controllable replacement of a dependency in your system.

Stubbing helps you test your code without directly interacting with a dependency, e.g., an API.

How to test `the_ultimate_question_of` function if `the_answer`:
- Requires a connection to an external service?
- Or it takes millions of years to compute?

```r
#' R/the_ultimate_question_of.R
the_ultimate_question_of <- function(
  x = c("Life", "Universe", "Everything")
) {
  x <- match.arg(x)
  the_answer(x)
}
```

Let's write our first test.

```r
#' tests/testthat/test-the_ultimate_question_of.R
test_that("the_ultimate_question_of returns 42", {
  # Arrange
  input <- "Everything"

  # Act
  result <- the_ultimate_question_of(input)

  # Assert
  expect_equal(result, ???)
})
```

We need to stub the `the_answer`.

We can use `testthat::local_mocked_bindings`.

```r
#' tests/testthat/test-the_ultimate_question_of.R
test_that("the_ultimate_question_of returns 42", {
  # Arrange
  local_mocked_bindings(the_answer = function(x) 42)
  input <- "Everything"

  # Act
  result <- the_ultimate_question_of(input)

  # Assert
  expect_equal(result, ???)
})
```

Then we can assert that the answer to `"Everything"` is `42`.

```r {source-line-numbers="13-14" code-line-numbers="13-14"}
#' tests/testthat/test-the_ultimate_question_of.R
test_that("the_ultimate_question_of returns 42", {
  # Arrange
  local_mocked_bindings(
    the_answer = function(x) 42
  )

  input <- "Everything"

  # Act
  result <- the_ultimate_question_of(input)

  # Assert
  expect_equal(result, 42)
})
```

Before `{testthat}` version 3.2.0, `mockery::stub` had to be used.

```r {source-line-numbers="3-8" code-line-numbers="3-8"}
#' tests/testthat/test-my_function.R
test_that("the_ultimate_question_of returns 42", {
  # Arrange
  mockery::stub(
    where = the_ultimate_question_of,
    what = "the_answer",
    how = 42
  )
  input <- "Everything"

  # Act
  result <- the_ultimate_question_of(input)

  # Assert
  expect_equal(result, 42)
})
```

So `testthat::local_mocked_bindings`:

- Allows you to stub functions without adding new dependencies.
- It works with packages only -- `{mockery}` doesn't have this constraint.
- Stubbed function must be declared in the environment.


`testthat::local_mocked_bindings` let's you quickly start with stubbing in your tests.

For more advanced use cases you still need to rely on `{mockery}`.
