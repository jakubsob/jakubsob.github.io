---
title: 'The easiest way to capture code output for tests'
description: 'Use it for adding tests to existing code'
pubDate:  'September 14 2024'
tags: ["r", "tests"]
---

Adding tests after the production code was written can be difficult. Not only refactoring the code to make it testable is hard – capturing the outputs for assertions might be a challenge as well.

### Creating complex output objects manually is error-prone and time-consuming, what are the alternatives?

Capturing the output, validating it and storing it for next runs is the premise of [snapshot testing](https://testthat.r-lib.org/reference/expect_snapshot.html). It's a powerful tool, but has one major drawback – you no longer see what the output is when reading the test. You need to trace which test generates which file and open it. For outputs that cannot be described with code it's acceptable, but for simple outputs it's an overkill.

### If the tested object can be described with a few lines of code, put it in the test file.

When writing tests, especially in test-first approach, we describe the output with code. We write what's the expected output manually, we know exactly what the output should be and we use it to validate if the code works as expected.

In test-last approach we have another option. We can capture the output of the code and put it in the test.

### Start by setting up a test to capture the output.

Let's imagine we have a function that summarises columns in a table with a function.

```r
summarise_with <- function(data, col, fun) {
  data |>
    dplyr::summarise(dplyr::across({{ col }}, fun))
}
```

Let's implement a first test. Instead of writing the assertion, let's just print the output to the console.

```r
describe("summarise_with", {
  it("should summarise columns with a function", {
    # Arrange
    data <- tibble::tibble(x = 1:10, y = 11:20)

    # Act
    result <- summarise_with(data, x:y, sum)

    print(result)
  })
})
```

The outcome is a tibble.

```r
# A tibble: 1 × 2
      x     y
  <int> <int>
1    55   155
```

The simplest approach would be to write the code that constructs the output manually.

```r
tibble::tibble(x = 55L, y = 155L)
```

In this case it's easy, but the output can be far more complex. This might often be the case when refactoring legacy code. We might be testing some code that passes around complex structures. In such cases this approach is error-prone and time-consuming and we can do better.

### A quicker approach is capturing the code representation of the output.

We can capture the output with `dput` function. It will print a text representation of the object that we can copy and paste into the test.

```r
dput(result)
```

```r
structure(list(x = 55L, y = 155L), class = c("tbl_df", "tbl",
"data.frame"), row.names = c(NA, -1L))
```

Copying the output from console into the test will make it pass.

```r
describe("summarise_with", {
  it("should summarise columns with a function", {
    # Arrange
    data <- tibble::tibble(x = 1:10, y = 11:20)

    # Act
    result <- summarise_with(data, x:y, sum)

    # Assert
    expect_equal(
      result,
      structure(
        list(x = 55L, y = 155L),
        class = c("tbl_df", "tbl", "data.frame"),
        row.names = c(NA, -1L)
      )
    )
  })
})
```

Although the test passes, we can do better with formatting.

We aim to write tests that are easy to read and understand. We want tests to document not only how the code should be used, but also what is the expected output. `dput` output doesn't convey the meaning of the output well. It's difficult to see that it's actually a `tibble` with two columns.

### Getting idiomatic constructors of the output.

To make the output more readable, we could use [{constructive}](https://github.com/cynkra/constructive) package. It allows us to get idiomatic constructors, that convey the meaning of the output better.

```r
constructive::construct(result, constructive::opts_tbl_df("tribble"))
```

```r
tibble::tribble(
  ~x,  ~y,
  55L, 155L,
)
```

It comes with many options of formatting the code, we can choose the one that fits our needs best, e.g. we can substitute `tibble::tribble` with `tibble::tibble` if we prefer the latter.

Once again we can copy and paste the output into the test to make it pass.

```r
describe("summarise_with", {
  it("should summarise columns with a function", {
    # Arrange
    data <- tibble::tibble(x = 1:10, y = 11:20)

    # Act
    result <- summarise_with(data, x:y, sum)

    # Assert
    expect_equal(
      result,
      tibble::tribble(
        ~x,  ~y,
        55L, 155L,
      )
    )
  })
})
```

Now it's clear from a first glance what the output is. It's a tibble with two columns. It's an understandable test.

If you don't want to install constructive, another approach is to use Github Copilot to format `dput` output. It can generate idiomatic constructors for many objects and format the code.

Just ask it to "construct" something for you with provided `dput` output:

---
> Construct tibble
>
> structure(list(x = 55L, y = 155L), class = c("tbl_df", "tbl", "data.frame"), row.names = c(NA, -1L))
>

> To construct a tibble in R with the given structure, you can use the tibble package. Here's how you can do it:
>
> ```r
> library(tibble)
> # Constructing the tibble
>
> data <- tibble(
>   x = 55L,
>   y = 155L
> )
>
> print(data)
> ```
> This code will create a tibble with the specified values for x and y. The tibble function automatically handles the class and row names for you.
> Construct tibble
>
> structure(list(x = 55L, y = 155L), class = c("tbl_df", "tbl", "data.frame"), row.names = c(NA, -1L))
>

---

Or if you want the output to be a tribble:

---

> Construct tribble
>
> structure(list(x = 55L, y = 155L), class = c("tbl_df", "tbl", "data.frame"), row.names = c(NA, -1L))
>

> To construct a tribble in R with the given structure, you can use the tibble package. Here's how you can do it:
>
> ```r
> library(tibble)
> # Constructing the tibble
>
> # Constructing the tribble
> data <- tribble(
>   ~x, ~y,
>   55L, 155L
> )
>
> print(data)
> ```
> This code will create a tribble with the specified values for x and y. The tribble function is a convenient way to create tibbles row-by-row.

---

Use whichever approach you prefer or based on which tools you have available. The goal is to get the idiomatic constructors of the output that make tested outputs easy to read and understand.
