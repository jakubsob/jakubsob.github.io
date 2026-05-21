---
title: '11 Test Smells That Make Your Tests Lie to You'
description: 'Learn to recognize problems in R test code that cause your test suite to pass while hiding real bugs. Detect those issues and start writing more trustworthy tests.'
pubDate: 2026-05-19
draft: true
tags: ["r", "tests"]
---

Green tests don't automatically mean correct code.

Tests can be written in ways that pass reliably, survive every `testthat::test()` run, and still tell you almost nothing about whether your code works. The software engineering community has a name for these patterns: test smells. They're structural problems in test code — not bugs, but patterns that signal the tests are doing less or something different than they appear.

Have you ever reviewed a pull request and only skimmed the test code, because why bother if you see in CI they're green?

The problem with test code is that:

- it can be written in ways that look fine but are actually misleading,
- you may not review test code with the same seriousness as production code,
- you may not know what to look for in test code.

Here's a list of problems in test code that show up regularly, and what to do about them.

## 1. Mystery Guest

**🫣 The smell:** the test relies on state that isn't visible inside the test itself.

```r
test_that("report uses the correct currency symbol", {
  result <- format_currency(1000)
  expect_equal(result, "£1,000")
})
```

This test passes on one machine and fails on another — and the reason isn't in the test. Somewhere upstream, a `.Rprofile` file sets `options(currency = "GBP")`, or maybe it's set with an environment variable. In a fresh session without that state, `format_currency` falls back to `"$1,000"`.

The test has an invisible guest. You can't understand it by reading it.

The fix is to make the dependency explicit — set it and clean it up within the test itself using `withr`:

```r
test_that("report uses the correct currency symbol", {
  withr::with_options(list(currency = "GBP"), {
    result <- format_currency(1000)
    expect_equal(result, "£1,000")
  })
})
```

Now the test tells its own story. Anyone reading it knows exactly what conditions it relies on.

## 2. Eager Test

**🫣 The smell:** one test that asserts on multiple unrelated behaviors.

```r
test_that("data pipeline works", {
  result <- run_pipeline(raw_data)
  expect_equal(nrow(result), 100)
  expect_equal(ncol(result), 5)
  expect_true(all(!is.na(result$value)))
  expect_equal(result$category, expected_categories)
  expect_true(is.numeric(result$value))
})
```

This test is checking the row count, the column count, the NA handling, the category values, and the column type — all under the title "data pipeline works." When it fails, the output tells you *something* broke. Not *what*.

Split it into cases where each title describes the specific behavior:

```r
test_that("pipeline returns 100 rows", {
  # Arrange
  raw_data <- ...

  # Act
  result <- run_pipeline(raw_data)

  # Assert
  expect_equal(nrow(result), 100)
})

test_that("pipeline removes rows with missing values", {
  # Arrange
  raw_data <- ...

  # Act
  result <- run_pipeline(raw_data)

  # Assert
  expect_true(all(!is.na(result$value)))
})

test_that("pipeline produces numeric values", {
  # Arrange
  raw_data <- ...

  # Act
  result <- run_pipeline(raw_data)

  # Assert
  expect_true(is.numeric(result$value))
})
```

This test suite has more lines, yes. Is it bad? No.

We're not optimising memory, we're optimising for clarity. It's also much easier to maintain — when a requirement changes, you know exactly which test to update and why.

Adding `# Arrange`, `# Act`, and `# Assert` comments is a simple habit that makes this smell hard to miss. When the `# Assert` block has five `expect_*` calls testing unrelated things, the label might prompt you to notice — and question whether they all belong together. The structure doesn't fix the test, but it makes the problem easier to spot at a glance. The test is no longer a blob of code doing everything at once. It has a structure that invites you to think about what belongs in each section.

## 3. Over-specification

**🫣 The smell:** the test checks *how* the code does something, not *what* it produces.

```r
test_that("sends notification on upload", {
  # Arrange
  mock_notify <- mockery::mock()
  mockery::stub(process_upload, "notify_user", mock_notify)

  # Act
  process_upload(file = "report.csv", user_id = "u42")

  # Assert
  mockery::expect_called(mock_notify, n = 1)
  mockery::expect_call(
    mock_notify,
    1,
    notify_user("u42", type = "upload_complete")
  )
})
```

This test will break the moment you rename `notify_user`, change its signature, or switch to a different notification mechanism internally — even if the *behavior* (the user gets notified) stays exactly the same.

Over-specified tests are tightly coupled to implementation. They punish refactoring.

The alternative is to test from the outside:

```r
test_that("user receives notification after upload", {
  # Arrange
  notifications <- list()

  # Act
  process_upload(
    file = "report.csv",
    user_id = "u42",
    notify_user = function(user_id, ...) {
      notifications[[length(notifications) + 1]] <<- user_id
    }
  )

  # Assert
  expect_length(notifications, 1)
  expect_equal(notifications[[1]], "u42")
})
```

The test no longer cares how notification happens internally — just that `"u42"` received one. You can refactor the internals freely.

Notice what changed structurally: instead of patching `notify_user` after the fact with a stub, `process_upload` now accepts it as an argument. This is dependency injection, and it's worth understanding as a pattern in its own right — not just as a way to avoid over-specification, but as a replacement for stubs and mocks altogether.

When a dependency is injected, the test passes in exactly the implementation it wants. There's no patching, no intercepting, no targeting of internal function names. The test controls the dependency directly:

```r
process_upload <- function(file, user_id, notify_user = real_notify_user) {
  # ... upload logic
  notify_user(user_id, type = "upload_complete")
}
```

In production, `real_notify_user` is used. In tests, any function with the same interface can be passed in. The key word is *interface*: the argument name and what it receives. That's the contract between `process_upload` and whatever handles notifications.

This changes how test failures work — in a good way. With a stub, the test fails when the internal call site changes: rename the function, move it to a different module, inline it, and the stub can no longer target it. The failure is about test plumbing, not about behavior. With dependency injection, the test only fails when the *interface* changes — when `notify_user` is expected to receive different arguments, or when it's removed entirely. That's a failure you want to know about. It means the contract between components changed, and the fake dependency needs updating to match.

Notice also that the fake `notify_user` is just a plain function — no mocking library needed. A mock that accepts any call and records nothing will let over-specification creep back in through `expect_called()` and `expect_call()`. A simple fake that does one concrete thing — appends to a list, increments a counter, writes to a local variable — can only be asserted on from the outside. It doesn't offer the machinery to inspect internals, so the test can't become over-specified even if you wanted it to.

## 4. Sensitive Equality

**🫣 The smell:** the test asserts on an entire object when only part of it matters.

```r
test_that("filters inactive users", {
  # Arrange
  users <- ...

  # Act
  result <- filter_active_users(users)

  # Assert
  expect_equal(result, data.frame(...))
})
```

The expectation was created when this test was first written. Since then, the `users` data frame has gained two new columns. Every test asserting against the full snapshot now fails — not because the filtering logic is wrong, but because the expected object is stale.

Asserting on a whole object isn't always wrong. A test that documents the full shape of the output — its columns, types, and structure — is genuinely useful. It acts as a contract: this is what `filter_active_users` returns. When that contract changes intentionally, the test tells you.

This matters especially in R. In a statically typed language the compiler enforces what a function returns — change the return type and the code won't build. R has no such guarantee. A function can return a data frame today and a list tomorrow, drop a column, silently change a type, and nothing outside the tests will catch it. A full-object contract test fills that gap, giving you the kind of output verification the language doesn't provide for free.

The smell appears when *every* test does this, or when the full-object assertion is used to check a behavior where most of the fields are irrelevant. If you're testing that the filter removed inactive users, the output's column names and data types are noise — and noise breaks tests for the wrong reasons.

A cleaner split is one test for the shape, separate tests for the behaviors:

```r
test_that("returns a data frame with user_id and active columns", {
  # Arrange
  users <- ...

  # Act
  result <- filter_active_users(users)

  # Assert
  expect_equal(result, expected_users)
})

test_that("filters inactive users", {
  # Arrange
  users <- ...

  # Act
  result <- filter_active_users(users)

  # Assert
  expect_equal(result$user_id, c("u01", "u03", "u07"))
  expect_true(all(result$active))
})
```

The first test owns the full-object assertion and will break when the output shape changes — which is the right test to break. The second test owns the filtering logic and only breaks when the filtering logic is wrong – not when an irrelevant column is added or renamed.

## 5. Obscure Test

**🫣 The smell:** the setup is so long that the behavior being tested is buried inside it.

```r
test_that("calculates discount correctly", {
  user <- list(
    id = "u42",
    name = "Alice",
    email = "alice@example.com",
    created_at = as.Date("2020-01-01"),
    plan = "pro",
    region = "EU",
    active = TRUE,
    referral_code = "REF001",
    payment_method = "card",
    currency = "EUR"
  )
  product <- list(
    id = "p99",
    name = "Annual Subscription",
    base_price = 200,
    category = "software",
    tax_rate = 0.2,
    available = TRUE
  )
  result <- calculate_discount(user, product)
  expect_equal(result$discount_pct, 0.15)
})
```

By the time you reach the assertion, you've waded through 20 lines of setup. Why does the user need a `referral_code`? Does `currency` affect the discount? Is `tax_rate` relevant? The intent is invisible.

The fix is to extract a builder that encodes sensible defaults and lets each test express only what's relevant to that case:

```r
make_user <- function(...) {
  defaults <- list(
    id = "u_default", name = "Test User",
    plan = "basic", region = "EU", active = TRUE,
    currency = "EUR", payment_method = "card"
  )
  modifyList(defaults, list(...))
}

test_that("pro users receive a 15% discount", {
  # Arrange
  user <- make_user(plan = "pro")
  product <- list(id = "p99", base_price = 200, category = "software")

  # Act
  result <- calculate_discount(user, product)

  # Assert
  expect_equal(result$discount_pct, 0.15)
})
```

Now the test title and the setup agree: this is a test about the `"pro"` plan. Everything else is noise that's been moved out of sight.

Using `# Arrange`, `# Act`, and `# Assert` comments here also helps. The test is no longer a blob of code doing everything at once. It has a structure that invites you to think about what belongs in each section, and helps you understand when one secttion ends and another begins. The test is easier to read, and the intent is clearer.

## 6. Meaningless Title

**🫣 The smell:** the test name describes what the code does, not what behavior it verifies.

```r
test_that("calculate_discount works", {
  # Arrange
  user <- make_user(plan = "pro")

  # Act
  result <- calculate_discount(user, product)

  # Assert
  expect_equal(result$discount_pct, 0.15)
})
```

`"calculate_discount works"` is not a test title — it's a function name with "works" appended. When this test fails, the output tells you that `calculate_discount` stopped working. It doesn't tell you *what it's supposed to do* or *under what conditions it broke*.

The title is the first thing you read when a test fails. It should answer two questions: *what behavior is expected*, and *under what circumstances*.

```r
test_that("pro users receive a 15% discount", {
  # Arrange
  user <- make_user(plan = "pro")

  # Act
  result <- calculate_discount(user, product)

  # Assert
  expect_equal(result$discount_pct, 0.15)
})
```

Now the failure output reads: `pro users receive a 15% discount` — and you immediately know whether the logic is wrong or the test is outdated.

This smell is easy to spot: if your test title could be swapped with any other test on the same function without anyone noticing, it's not a title — it's a placeholder. A good title is a specification. It should still make sense even if the implementation is completely rewritten.

Some patterns that signal the smell:

- Ends with "works", "is correct", "should work", or "test"
- Is just the function name
- Doesn't mention the input condition that makes this case distinct

---

💡 **A rule of thumb: write the title before you write the test body. If you can't name what you're testing, you don't know what you're testing yet.**

---

## 7. Flaky Test

**🫣 The smell:** the test sometimes passes and sometimes fails without any code change.

```r
test_that("model selects the most important features", {
  # Arrange
  training_data <- ...
  top_n <- 3

  # Act
  result <- select_features(training_data, top_n = top_n)

  # Assert
  expect_equal(result$feature, c("age", "income", "region"))
})
```

This passes on the developer's machine today. Tomorrow it returns `c("income", "age", "region")` — same features, different order — because two of them had near-identical importance scores and a random tie-breaking step inside the model produced a different ranking. The test fails. Nothing is broken.

Flaky tests are one of the most corrosive smells in a test suite. They don't just fail — they train developers to distrust failures. Once the team learns to re-run tests until they go green, a genuinely broken build can hide for days.

The R-specific sources of flakiness to watch for: unset random seeds, tests with hard-coded `Sys.sleep()` waits that assume the app loads within a fixed time, tests that rely on network availability, and assertions against system time or floating-point values without a tolerance.

For the feature selection example, the fix is to set the random seed before the call, and to assert on what actually matters — that the right features were selected — rather than the incidental order they came back in:

```r
test_that("model selects age, income, and region as top features", {
  # Arrange
  training_data <- ...
  top_n <- 3
  withr::local_seed(42)

  # Act
  result <- select_features(training_data, top_n = top_n)

  # Assert
  expect_equal(result$feature, c("age", "income", "region"))
})
```

Assuming it's randomness that makes the test flaky, setting the seed makes any remaining randomness deterministic. The test now passes or fails for the right reason.

## 8. Never-Failing Test

**🫣 The smell:** the test will pass no matter what the code does.

```r
test_that("returns an error for invalid input", {
  expect_error(calculate_discount(user = NULL, product))
})
```

This passes today. It will also pass if `calculate_discount` is rewritten to throw a completely different error, emit a warning instead, return `NA` silently, or crash with an unrelated message. The assertion only checks that *some* error occurred — not the right one.

The same trap appears with positive assertions:

```r
test_that("result is a list", {
  result <- run_pipeline(data)
  expect_true(is.list(result))
})
```

If `run_pipeline` returns *any* list — empty, malformed, missing all expected fields — this test will almost always pass. It is not testing behavior; it is testing that R's type system is still working.

Always assert on the specific outcome. For errors, check the message:

```r
test_that("returns an error when user is NULL", {
  # Arrange
  user <- NULL
  product <- ...

  # Act, Assert
  expect_error(
    calculate_discount(user = NULL, product),
    "user must not be NULL"
  )
})
```

For positive assertions, check the values that actually matter — not just the type that contains them.

## 9. Test Order Dependency

**🫣 The smell:** tests only pass when run in a specific sequence.

```r
test_that("initialises the cache", {
  initialise_cache()
  expect_true(cache_is_ready())
})

test_that("stores a value in the cache", {
  store_in_cache("key", "value")
  expect_equal(retrieve_from_cache("key"), "value")
})
```

The second test silently depends on the first having run. If you run it in isolation — or if `testthat` reorders tests — it fails with an error about the cache not being initialized, which looks like a cache bug but is actually a test structure bug.

The symptom is tests that pass with `devtools::test()` and fail with `testthat::test_file()` on a single file, or tests that break when you move them to a different `describe()` block.

The fix is to make each test fully self-contained. Every test should set up whatever it needs and leave no state behind:

```r
test_that("stores a value in the cache", {
  # Arrange
  initialise_cache()
  withr::defer(clear_cache())
  store_in_cache("key", "value")

  # Act
  value <- retrieve_from_cache("key")

  # Assert
  expect_equal(value, "value")
})
```

`withr::defer()` ensures the cleanup runs even if the test fails, so the next test always starts from a clean slate.

## 10. Conditional Test Logic

**🫣 The smell:** the test body contains `if`, `else`, or `tryCatch`.

```r
test_that("formats output correctly", {
  result <- format_output(data)
  if (nrow(result) > 0) {
    expect_equal(result$label[[1]], "Total")
  } else {
    expect_equal(nrow(result), 0)
  }
})
```

When a test branches, it is multiple tests in one — and only one branch executes on any given run. The other path is permanently untested. If the data changes so that `nrow(result)` is always `0`, the label check never runs again and a regression in label formatting will go undetected forever.

Conditional logic in tests is also a sign the test doesn't know what it expects. A test that hedges with `if` hasn't decided what the correct behavior is.

If you find yourself using a `tryCatch`, then it seems like you don't know whether the code should throw an error or not. Tests must know if an error is expected.

Split the conditions into separate, unconditional tests with setups that guarantee the state each one needs:

```r
test_that("includes a Total label when data is non-empty", {
  # Arrange
  non_empty_data <- ...

  # Act
  result <- format_output(non_empty_data)

  # Assert
  expect_equal(result$label[[1]], "Total")
})

test_that("returns empty output when data is empty", {
  # Arrange
  empty_data <- ...

  # Act
  result <- format_output(empty_data)

  # Assert
  expect_equal(nrow(result), 0)
})
```

Each test now executes its assertion unconditionally, every time.

## 11. Test Logic in Production

**🫣 The smell:** production code contains special branches that only exist to make tests pass.

```r
process_payment <- function(amount, user_id, env = Sys.getenv("APP_ENV")) {
  if (env == "test") {
    return(list(status = "ok", transaction_id = "test-txn-001"))
  }
  # ... real payment logic
}
```

The test environment gets a hardcoded success response. Production gets the real code. The two paths diverge immediately, so the tests are no longer testing what ships.

This smell often starts as a quick fix — "I'll just skip the real API call in tests" — and ends up as a permanent fixture that no one dares remove. The production branch accumulates changes – the test branch stays frozen. At some point the tests are validating behavior that the production code no longer exhibits.

The correct fix is dependency injection: pass the thing you want to replace as an argument, and substitute it in tests:

```r
process_payment <- function(amount, user_id, payment_gateway = real_gateway) {
  result <- payment_gateway(amount, user_id)
  list(status = result$status, transaction_id = result$id)
}

test_that("returns ok status on successful payment", {
  # Arrange
  fake_gateway <- function(amount, user_id) list(status = "ok", id = "txn-001")

  # Act
  result <- process_payment(100, "u42", payment_gateway = fake_gateway)

  # Assert
  expect_equal(result$status, "ok")
})
```

Production code has no awareness of tests. Tests control the dependency. Both paths exercise the same logic.

## The Pattern

These smells fall into two categories. Some make your tests untrustworthy: they pass for reasons unrelated to whether the code works. Others make your tests unreadable: they pass and fail correctly but no one can tell what they mean.

A test is documentation. It tells the next developer — probably future you — what the code is supposed to do and under what conditions. A smelly test fails at that job before it ever fails at catching bugs.

The most useful question to ask while writing a test isn't "will this pass?" but "if this fails at 2am, will I understand what broke and why?"

If the answer is no, the test has a smell worth fixing.

Here's a quick reference to keep nearby:

| Smell                    | Signal                                             |
| ------------------------ | -------------------------------------------------- |
| Mystery Guest            | Test relies on state set somewhere else            |
| Eager Test               | One block, many unrelated assertions               |
| Over-specification       | Breaks on refactor, not on broken behavior         |
| Sensitive Equality       | Full-object assertion on a partial concern         |
| Obscure Test             | Setup buries the point of the test                 |
| Meaningless Title        | Name doesn't say what behavior is expected         |
| Flaky Test               | Passes or fails depending on timing or environment |
| Never-Failing Test       | Will pass regardless of what the code does         |
| Test Order Dependency    | Only passes when run after another specific test   |
| Conditional Test Logic   | `if`/`else` inside the test body                   |
| Test Logic in Production | Production code has special branches for tests     |

None of these require a major rewrite to fix. Each one has a mechanical correction: extract the state, split the block, inject the dependency, narrow the assertion, introduce a builder, rename the case. The value is in learning to *see* them first.

Once you can spot these smells, you can start to eliminate them, one by one — and build a test suite that tells you the truth about your code, every time.
