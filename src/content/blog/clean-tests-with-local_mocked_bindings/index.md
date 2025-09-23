---
title: 'Clean R Tests with `local_mocked_bindings` and Dependency Wrapping'
description: 'Learn how to write reliable R tests by wrapping external dependencies and using `testthat::local_mocked_bindings`. Make your tests fast, clean, and predictable.'
pubDate:  'September 23 2025'
tags: ["r", "tests"]
---

Testing functions that rely on external dependencies is hard.

Your tests become slow, fragile, and unreliable when they depend on external APIs, file systems, or services. Worse yet, some dependencies like `Sys.time()` return values that change constantly, making consistent testing nearly impossible.

The solution is simple: wrap external dependencies in your own functions and stub them with `testthat::local_mocked_bindings`.

## Why Wrap External Dependencies?

External dependencies make testing painful in three ways:

- First, they can be unpredictable. APIs go down. File systems change. Network requests timeout.
- Second, they can be uncontrollable. You can't force `Sys.time()` to return a specific value or make a random API response predictable.
- Third, they can be slow. Real database queries and HTTP requests add seconds to test suites that should run in milliseconds.

Wrapping dependencies solves all three problems at once.

## The Pattern: Wrap, Stub, Test

Here's how to build testable functions with external dependencies:

### Step 1: Wrap External Calls

Instead of calling `Sys.time()` directly, create a wrapper function:

```r
get_current_time <- function() {
  Sys.time()
}

calculate_elapsed_time <- function(start_time) {
  current <- get_current_time()
  difftime(current, start_time, units = "secs")
}
```

### Step 2: Test with Stubs

Use `local_mocked_bindings` to replace your wrapper with a predictable stub:

```r
test_that("calculate_elapsed_time returns time difference", {
  # Arrange
  local_mocked_bindings(
    get_current_time = function() as.POSIXct("2023-01-01 12:30:00")
  )
  start_time <- as.POSIXct("2023-01-01 12:00:00")

  # Act
  result <- calculate_elapsed_time(start_time)

  # Assert
  expect_equal(as.numeric(result), 1800) # 30 minutes = 1800 seconds
})
```

Look how clean that test is. No setup. No teardown. No flaky timing issues.

## Why `local_mocked_bindings` Encourages Good Design

For a long time I've only used [`mockery`](https://github.com/r-lib/mockery) for stubbing, but `local_mocked_bindings` starts to grow on me.

The key insight: you get the most out of `local_mocked_bindings` when you don't use the `.package` argument.

I bet this was intentional design of this interface: you get the cleanest test code, when not using extra arguments. Without `.package` you can only stub functions that are defined in the current namespace. This forces you to apply good design principles: wrap external dependencies in your own functions.

Try to stub `Sys.time` directly and you'll need:

```r
# Messy - requires .package argument
local_mocked_bindings(
  Sys.time = function() as.POSIXct("2023-01-01 12:30:00"),
  .package = "base"
)
```

But wrap it first:

```r
# Clean - no .package needed
local_mocked_bindings(
  get_current_time = function() as.POSIXct("2023-01-01 12:30:00")
)
```

The function teaches you better design (if you pay attention).

## Three Benefits of Wrapping

Wrapping external dependencies gives you three powerful capabilities:

- **Stubbing for Testing**: Replace unpredictable external calls with controlled test doubles using `local_mocked_bindings`.
- **Dependency Injection**: It opens doors for injecting different implementations for different environments. Maybe production uses `Sys.time()` but your staging environment reads from a mock time server. Then in tests we can use dependency injection of a fake, or still use a stub with `local_mocked_bindings`.
- **Easy Migration**: Change implementations without touching calling code. Today you read time from the system clock, tomorrow from a solar clock camera, next week from an atomic time API.

## The `Sys.time()` Problem

`Sys.time()` exemplifies why wrapping matters.

Unlike random numbers (controlled by `set.seed()`), time always changes. Every test run gets different values. You can't make time-dependent functions deterministic without replacing the time source.

Consider a function that calculates business hours:

```r
is_business_hour <- function() {
  current_hour <- hour(Sys.time())
  current_hour >= 9 && current_hour <= 17
}
```

How do you test this? You can't control when your tests run.

Wrap the time dependency:

```r
get_current_time <- function() {
  Sys.time()
}

is_business_hour <- function() {
  current_hour <- hour(get_current_time())
  current_hour >= 9 && current_hour <= 17
}
```

Now testing becomes trivial:

```r
test_that("is_business_hour returns TRUE during business hours", {
  # Arrange
  local_mocked_bindings(
    get_current_time = function() as.POSIXct("2023-01-01 14:00:00") # 2 PM
  )

  # Act
  result <- is_business_hour()

  # Act
  expect_true(result)
})

test_that("is_business_hour returns FALSE outside business hours", {
  # Arrange
  local_mocked_bindings(
    get_current_time = function() as.POSIXct("2023-01-01 22:00:00") # 10 PM
  )

  # Act
  result <- is_business_hour()

  # Assert
  expect_false(result)
})
```

Perfect control. Perfect reliability.

## Real-World Example

Here's how the pattern works with more complex dependencies:

```r
# Wrapper functions for external dependencies
get_system_info <- function() {
  Sys.info()
}

get_package_versions <- function(path) {
  if (!rlang::is_installed("yaml")) {
    stop("Packages \"yaml\" not installed", call. = FALSE)
  }
  if (!rlang::is_installed("here")) {
    stop("Package \"here\" not installed", call. = FALSE)
  }
  yaml::read_yaml(here::here(path, "renv.lock"))
}

get_test_results <- function(...) {
  testthat::test_local(..., stop_on_failure = FALSE)
}

# Function that uses wrapped dependencies
generate_system_report <- function(project_path = ".") {
  system_info <- get_system_info()
  packages <- get_package_versions(project_path)
  tests <- get_test_results(project_path)

  list(
    os = system_info[["sysname"]],
    r_version = system_info[["version"]],
    package_count = length(packages$Packages),
    test_status = all(tests$passed)
  )
}
```

Testing becomes straightforward:

```r
test_that("generate_system_report creates complete report", {
  # Arrange
  local_mocked_bindings(
    get_system_info = function() c(sysname = "Linux", version = "4.0.0"),
    get_package_versions = function(path) list(Packages = list(a = 1, b = 2)),
    get_test_results = function(...) data.frame(passed = c(TRUE, TRUE))
  )

  # Act
  report <- generate_system_report()

  # Assert
  expect_equal(report$os, "Linux")
  expect_equal(report$package_count, 2)
  expect_true(report$test_status)
})
```

Three external dependencies controlled with three simple stubs. No real file system access. No actual test execution. No system introspection.

## Interface Over Implementation

The wrapper pattern creates an interface between your code and external dependencies.

Interfaces are powerful because they separate "what" from "how". Your code knows what it needs (current time, system info, test results) but doesn't care how those needs are met.

In production, `get_current_time()` calls `Sys.time()`. In tests, it returns a fixed timestamp. In a specialized environment, it might read from a network time protocol server or even that solar clock camera.

Change the implementation without changing a single line of calling code.

## Clean Tests Win

Compare these two approaches:

**Without wrapping:**
```r
# Brittle, slow, unpredictable
test_that("time calculation works", {
  start <- Sys.time()
  Sys.sleep(0.1)
  result <- calculate_duration(start)
  expect_gt(result, 0.1) # Flaky assertion
})
```

**With wrapping:**
```r
# Reliable, fast, predictable
test_that("calculate_duration returns time difference between start and current time", {
  # Arrange
  local_mocked_bindings(
    get_current_time = function() as.POSIXct("2023-01-01 12:30:00")
  )
  start <- as.POSIXct("2023-01-01 12:00:00")

  # Act
  result <- calculate_duration(start)

  # Assert
  expect_equal(result, 1800)
})
```

The second test runs in microseconds, never fails randomly, and expresses intent clearly.

## Start Wrapping Today

Next time you write a function that touches the outside world, wrap the external call. Your future testing self will thank you.

The pattern is simple: wrap external dependencies, stub in tests, enjoy clean and reliable test suites that run fast and pass consistently.
