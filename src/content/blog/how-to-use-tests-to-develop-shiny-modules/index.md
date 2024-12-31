---
title: 'Developing Shiny Modules with Test-Driven Development'
description: 'Learn how to use tests to develop Shiny modules efficiently, ensuring faster development cycles and better modularization.'
pubDate: 'Mar 3 2024'
tags: ["r", "tests", "tdd", "shiny"]
---

**I don’t have tests for all Shiny modules and I’m fine with that.** 😎

What I do instead is ensure I have tests for all Shiny modules that encapsulate a feature. Something that makes sense on its own. It might be a whole page or a section of it.

If it’s a “support” module that provides a piece of functionality I don’t always have tests for it. Sometimes it’s just not worth it, especially when you learn that you need to refactor a lot of internals of the app after the client changes their minds…

**An important part of development is to decide on how we want to interact with the feature.**

This is when I introduce an R6 class that has an interface that describes how can I interact with the page. It also serves another purpose – it hides information on how we interact with the page, making it easier to refactor tests when implementation details of the page change. You can read more about it [here](../acceptance_test_driven_development_of_shiny_modules/).

**What is also important to me, is to be able to quickly run and inspect a module manually.**

That’s why I put at the top of the test file a definition of a Shiny app that runs just the tested module. It helps me with:
- 🐛 Debugging: I can quickly access the problematic part of the app and see what’s wrong. If the bug doesn’t happen in isolation I can check what is different in my setup compared to the situation when the bug happens. I can then replicate the problematic setup and add a test for it.
- 🎨 Updating styles: I can quickly reload that part of the app and see changes live. This is especially beneficial for apps that need some time to load or features that require a lot of setups steps to access them.
- 📦 Modularization: I can easily see what data/objects/configs are needed to run it. This approach forces you to into using dependency injection. If a module relies on globals, you'll see how awkward test setup is.

⏳ **It all translates to quicker development cycles.**

No more reloading of the whole app just to see some changes. Take back your precious time.

Check out below what that looks like in practice.


```r
test_app <- function() {
  shinyApp(
    ui = dataset_summary_ui(id = NULL),
    server = function(input, output, session) {
      dataset_summary_server(
        id = NULL,
        datasets = list(
          iris = iris,
          mtcars = mtcars,
          diamonds = diamonds
        )
      )
    }
  )
}

if (interactive()) {
  test_app()
}

DatasetSummary <- R6::R6Class(
  classname = "DatasetSummary",
  private = list(
    driver = NULL
  ),
  public = list(
    initialize = function(app) {
      private$driver <- shinytest2::AppDriver$new(app)
    },
    select = function(name) {
      private$driver$set_inputs(dataset_select = name)
    },
    expect_summary = function() {
      # ...
    }
  )
)

test_that(
  "Scenario: A user can preview a summary of the selected dataset.

  Given: User is at the summary section.

  When: User selects the 'iris' dataset.

  Then: User can see a summary of the 'iris' dataset.", {
  # Given
  app <- DatasetSummary$new(test_app())

  # When
  app$select("iris")

  # Then
  app$expect_summary()
})
```

Notice that I reuse the interactive app in tests (I pass it to my PageObject). This is what ensures that the module is always runnable. If tests are green, then I know I can run this module interactively in isolation.
