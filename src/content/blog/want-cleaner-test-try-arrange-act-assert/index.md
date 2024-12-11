---
title: Want Cleaner Unit Tests? Try Arrange, Act, Assert comments.
description: '3 essential parts of a unit test.'
pubDate:  'Oct 12 2023'
tags: ["r", "tests"]
---

A unit test should check one behaviour of your code. It should do 3 things:

1. Setup test environment.
2. Call tested code.
3. Assert on results or side effects.

**Use Arrange, Act, Assert comments to separate those blocks.**

Why should you do that?

1. It provides a consistent way to communicate.
2. It allows you to see if your test case actually tests only one thing.
3. It helps to produce more meaningful tests output.
4. It’s cheap.

## How to refactor

We have a `factorial` function, it has a test with 5 assertions describing how it should work:

```r
library(testthat)

factorial <- function(n) {
  if (!is.numeric(n)) {
    stop("Input must be a numeric")
  }
  if (length(n) != 1) {
    stop("Input must be a single number")
  }
  if (n < 0) {
    stop("Input must be a non-negative integer")
  }
  if (n == 0) {
    return(1)
  }
  n * factorial(n - 1)
}

describe("factorial", {
  it("should work", {
    expect_equal(factorial(0), 1)
    expect_equal(factorial(5), 120)
    expect_error(factorial("a"), "Input must be a numeric")
    expect_error(factorial(c(1:10)), "Input must be a single number")
    expect_error(factorial(-1), "Input must be a non-negative integer")
  })
})
```

Let’s identify Arrange, Act and Assert blocks in this test:

```r
describe("factorial", {
  it("should work", {
    # Arrange
    input1 <- 0
    input2 <- 5
    input3 <- "a"
    input4 <- c(1:10)
    input5 <- -1

    # Act
    output1 <- factorial(input1)
    output2 <- factorial(input2)

    # Assert
    expect_equal(output1, 1)
    expect_equal(output2, 120)
    expect_error(factorial(input3), "Input must be a numeric")
    expect_error(factorial(input4), "Input must be a single number")
    expect_error(factorial(input5), "Input must be a non-negative integer")
  })
})
```

Once split into Arrange, Act, Assert, we can easily refactor this test into cases that contain only one set of those comments, **providing meaningful titles describing the expected behavior of the function:**

```r
describe("factorial", {
  it("should return 1 when input is 0", {
    # Arrange
    input <- 0

    # Act
    output <- factorial(input)

    # Assert
    expect_equal(output, 1)
  })

  it("should return 120 when input is 5", {
    # Arrange
    input <- 5

    # Act
    output <- factorial(input)

    # Assert
    expect_equal(output, 120)
  })

  it("should throw an error when input is not numeric", {
    # Arrange
    input <- "a"

    # Act & Assert
    expect_error(factorial(input), "Input must be a numeric")
  })

  it("should throw an error when input is a vector", {
    # Arrange
    input <- c(1:10)

    # Act & Assert
    expect_error(factorial(input), "Input must be a single number")
  })

  it("should throw an error when input is a negative number", {
    # Arrange
    input <- -1

    # Act & Assert
    expect_error(factorial(input), "Input must be a non-negative integer")
  })
})
```

It produces more lines of code, but remember, we **optimise the code for human readability, to make it easier to change in the future**.

Each test case describes only one expected behavior. Notice how **test titles resemble natural language** and how each test case has the same structure, allowing the reader to easily skim through the test and learn how the tested function works.

## Tests output before refactoring

Let’s change `factorial` function implementation to return `2` instead of `1` when input is `0` to make tests fail:

```r
if (n == 0) {
  return(2)
}
```

The initial version of tests will produce given output:

```r
-- Failure (Line 3): factorial: should work ------------------------------------
factorial(0) (`actual`) not equal to 1 (`expected`).

  `actual`: 2
`expected`: 1

-- Failure (Line 4): factorial: should work ------------------------------------
factorial(5) (`actual`) not equal to 120 (`expected`).

  `actual`: 240
`expected`: 120
```

It contains 5 assertions in a single test case and 2 of them failed, that’s why we see `factorial: should work` test title 2 times.

We can use assertions to identify which cases failed, but in more complex functions with more complex outputs it may not be so trivial

## Tests output after refactoring

For the refactored test case, we obtain an explicit message which behavior of the function is broken, allowing us to address the issue quickly.

```r
-- Failure (Line 38): factorial: should return 1 when input is 0 ---------------
`output` (`actual`) not equal to 1 (`expected`).

  `actual`: 2
`expected`: 1
```

We pay a lot of attention to production code style, why not extend this care to test code?

**Try using Arrange, Act, Assert next time you’ll write a unit test and see yourself how it changes your approach to testing!**
