---
title: 'Improve Your Unit Test Titles for Better Code Understanding'
description: 'Learn how to write descriptive unit test titles that enhance code readability and maintainability.'
pubDate: 'Oct 13 2024'
tags: ["r", "tests"]
---

When writing code we pay a lot of attention to naming variables. We want to make sure that the name of the variable is descriptive and helps us understand what the variable is used for. We should apply the same principle to our tests.

When writing unit tests, especially when writing unit tests after the production code it's tempting to write a bunch of assertions and give them a title like "[function] works correctly". Since we've already implemented it and manually checked that it works correctly, what else is there to write?

The problem with this approach is that it doesn't help us understand what the tested code is doing. If we come back to code even a few days later, we might not remember how the function is supposed to work.

Let's consider a simple example. We have a function `median` that calculates the median of a vector. We can write a test like this:

```r
test_that("median works correctly", {
  expect_equal(median(c(1)), 1)
  expect_equal(median(c(1, 2)), 1.5)
  expect_equal(median(c(2, 1)), 1.5)
  expect_equal(median(c(1, 2, 3)), 2)
  expect_equal(median(c(3, 2, 1)), 2)
  expect_equal(median(c(5, 2, 4, 3, 1)), 3)
})
```

Looking at this test we might infer that the function handles a few cases:
- it should return the same value if the vector has only one element,
- it should return the average of two values if the vector has even number of elements,
- it should return the middle value if the vector has an odd number of elements,
- it should work for both ordered and unordered vectors.

Instead of having to infer this information from the test, we can write the test in a way that makes it clear what the function is supposed to do. We can write a separate test for each of the cases:

```r
test_that("median should return the same value if the vector has only one element", {
  expect_equal(median(c(1)), 1)
})

test_that("median should return the average of two values if the vector has even number of elements", {
  expect_equal(median(c(2, 1)), 1.5)
})

test_that("median should return the middle value if the vector has an odd number of elements", {
  expect_equal(median(c(5, 2, 4, 3, 1)), 3)
})

test_that("median should return the same value for ordered and unordered vectors", {
  expect_equal(median(c(4, 3, 2, 1)), median(c(1, 2, 3, 4)))
  expect_equal(median(c(5, 2, 4, 3, 1)), median(c(1, 2, 3, 4, 5)))
})
```

There is a reason why `testthat::test_that` function is called "test that". It's to allow us to read the test as a sentence, making it easier to understand what the function is supposed to do.

Using `test_that` is perfectly fine, but we can make this test organised in a slightly different way by utilizing `testthat::describe` and `testthat::it`.

```r
describe("median", {
  it("should return the same value if the vector has only one element", {
    expect_equal(median(c(1)), 1)
  })

  it("should return the average of two values if the vector has even number of elements", {
    expect_equal(median(c(2, 1)), 1.5)
  })

  it("should return the middle value if the vector has an odd number of elements", {
    expect_equal(median(c(5, 2, 4, 3, 1)), 3)
  })

  it("should return the same value for ordered and unordered vectors", {
    expect_equal(median(c(4, 3, 2, 1)), median(c(1, 2, 3, 4)))
    expect_equal(median(c(5, 2, 4, 3, 1)), median(c(1, 2, 3, 4, 5)))
  })
})
```

This approach is even more focused on describing how the code behaves.

In this simple example it might take us a few seconds to understand what the function is supposed to do and coming up with a good description might be more costly than having to read and understand the test.

This might be true, but this time will be multiplied each time a person comes back to this code.

When we are testing more complex code the advantages are more pronounced.

When writing test titles, think about your future self and your colleagues. Make sure that the tests are easy to read and understand. Make sure that test titles describe what the function is supposed to do, not just that it works correctly.

If you want to push test readability even futher, check out how we can use [Arrange-Act-Assert](https://jakubsob.github.io/blog/want-cleaner-test-try-arrange-act-assert/) pattern to achieve that.
