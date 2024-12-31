---
title: 'Optimize Shinytest2: Speed Up Your Shiny App Tests'
description: 'Learn how to speed up Shiny app tests using shinytest2 by reusing application instances and refreshing the browser.'
pubDate:  'May 29 2024'
tags: ["r", "shiny", "shinytest2", "tdd", "tests"]
---

A good rule of thumb when testing is to make sure that each test case is independent of the others.

Having setup, execution, assertion, and teardown in each test case ensures that:
- **Tests are easier to understand** – all required code is contained inside a test case.
- **Tests are easier to maintain** – we can refactor tests without affecting others.
- **Tests won't fail due to side effects** – each test case is an independent unit.

When testing Shiny applications or Shiny modules with `shinytest2`, a test case is independent is when we:
- start the application in each test case,
- stop the application at the end of each test case.

**Starting up the application can be time-consuming, especially if there is an expensive setup, like loading data or connecting to a database.**

To reduce the time it takes to run tests, we could reuse the same application instance between test cases. But how do we ensure that the application is in a clean state before each test case? How do we ensure that each test case is independent?

**In some cases, it should be enough to refresh the browser with the server still running.**

This is how [Cypress](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test#Step-1-Visit-a-page) works, you just visit the page where it's served and do your tests. You can refresh the page to restore the initial state and move on to the next test case.

There are other optimization techniques, like reducing the scope of the test or parallelization, but let's focus on the effect of reusing the same application instance between test cases of what is the potential impact.


### Let's see how we can introduce this approach to test a simple counter app.

Let's describe this app with tests.

```r
library(testthat)

describe("CounterPage", {
  it("should increment the counter once", {
    # Arrange
    page <- open_page()

    # Act
    page$increment()

    # Assert
    page$expect_value("1")
  })

  it("should increment the counter many times", {
    # Arrange
    page <- open_page()

    # Act
    page$increment()
    page$increment()

    # Assert
    page$expect_value("2")
  })
})
```

There are three distinct actions in each test case:
- **Arrange** – open the page,
- **Act** – increment the counter,
- **Assert** – check if the counter has the expected value.

We don't know the implementation of those methods yet, we don't even have the code of the app yet, but we've described the behavior of the page.

### Having at least one test, we can move to the implementation of the page object, and then the app.

To abstract common operations made on any page, we can create a class that represents a page, it's a page that can only be reloaded or closed. We will be able to reuse this object for all module tests as our project grows. It also bundles `shinytest2` driver and `selenider` session in one structure, so that they're easier to access.

The reloading of the page can be implemented with [`reload`](https://developer.mozilla.org/en-US/docs/Web/API/Location/reload) method of the browser or via a dedicated function from [`{selenider}`](https://ashbythorpe.github.io/selenider/reference/reload.html).

```r
Page <- R6::R6Class(
  public = list(
    driver = NULL,
    selenider = NULL,
    initialize = function(app) {
      self$driver <- shinytest2::AppDriver$new(app)
      self$selenider <- selenider::selenider_session(
        driver = self$driver,
        local = FALSE
      )
    },
    # Refresh the page
    reload = function() {
      self$driver$run_js("window.location.reload()")
      # Or we can use:
      # selenider::reload(self$selenider)
    },
    # Close the connection, free resources
    stop = function() {
      self$driver$stop()
    }
  )
)
```

### Let's add page-specific methods.

Extending the base page object, we add methods to interact with the specific app/module we're developing. We introduce methods that we described the page with using tests. The two things we can do on that page is increment the counter and expect that it bumps the number.

We assume there will be an element with a `data-test` attribute that increments the counter and an element with a `data-test` attribute that displays the counter value.

We can use functions from `{selenider}` to interact with the page. It provides functions that allow more control over interactions with the browser than `shinytest2`.

```r
CounterPage <- R6::R6Class(
  inherit = Page,
  public = list(
    increment = function() {
      self$selenider |>
        selenider::find_element("[data-test=increment]") |>
        selenider::elem_click()
    },
    expect_value = function(target) {
      self$selenider |>
        selenider::find_element("[data-test=increment-value]") |>
        selenider::elem_expect(\(x) selenider::has_exact_text(x, target))
    }
  )
)
```

---

💡 **Notice how this approach is separated from components IDs and Shiny namespaces.**

It doesn't matter if it's a nested module or a standalone app. Targeting elements in tests is separated from IDs in production code. This approach allows us to grow the production code, without having to go back and refactor selectors in tests.

[See how to do it for any component in Shiny.](../robust-targetting-of-html-for-tests/)

---

The last function we need in tests is `open_page` function. It only initializes the drivers and stops the app just before the test case finishes running.

```r
open_page <- function(app = test_app(), page_object = CounterPage) {
  page <- page_object$new(app)
  withr::defer(page$stop(), parent.frame(2))
  page
}
```

### Having code that drives the app in place, we can implement the app itself.

In this case, it's a simple Shiny app, but it could also be a Shiny module.

```r
test_app <- function() {
  shiny::shinyApp(
    ui = shiny::fluidPage(
      shiny::actionButton(
        "btn",
        label = "Calculate",
        `data-test` = "increment"
      ),
      shiny::textOutput(
        "text",
        container = function(...) {
          shiny::div(
            `data-test` = "increment-value",
            ...
          )
        }
      )
    ),
    server = function(input, output, session) {
      output$text <- shiny::renderText(input$btn)
    }
  )
}
```

Putting this all together satisfies tests. 🎉

- Each test case initializes its own app.
- Each test cleans up after itself.
- It works as expected, tests are green 🟢.

### Now let's see how we can optimize it.

By modifying the `open_page` function we can make it initialize the page only once.

We can create a closure that will initialize the driver only on the first run and refresh the page on subsequent runs before returning the page object.

```r
make_page <- function(app = test_app(), page_object = CounterPage) {
  page <- NULL
  function() {
    if (is.null(page)) {
      page <<- page_object$new(app)
    } else {
      page$reload()
    }
    page
  }
}
```

With this approach, we can initialize the page once for a series of test cases. Notice how the code inside test cases doesn't change, we only added 2 lines in the common part of the setup.

```r
describe("CounterPage", {
  open_page <- make_page()
  withr::defer(open_page()$stop())

  it("should increment the counter once", {
    # Arrange
    page <- open_page()

    # Act
    page$increment()

    # Assert
    page$expect_value("1")
  })

  it("should increment the counter many times", {
    # Arrange
    page <- open_page()

    # Act
    page$increment()
    page$increment()

    # Assert
    page$expect_value("2")
  })
})
```

After this change, all test cases reuse the same application instance, but each test case is still independent. The page is refreshed in the setup part of each test case. There is only one cleanup, just before we exit the `describe` block.

### Let's compare the performance of the two approaches.

<details>
  <summary>
  Benchmark code
  </summary>

```r
result <- bench::mark(
  iterations = 10,
  unoptimized = describe("CounterPage", {
    it("should increment the counter once", {
      # Arrange
      page <- open_page(test_app())

      # Act
      page$increment()

      # Assert
      page$expect_value("1")
    })

    it("should increment the counter many times", {
      # Arrange
      page <- open_page(test_app())

      # Act
      page$increment()
      page$increment()

      # Assert
      page$expect_value("2")
    })
  }),
  optimized = describe("CounterPage", {
    open_page <- make_page(test_app())
    withr::defer(open_page()$stop())

    it("should increment the counter once", {
      # Arrange
      page <- open_page()

      # Act
      page$increment()

      # Assert
      page$expect_value("1")
    })

    it("should increment the counter many times", {
      # Arrange
      page <- open_page()

      # Act
      page$increment()
      page$increment()

      # Assert
      page$expect_value("2")
    })
  })
)

result |>
  dplyr::select(expression, min:total_time) |>
  knitr::kable()
```

</details>

| expression  |   min | median |   itr/sec | mem_alloc |   gc/sec | n_itr | n_gc | total_time |
| :---------- | ----: | -----: | --------: | --------: | -------: | ----: | ---: | ---------: |
| unoptimized | 2.89s |  3.39s | 0.2984827 |     207MB | 1.999834 |    10 |   67 |      33.5s |
| optimized   | 1.63s |  2.09s | 0.4800020 |     114MB | 2.160009 |    10 |   45 |      20.8s |

We can see that the initialization takes an additional second of running, even for this simple, small example. With more complex applications/modules and more test cases added, the startup of the app can significantly increase the time it takes to finish running the tests.

The quicker the feedback from tests, the more useful they are.

**This technique can be an easy starting point for tests optimization.**

---

<div class="font-bold text-center">
Key takeaways
</div>

- Writing tests first made us abstract each action. Tests don't know how the page is provided, it can be started up for each case, or reloaded. It doesn't impact the test code, it only knows that the page is opened.
- It takes a moment to start a Shiny server, a page refresh can be a quicker option if it ensures clean state of the app.
- Refreshing the page instead of starting up a new application is a simple change if the test setup code is abstracted well. It can be a good starting point for tests optimization.

---
<div class="font-bold text-center">
⚠️ Be careful ⚠️
</div>

- After refreshing the page, some methods of `shinytest2::AppDriver` no longer work (or at least I couldn't get them to work), but functions from [{selenider}](https://ashbythorpe.github.io/selenider/) work. This might have something to do with how `AppDriver` methods communicates with the browser:
> Error in `app_get_values()`:
! Shiny server returned 404 for values URL: http://127.0.0.1:6228/session/2bc7bb3e48e6a94ec7f3b3a61f914eb2/dataobj/shinytest?w=&nonce=ad001b462&input=1&output=1&export=1&format=rds&sortC=1
ℹ Is `shiny::runApp(test.mode = TRUE)` enabled?
- When running `testthat` tests in parallel, [test files are run in parallel](https://testthat.r-lib.org/articles/parallel.html#basic-operation). Sharing an app instance between test files introduces a risk of tests interfering with each other, leading to flaky tests.
- If there is logic that restores the state of the app after a refresh implemented, when the app stores some persistent data that will be displayed during the next session, you won't obtain a clean state by only refreshing the page.
