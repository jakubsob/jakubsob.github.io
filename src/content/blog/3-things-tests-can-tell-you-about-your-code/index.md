---
title: "How Tests Improve Code Quality: 3 Key Insights"
description: 'Discover how tests can reveal code modularity, coupling, and separation of concerns to improve your code quality.'
pubDate:  'Oct 24 2024'
tags: ["r", "tests"]
---

Testing is all about feedback, not only about catching bugs.

Tests are users of our code. They interact with our code in the same way as users do. They call functions, pass arguments, and expect results. They can tell us a lot about the design of our code.

But to improve it, we need to pay attention.

## Tests can tell us if our code is not modular.

Modularity is about how easy it is to use a piece of code in different contexts.

If we run code only in production we run it in one context. If we test it, we run it in another context. If we can't easily run code in tests, it's a sign that it will be difficult to use it in any other context.

If we need to:
- pass a ton of arguments,
- setup the global environment,
- write files to disk,
- or mock a lot.

It might be a sign that our code is not modular.

### ❌ A dependency on global variables

Let's consider a function that uses a global variable `TAX_RATE` to calculate the total price of items.

```r
calculate_total <- function(items) {
  total <- 0
  for (item in items) {
    total <- total + item$price
  }
  total + (total * TAX_RATE)
}

test_that("calculate_total returns a total price of items with tax", {
  # Arrange
  env <- new.env()
  env$TAX_RATE <- 0.1
  items <- list(
    list(price = 10),
    list(price = 20)
  )

  withr::with_environment(env, {
    # Act
    result <- calculate_total(items)
  })

  # Assert
  expect_equal(result, 33)
})
```

In order to test the function, we need to set up a global variable. This makes the test setup more complex and the test harder to understand. It also poses a risk of changing the global state and affecting other tests if we don't tear down the environment properly.

Let's consider the alternative.

### ✅ Dependency injection

Instead of relying on a global variable, we can pass the tax rate as an argument.

It makes the test code simpler and easier to understand, as we can explicitly see what the function needs.

```r
calculate_total <- function(items, tax_rate) {
  total <- 0
  for (item in items) {
    total <- total + item$price
  }
  total + (total * tax_rate)
}

test_that("calculate_total returns a total price of items with tax", {
  # Arrange
  tax_rate <- 0.1
  items <- list(
    list(price = 10),
    list(price = 20)
  )

  result <- calculate_total(items, tax_rate)

  # Assert
  expect_equal(result, 33)
})
```

Now it doesn't matter where the tax rate comes from. It can be a global variable, a configuration file, or a database. Testing promotes dependency injection, thus allows easier substitution of components and better flexibility in arranging pieces of code.

Aiming for simple tests helps make the code modular.

## Tests can tell us if our code is tightly coupled.

Coupling is about interdependence between different parts of the code.

If we need an extensive setup to run a test (or if it's nearly impossible to test it), it's a sign that our code is tightly coupled. Coupling can be easily spotted if we need to stub (substitute) parts of the tested code.

This is a dangerous situation, because then tests expose implementation details.

### ❌ Tight coupling

The `calculate_total` function uses a `get_tax_rate` function to calculate the total price of items. We don't know where the tax rate comes from, but we know that it's used in the calculation.

If the implementation of `get_tax_rate` uses an external dependency that is not available in tests (e.g., a database), we need to stub it.

```r
calculate_total <- function(items) {
  total <- 0
  for (item in items) {
    total <- total + item$price
  }
  total + (total * get_tax_rate())
}

test_that("calculate_total returns a total price of items with tax", {
  # Arrange
  mockery::stub(calculate_total, "get_tax_rate", 0.1)
  items <- list(
    list(price = 10),
    list(price = 20)
  )

  result <- calculate_total(items)

  # Assert
  expect_equal(result, 33)
})
```

A change as simple as renaming `get_tax_rate` will break the test. This is a sign that the test is coupled to the implementation details of the tested code. Now not only the implementation has tight coupling, but so has the test.

Let's consider the alternative.

### ✅ Dependency injection

If we pass the tax rate as an argument, we don't need to stub the `get_tax_rate` function. The code that gets the tax rate is decoupled from the code that calculates the total price.

```r
calculate_total <- function(items, tax_rate) {
  total <- 0
  for (item in items) {
    total <- total + item$price
  }
  total + (total * tax_rate)
}

test_that("calculate_total returns a total price of items with tax", {
  # Arrange
  tax_rate <- 0.1
  items <- list(
    list(price = 10),
    list(price = 20)
  )

  result <- calculate_total(items, tax_rate)

  # Assert
  expect_equal(result, 33)
})
```

## Tests can tell us if our code does too much.

Separation of concerns is about dividing a program into distinct sections, such that each section addresses a separate concern.

If we need to test too many things in one test, it's a sign that our code does too much.

The easiest way to spot it is to look for:
- number of assertions in a test,
- use of `and` in test titles,
- or a need to set up a lot of things to run a test.

### ❌ Doing too much at once

```r
calculate_total <- function(items, tax_rate, conn) {
  total <- 0
  for (item in items) {
    total <- total + item$price
  }
  total <- total + (total * tax_rate)
  insert_total_to_database(conn, total)
  total
}

test_that("calculate_total returns a total price of items with tax
  and inserts it to the database", {
  # Arrange
  conn <- DBI::dbConnect(RSQLite::SQLite(), ":memory:")
  tax_rate <- 0.1
  items <- list(
    list(price = 10),
    list(price = 20)
  )

  # Act
  result <- calculate_total(items, tax_rate, conn)

  # Assert
  expect_equal(result, 33)
  expect_equal(
    DBI::dbGetQuery(conn, "SELECT total FROM totals"),
    data.frame(total = 33)
  )
})
```

Instead of doing both behaviors at once, we could refactor the function so that one function calculates the total, the other inserts data into the database.

## Tests can help us improve the design of our code.

Paying attention to feedback from tests can tell us if our code is modular, if it's tightly coupled, or if it has poor separation of concerns.

While testing after writing the production code is useful, the feedback from tests can be even more valuable if we write tests first. This is the idea behind Test-Driven Development (TDD).

Read more here:

- [3 Steps Of Test-Driven Development That Help You Build Better Code Faster](../3-steps-of-tdd-that-help-you-build-better-code-faster/)
- [How Test-Driven Development Helps You Prototype Faster](../how_tdd_makes-you-faster)
- [How Test-Driven Development Helps You Get Things Right](../how-tdd-helps-you-build-the-right-thing/)
