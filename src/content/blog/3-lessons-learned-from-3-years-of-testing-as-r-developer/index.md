---
title: '3 Lessons learned from 3 years of testing as an R developer'
description: ''
pubDate: 'Oct 20 2024'
tags: ["r", "tests"]
---

When I first started working as an R developer, I knew nothing about testing.

My practice of developing R code was to write some, execute it manually in the console, and see if it worked. The idea of running and checking the same code automatically was absolutely foreign to me.

How could I develop code if I haven't run it myself?

Thankfully I was introduced to the concept of testing by my colleagues and after a few years of practice, here's what I learned.

## Eliminate the friction and just start testing.

When I first started writing tests, I was overwhelmed by the concept.
- Where should I even start?
- What should I test?
- How should I test it?

The advice I was given was to think of each test as a process consisting of three steps:
- setup,
- execution,
- and assertion.

Instead of feeling stuck, and dwelling on possibilities, I could start from an empty test with 3 comments

```r
test_that("[something] should [do something]", {
  # Arrange

  # Act

  # Assert
})
```

and start filling in the blanks.

Those comments break down the empty space into smaller, more manageable pieces. It's a recipe that you can follow to create any test. It not only reduces the mental friction, but also makes tests more understandable and maintainable. This approach helps us keep each test focused on a single thing and not dependent on external dependencies. It helps us create tests that are independent units.

If you're still confused, start from filling in the part that you know the most about.

If you add tests after a piece of code is written, you might start from the #Act section as you've already seen how the code is called somewhere else and then you can find out how you need to set up the environment to run it.

If you add tests before writing the code, you might start from the #Arrange and #Assert sections as you might know that given these inputs you expect that output. Then you can start thinking about the interface of the code you will implement to achieve that.

## Make tests document what you implement.

My first tests I've ever written looked like [this](https://github.com/jakubsob/functiondepends/blob/master/tests/testthat/tests-find-functions.R):

```r
test_that("is_assign", {
  dir.create(tempdir(), showWarnings = FALSE)
  code <- "add <- 1"
  write(code, file.path(tempdir(), "is_assign.R"))
  expect_equal(is_assign(parse(file.path(tempdir(), "is_assign.R"))[[1]]), TRUE)

  code <- "add = 1"
  write(code, file.path(tempdir(), "is_assign.R"))
  expect_equal(is_assign(parse(file.path(tempdir(), "is_assign.R"))[[1]]), TRUE)

  code <- "assign('add', 1)"
  write(code, file.path(tempdir(), "is_assign.R"))
  expect_equal(is_assign(parse(file.path(tempdir(), "is_assign.R"))[[1]]), TRUE)
})
```

Looking back at it after a few years it took me a while to understand what I meant to test here...

If it were a week after I wrote it, it would still require me to read the code to understand what I was testing.

The most obvious deliverable of tests is the feedback if the code works or not. But the other important aspect is that it can document what the code does. Tests are a communication tool between you and the future you or someone else who will read the code.

Focus on structuring tests in a way that communicates the intent of the code:
1. Use meaningful test titles to describe what the code does.
2. Use #Arrange, #Act, #Assert comments to structure the test code.

Adding a bit of extra effort can significantly increase the value of tests.

## Focus on the tests that matter.

Instead of trying to test everything, focus on the tests that give you the most confidence in the code. We're not in a competition of having the highest code coverage, we're chasing a trade off of confidence and development speed. The higher the coverage, the higher the chance that if you change something in the code, you'll break some tests.

I tend to skip on testing individual, low-level helper functions if they're only used in a few places. I trust that if the higher-level functions are working, the lower-level ones are too.

I focus my efforts on testing the higher-level functions and the edge cases that are most likely to break. This way I can spend more time on testing functions that are responsible for solving a piece of a business problem rather than functions that help implement that solution.

In case I need to refactor how that piece of code is implemented, I can change the internals of the code however I want, as long as the tests still pass. Refactoring or even removing a low-level function doesn't affect tests, because they're not tested directly.

Be minded, I'm not encouraging you to stop testing low-level functions.

I'm encouraging you to focus on tests that give you the most confidence in the code. The confidence that it solves a specific problem. Not the confidence that it's implemented in a specific way.

Focus on testing things that you'll interact with often or public interfaces that someone else will use.
