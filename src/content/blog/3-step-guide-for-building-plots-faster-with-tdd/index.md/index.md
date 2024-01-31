---
title: '3-Step Guide For Building Plots Faster With Test Driven Development.'
description: ''
pubDate: 'Oct 29 2023'
tags: ["tests", "ui"]
---

Unit-testing plots is challenging, as images are difficult to describe in code.

We need to rely on [approval testing](https://understandlegacycode.com/approval-tests/), which is usually utilised to validate that an output remains the same when code changes. But we don't have a plot yet that we can assert on, how can we use Test Driven Development (TDD) and start from writing tests? Where to even start?

Let’s see how we can get the most benefits of TDD and approval testing to rapidly develop a plot.

# 1. Start with a test

We start in (almost) the same way as we would do with any other piece of software using TDD:

- Write test first:
    - **Arrange:** setup test environment.
    - **Act:** run tested code.
    - **Assert:** capture output.
- Run it to see if it fails 🔴.
- Write production code to pass the test 🟢.
- Refactor ♻️.

Make sure to do those steps in order, as only as you unlock the full potential of this approach!

**When writing tests, focus on:**

- Describing what the plot **should** look like — make different outcomes separate test cases. Be verbose, use as many words as you need to describe **how** the plot **should behave.**
- Creating **a minimal setup** to satisfy the requirements — remember about **chicken counting: zero, one, many.** If you want to test rendering of multiple series, two will probably suffice. Add a separate case to test limits of how much data can be plotted.

Let’s create a simple scatter plot with a regression line.

```r
library(testthat)

describe("scatterplot", {
  it("should create a scatterplot with selected variables", {
    # Arrange
    data <- data.frame(
      X = c(1, 2, 3),
      Y = c(1, 2, 3)
    )

    # Act
    result <- scatterplot(data, x = X, y = Y)

    # Assert
    fail()
  })

  it("should add a regression line if the number of observations is larger than a given threshold", {
    # Arrange
    data <- data.frame(
      X = 1:4,
      Y = c(1, 3, 2, 4)
    )
    threshold <- 3

    # Act
    result <- scatterplot(data, x = X, y = Y, threshold = threshold)

    # Assert
    fail()
  })
})
```

Notice we use `fail()` in each test.

We don’t have an automated way of checking results yet, so we should expect tests to always fail 🔴 — our code is not in a releasable state yet! When we have tests in place, we can start adding production code.

Don’t write more code than it’s enough to satisfy tests — YAGNI!

```r
library(ggplot2)

scatterplot <- function(data, x, y, threshold = 10) {
  data |>
    ggplot(aes(x = {{ x }}, y = {{ y }})) +
    geom_point() + {
      if (nrow(data) > threshold) {
        geom_smooth(method = "lm", se = FALSE)
      }
    }
}
```

# 2. Preview results for iterating quickly

We could add snapshots assertions at this stage, but since we’re still developing the plot:

- Adding new test cases for new features.
- Adding new test cases for edge cases.
- Or experimenting with a theme.

It would add an overhead of reviewing and accepting new snapshots.

To make development more rapid, we can just add `print` calls before each `fail()` to manually inspect plots with each change, it will speed up each iteration, but:

- With more cases, it’ll become more difficult to manually inspect them all.
- You can start breaking other features without noticing — computers are way better on comparing if things are identical than humans!

So don’t linger in this stage for too long!

# 3. Add assertions on plot snapshots

Once we get to a stage when most features are stable, and we can finally add actual snapshot tests.

We can use [vdiffr](https://github.com/r-lib/vdiffr) package and its `expect_doppelganger` method:

```r
# Assert
vdiffr::expect_doppelganger(result, "plot_1")
```

Or we could use `testthat::expect_snapshot_file`, but then we’d need to handle saving the plot to a file on our own.

**Notice that we don’t assert on the plot object, its representation in the R process, but we’re asserting on the object printed to the screen.**

Assertion set up in such a way will do the following:

- On the first run, it will save a snapshot ****for each test case.
- On subsequent runs, it will check if the new figure is the same as the one saved.
- If the figure is the same, the test passes! 🟢
- If the figure is different, the test will fail 🔴 — you will be prompted to check the difference (e.g., using `testthat::snapshot_review()`) and either:
    - Reject the change — the change is not an expected one, we still want to use previous snapshot as the correct one.
    - Approve the change —  ****new snapshot will override previous one and will be used for subsequent test runs. That’s why it’s called an **Approval Test.**

Make sure to encode your system information into the snapshot (e.g., with `shinytest2::platform_variant()`) — if you use a different system in CI, snapshots generated locally can be different from ones in the CI and the pipeline will fail.

If we follow this approach, we obtain:

- A **proof** that we produced images that we accept as ones meeting **all requirements.**
- A textual documentation of how the plot **should look like.**
- A number of **examples how the plot code can be called.**
- And a side effect of **100% test coverage.**

Start using Test Driven Development today and enjoy instant feedback on what your code does and improved safety that your code keeps working as expected!
