---
title: '3 Types of Unit Tests Everyone Should Know'
description: ''
pubDate: 'Sep 25 2023'
tags: ["tests"]
---

When approaching to write a unit test, we might ask ourselves:

- **What** should I test?
- **How** should I test?
- And even **when** should I test?

Getting answers to these questions helps overcome writer’s block.

To make it easier to think about **what** to test and to make a more informed decision on **how** we need to test it, we may categorize tests into:

- Direct Response Tests.
- State Change Tests.
- Interaction Tests.

Let’s see in what circumstances should each type be used.

# Direct Response Tests

- They check whether a return value or an exception matches the expectation.
- These tests ensure that the core functionality of the code works correctly.

## Example

```r
library(testthat)

describe("Stack", {
  it("should return the last pushed value when popping an item", {
    # Arrange
    my_stack <- Stack$new()
    my_stack$push(1)

    # Act
    value <- my_stack$pop()

    # Assert
    expect_equal(value, 1)
  })
})
```

## **Tips**

- Don’t test a lot of different values if the new combination doesn’t test new behavior. E.g., testing `mean(1:10)` and then `mean(1:100)` doesn’t improve our confidence that `mean` function works as expected.
- Use assertions to convey intent. E.g., if you don’t care about the order of a vector, consider using `testthat::expect_setequal` instead of `testthat::expect_equal` to only assert on its content.
- Don’t duplicate assertions. E.g., if you already use `testthat::expect_equal` on a vector, does adding an assertion on its length with `testthat::expect_length` add more safety?

# State Change Tests

- These tests help validate the impact of certain actions on the system's state.
- They confirm that the behavior results in the expected changes, such as modifying a list and confirming its size change.

## Example

```r
library(testthat)

describe("Stack", {
	it("should not be empty after pushing an item", {
	  # Arrange
	  my_stack <- Stack$new()

	  # Act
	  my_stack$push(1)

	  # Assert
	  expect_false(my_stack$empty())
	})
})
```

## **Tips**

- Don’t share state between tests. It may make tests more fragile and more difficult to understand.
- Avoid iteration. Don’t check if `Stack` can handle 0, 1, 2, 3, 4, …, calls to `push`. Use chicken counting: **zero, one, or many.**

# **Interaction Tests**

- These tests ensure proper communication and integration between different parts of the system.
- These tests examine how code interacts with external components, often simulating dependencies or external services. **[Mocks, Fakes, Stubs and Dummies](http://xunitpatterns.com/Mocks,%20Fakes,%20Stubs%20and%20Dummies.html)** are used to control these interactions and validate that the code interacts correctly with external entities.

## Example

```r
library(testthat)

describe("Stack", {
  it("should log what item has been pushed", {
    # Arrange
    logger <- mockery::mock()
    my_stack <- Stack$new(logger)

    # Act
    my_stack$push(1)

    # Assert
    mockery::expect_args(
      logger,
      n = 1,
      "Pushed 1 onto the stack"
    )
  })
})
```

## **Tips**

- Complex mock will make tests brittle and difficult to understand. They typically need to be created when interactions in the code are complex or not defined well enough.
- Notice how much setup is needed to run a test. Use this feedback to improve and simplify production code. Code that is easy to test is easier to maintain.
