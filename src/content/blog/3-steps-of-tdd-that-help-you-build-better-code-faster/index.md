---
title: '3 Steps Of Test-Driven Development That Help You Build Better Code Faster.'
description: ''
pubDate: 'Oct 12 2023'
tags: ["tests", "tdd"]
---

Test Driven Development is a design practice that has a tremendous effect on the quality of the software we’re building — all it takes is to stick to the 3 steps:

**🔴 Write the test first and see that it fails.**

This step is key to the whole practice, if we skip it, we miss out on all of its benefits!

Setting up a test and seeing it fail is crucial. We need to make sure the test has the ability to fail if the code doesn’t meet the requirements. If we write a test after code, we write it to make it pass, contrary to Test Driven Development where we write them to fail.

Starting with a test helps focus on asserting the expected behavior of the code, rather than trying to prove that existing code works as expected.

Start with at least one case, and **describe what it should do**, not how it should do it.

```r
describe("my_median", {
  it("should return a value that separates lower half from higher half of a sample", {
     # Arrange
     x <- c(1, 2, 3)

     # Act
     result <- my_median(x)

     # Assert
     expect_equal(result, 2)
  })
})
```

**🟢 Write code to pass the test.**

Once we have at least one test in place and we confirmed that it fails, we can write code that will make the test pass.

Having tests in place allows you to quickly re-run them. Each time you write some code you can see if it meets the requirements. No more selecting batches of code in the editor and running it manually. We can check all specifications at once, in a reproducible manner. No more accidental breaking of previously checked behavior when we add a new one.

We should write only as much code as is needed to pass tests — why write more code if less already satisfies all requirements? Don’t write more code — You Ain’t Gonna Need It!

```r
my_median <- function(x) {
  n <- length(x)
  sorted <- sort(x)
  sorted[(n + 1) / 2]
}
```

This implementation will pass the test, as so far we only expect the median function to work on an odd length vector.

That’s how we end up with **incremental design** — we implement behavior one by one, in small steps — testing if median works for even length vectors or vectors with missing values is a job for additional test cases.

**♻️ Refactor to improve the design.**

This step involves improving the design and implementation of our code.

It’s the time to make the code more beautiful, efficient and robust. We may modify the internals of the code however we want, as long it passes our tests. This is also the step when we reevaluate our design choices, for example we may notice that the code we implemented doesn’t handle missing values. This may lead to a choice to introduce a parameter that controls whether the function should ignore missing values or not.

Use this step to reevaluate your design choices, make the code simpler and more robust.
