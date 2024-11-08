---
title: Want To Get Even Faster Feedback From Your Unit Tests? Optimize Your Test Files Structure.
description: 'Leverage built-in testthat features.'
pubDate:  'Nov 8 2024'
tags: ["r", "tests", "tdd"]
---

When using tests as a mechanism of getting feedback on the code we write, it’s critical to get it as fast as possible.

How useful a test is if we need to wait a minute to see if the code we wrote works as expected after every change? Even if this feedback comes after only 10 seconds, if we multiply by the number of changes we make, it amounts to a lot of time lost waiting for tests to finish running. The time extends as we add more and more tests.

Optimising the code itself has its limits and is difficult, but we can optimise test structure itself to get the feedback faster.

## Leverage `testthat::test_file` to run a single test file.

Let’s imagine we have a file that contains multiple plot functions `R/plots.R`.



We can run it with `testthat::test_file("tests/testthat/plots.R")` to only run tests for our plotting functions. This should already yield significant speedup compared to running all tests with `testthat::test_dir("tests/testthat")` (or with `devtools::test()`).

But what if we have a lot of plotting functions and tests? Then running even a single file can take a while.

## Split test files into smaller ones.

To speed the process up, we can split the test suite into smaller chunks.

We can split our `tests/testthat/test-plots.R` into:

- `tests/testthat/test-plots-barchart.R`
- `tests/testthat/test-plots-boxplot.R`
- `tests/testthat/test-plots-scatter.R`

Then we can run tests only for a selected function with `testthat::test_file("tests/testthat/test-plots-barchart.R")`.

When we’re adding a new function or modify an existing one we often don’t need the feedback from the rest of the test files immediately. We can work on this function in isolation, until it meets all requirements and check integration with the rest of the codebase at a later stage.

## Run segments of tests.

If we organize our test files into smaller ones with consistent prefixes we can still run bigger parts of our testing suite in isolation.

Leveraging the `filter` argument we can run all plot function tests with `testthat::test_dir("tests/testthat", filter = "plots")`. It’ll run all files that contain `"plot"` in their name.

To save ourselves some additional typing we can set up a helper function:

```r
.test <- function(filter = NULL) {
  testthat::test_dir("tests/testthat", filter = filter)
}
```

and put it in `.Rprofile` so that it’s always available in the environment.

## Obtain fine control of what you want to run.

Now we can just type:

- `.test("barchart")` to run test for a single function and get super fast feedback,
- `.test("plots")` to run tests for a bigger code surface, for example to see how things integrate within a specific domain, or
- `.test()` to run all tests,

and get feedback on precisely what we want to check.
