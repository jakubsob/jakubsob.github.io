---
title: 'Behavior-Driven Development in R Shiny: A Step-By-Step Example'
description: 'Follow each step as I develop a form with Shiny and Behavior-Driven Development. Learn practical techniques for better software design through automated tests.'
pubDate:  'October 10 2025'
tags: ["r", "tests", "bdd", "shiny", "shinytest2"]
---

Testing your Shiny applications shouldn't be an afterthought.

Many developers write tests after building features, missing the core benefit of test-first development: **tests as design tools**. I'll walk you through how I built a small content submission form using Behavior-Driven Development (BDD), starting from absolutely nothing.

Whether you're building a new app or adding a feature, the steps are the same.

Follow along and see how tests drive design decisions, keep business value visible, and make refactoring safe.

> [Level-up your testing game! Grab your copy of the R testing roadmap.](https://jakubsobolewski.com/get-roadmap/)

## 1. Writing the First Specification

The app's purpose we're about to build is to **submit data that another app will display**.

BDD starts with a high-level specification describing the behavior we want to see. The first specification is the most important. It describes the core behavior that delivers value to users.

We have 2 choices for writing specifications:

1. In R, using `testthat`. We have a full freedom to design our own domain-specific language (DSL) for expressing specifications.
2. In Gherkin syntax, using `cucumber`. We are constrained to Cucumber syntax, but we can write specifications in a plain text format that even non-programmers can write.

In this example, I choose to express specifications in R, using `testthat`. **Behavior-Driven Development is not about tools.** You can use any testing framework you like (or none!)

Here's how we can express the first specification using `describe` and `it` from `testthat`:

```r
#' tests/testthat/test-acceptance-data_submission.R
describe("data submission", {
  it("should submit entry to storage", {
    given_no_content() |>
      when_i_submit_entry_with_all_required_fields() |>
      then_there_are_entries(n = 1)
  })
})
```

or we could use `testthat::test_that`:

```r
#' tests/testthat/test-acceptance-data_submission.R
test_that("data submission should submit entry to storage", {
  given_no_content() |>
    when_i_submit_entry_with_all_required_fields() |>
    then_there_are_entries(n = 1)
})
```

**It doesn't matter which `testthat` functions you choose.**

Notice the language used. I describe actions from the user's perspective, staying high-level:

- without naming UI elements,
- without naming how data is stored.

I don't care about implementation details yet. **I care about behavior**. This specification doesn't even reveal that this will be a Shiny app. It could as well be a package that provides a function to submit content.

1. "Given no content" - the system starts empty.
2. "When I submit entry with all required fields" - I don't care about the actual values, just that they're valid and needed for this flow.
3. "Then there are entries" - this checks if entries were added to the storage. **This is the primary goal**.

---

💡 You can also use [Cucumber](https://github.com/jakubsob/cucumber) for writing specifications in Gherkin syntax.

The specification would become:

```gherkin
Feature: Data submission
  Scenario: Submit entry to storage
    Given no content
    When I submit entry with all required fields
    Then there are 1 entries
```

Then you just swap DSL functions with `cucumber::given`, `cucumber::when`, and `cucumber::then` step functions. The rest of the approach remains the same.

---

**You might wonder, what are those functions that I've used? They don't exist yet, and that's the point.**

In test-first development, we start from interfaces we wish we had. It allows us to experiment how to express intent without writing actual implementation. We'll use the same approach in the next steps to **design the code**.

## 2. Building the Test Infrastructure

Having written down the first specification, I will now imagine what those functions should do in more details.

```r
#' tests/testthat/setup-dsl.R
given_no_content <- function(driver, context = new.env()) {
  storage <- make_storage()
  context$driver <- make_driver(storage = storage)
  context$storage <- storage
  context
}

when_i_submit_entry_with_all_required_fields <- function(context) {
  context$driver$fill_required_fields(
    url = "https://example.com/",
    title = "Example"
  )
  context
}

then_there_are_entries <- function(context, n) {
  expect_equal(context$storage$size(), n)
  context
}
```

**You might wonder again, what are those functions that I've used? They don't exist yet, and that's the point.**

I imagine:

- There will be a `make_storage()` function to connect to the storage. I don't even know what storage it will be: database, file, in-memory? Doesn't matter now.
- There will be a `make_driver` function that will generate a driver that will be used to interact with the code. I imagine the driver will have a method `fill_required_fields()` to simulate user input. If the implementation is in Shiny, maybe it'll use `shinytest2`, maybe something else. If the implementation of the system would be a package, this object would just wrap package functions and execute them. Doesn't matter now.
- That the storage object will have a `size()` method to check how many entries are stored. Again, I don't care how it's implemented. The interface exposes a behavior I want to test. I don't even know how the data will be represented - table rows, documents? Doesn't matter now. I will design it later once I discover what structure it'll be. I don't design it upfront. What matters is that I can check how many entries are there with `size()` method.

Each function we're building specification with expresses a part of a behavior I care about.

- In `given_no_content`, I prepare preconditions: empty storage, startup of the system.
- In `when_i_submit_entry_with_all_required_fields`, I simulate user interaction.
- In `then_there_are_entries`, I assert the storage has the entry.

**The storage is my system boundary** - the only responsibility of the system is to save submitted content to storage. Maybe the end-to-end process is that this submitted content is displayed in another app, but that's outside the scope of this system.

**This is not an E2E test, it's an acceptance test that checks only what's under control of this system.**

## 3. Implementing Driver

Given that I've decided it will be a Shiny app, I can implement `make_driver` with `shinytest2`. I extend shinytest2 with domain-specific methods.

```r
#' tests/testthat/setup-driver.R
ShinyDriver <- R6::R6Class(
  inherit = shinytest2::AppDriver,
  public = list(
    fill_required_fields = function(url = NULL, title = NULL) {
      self$set_inputs(
        url = url,
        title = title
      )
      self$click(input = "submit")
    }
  )
)

make_driver <- function(storage) {
  ShinyDriver$new(options = list(storage = storage))
}
```

This hides implementation details. If required fields change, I add parameters. If input IDs change, I update them here. If I decide to not use `set_inputs()` it doesn't affect the specification.

The test only knows that you need to pass `url` and `title` to fill required fields.

Note that filling required fields consists of setting inputs and clicking the submit button. It's an implementation of a behavior, not just interacting with the UI.

Implementing your tests like this groups related actions together, making tests more expressive.

---

💡 The driver is a layer responsible for interacting with the system under test.

It could return a different driver if the implementation of the system changes. It could as well be a driver for a command-line interface, or an API client. The specification doesn't care, it'll remain the same as long as the business behavior remains unchanged.

If it was an API, the `fill_required_fields` method could make an POST request to submit data.

---

## 4. Implementing The App

Now I finally have enough test code to start implementing the actual system, let's start with implementing the Shiny app the driver can interact with:

```r
#' app.R
app_ui <- function() {
  fluidPage(
    textInput("url", "URL"),
    textInput("title", "Title"),
    actionButton("submit", "Submit")
  )
}

app_server <- function(input, output, session) {
  storage <- getOption("storage", make_storage())
  observeEvent(input$submit, {
    data <- make_storage_item(url = input$url, title = input$title)
    storage$add(data)
  })
}

shinyApp(app_ui(), app_server)
```

Note the `getOption("storage")` pattern - this lets me inject storage during testing while keeping flexibility to use a different storage in production.

We still don't have the storage code, so the specification will still fail. Here I imagine I have an extra `make_storage_item()` function to create a storage item from form inputs.

## 5. Implementing Storage

Let's start with the simplest storage that works:

```r
#' R/storage.R
Storage <- R6::R6Class(
  private = list(
    store = NULL,
    schema = tibble::tibble(
      url = character(),
      title = character()
    )
  ),
  public = list(
    initialize = function(store = cachem::cache_disk("store")) {
      private$store <- store
    },
    add = function(x) {
      item <- tibble::tibble(
        url = x$url,
        title = x$title
      )
      items <- private$store$get("items", private$schema)
      private$store$set("items", dplyr::bind_rows(items, item))
      self
    },
    size = function() {
      nrow(private$store$get("items", private$schema))
    }
  )
)

make_storage_item <- function(url, title) {
  list(
    url = url,
    title = title
  )
}

make_storage <- function() {
  Storage$new()
}
```

**Now this is enough to make the first specification pass! ✅**

## 6. Second Specification

Then I create a specification for filling all fields, not just required ones:

```r
it("should add entry with all fields", {
  given_no_content() |>
    when_i_submit_entry_with_all_fields() |>
    then_there_are_entries(n = 1)
})
```

I reuse existing infrastructure but extend the DSL with `when_i_submit_entry_with_all_fields`.

The internals of the function say what fields are available and filled:

```r
when_i_submit_entry_with_all_fields <- function(context) {
  context$driver$fill_all_fields(
    url = "https://example.com/",
    title = "Example",
    description = "An example entry"
  )
  context
}
```

```r
ShinyDriver <- R6::R6Class(
  inherit = shinytest2::AppDriver,
  public = list(
    # fill_required_fields = function(...) { ... },
    fill_all_fields = function(url = NULL, title = NULL, description = NULL) {
      self$set_inputs(
        url = url,
        title = title,
        description = description
      )
      self$click(input = "submit")
    }
  )
)
```

and add the extra field to the app and storage:

```r
app_ui <- function() {
  fluidPage(
    textInput("url", "URL"),
    textInput("title", "Title"),
    textInput("description", "Description"),  # New field
    actionButton("submit", "Submit")
  )
}
```

```r
Storage <- R6::R6Class(
  private = list(
    store = NULL,
    schema = tibble::tibble(
      url = character(),
      title = character(),
      description = character()  # New field
    )
  ),
  public = list(
    # initialize = function(...) { ... },
    add = function(x) {
      item <- tibble::tibble(
        url = x$url,
        title = x$title,
        description = x$description  # New field
      )
      items <- private$store$get("items", private$schema)
      private$store$set("items", dplyr::bind_rows(items, item))
      self
    },
    # size = function(...) { ... }
  )
)
```

The specification is green! ✅

---

### Let's pause here and reflect on what we've done.

We've worked our way outside-in, starting from high-level behaviors and working down to implementation details:

- We started with high-level specifications describing user value without implementation details.
- We designed interfaces (driver, storage) that express behaviors we care about.
- We implemented the simplest possible Shiny app and storage that satisfy these specifications.

Additionally:

- We've written 2 specifications for the most important behaviors. This is easily the minimum viable set of behaviors that deliver value.
- We've implemented a testing infrastructure that lets us express these behaviors without caring about implementation details. If our project moves to different implementation, we can just swap the driver and storage implementations without changing the specifications.
- We've implemented the simplest possible Shiny app that passes these specifications.

We have an automated safety net that ensures the app delivers the expected behaviors.

It's a solid foundation to build upon.

Now, with the interfaces we've established, we can add more realistic storage (e.g., database, API) and more complex app features (e.g., validation, feedback) while keeping the core behaviors intact.

---

## 7. Storage Evolution

We have specifications that ensure the app works.

Now we can move to the lower-level details and use TDD to evolve the storage implementation. We will use the same interface, so the integration with the app remains unchanged.

In tests we can still use the simple disk cache storage, but in production we can switch to a more robust solution, like a database or an API.

When working on the storage, we ensure specifications stay green throughout - **that's the safety net**.

## 8. Working on Interface Nuances

In specifications, we've abstracted away from UI details. But as we build the app, we need to consider user experience.

It's easy to imagine that some form validation would be useful. Users should not be able to submit the form with empty required fields.

Now we have a choice to make:

- Add new specification to cover validation behavior
- Add lower-level tests to cover validation logic

The choice depends on how we view validation from the user's perspective. Is it a core behavior that users care about, or an implementation detail?

### If we decide it's core behavior

Then we can add it as a new specification:

```r
it("should require all required fields", {
  given_no_content() |>
    when_i_submit_entry_with_missing_required_fields() |>
    then_i_am_prompted_to_provide_required_fields()
})
```

This specification doesn't say "I see error messages next to input fields". It says "I'm prompted to provide required fields". This leaves room for different implementations.

It will work for a Shiny app, a command-line interface, or even an API that returns validation errors.

Remember to not couple specifications to implementation details.

If we decide to implement this specification, remember to only cover the behavior. Focusing on edge cases, text of error messages, when they appear, etc. are all implementation details. Those cases don't belong in specifications.

Push those tests down to lower levels (e.g. module tests, unit tests).

### If we decide it's an implementation detail

Then we can add lower-level tests to cover validation logic.

To do that, we should refactor the form into a Shiny module so that it can be tested in isolation.

```r
mod_form_ui <- function(id) {
  # UI elements here
}

mod_form_server <- function(id) {
  moduleServer(id, function(input, output, session) {
    # Form logic here
    # Validation logic here
    # Return form data
  })
}
```

You'll notice some **problems** with this approach: modularization breaks specifications due to namespacing. We can't use IDs directly in the driver of specifications.

The **solution** is to apply techniques for [robust shinytest2 testing](https://jakubsobolewski.com/blog/robust-shinytest2/), making tests resilient to UI changes.

After refactoring, acceptance tests remained green. **Safe to proceed.**

Then we can cover edge cases in module-level tests:

- Test submitting with missing required fields
- Test submitting with invalid fields
- Tests submitting when storage is not available

**Remember to push as many tests as possible to the lowest level** (e.g. unit test level)

The goal is to have fast feedback loops. If we rely only on specifications, tests will be slow, brittle and specifications will grow in number and complexity. This is the easiest way to shoot yourself in the foot.

Always prefer to push a test down the [testing pyramid.](https://martinfowler.com/articles/practical-test-pyramid.html)

## The Outside-In Journey

It was a test-first, outside-in journey:

- **Start with high-level goals**: work down to implementation details.
- **Start with simplest implementation**: add complexity as needed.
- **Refactor continuously**: keep specifications working, feedback loops short.

Following this approach, we achieved several benefits:

- **Tests drive design decisions.** Each failing test forced architectural choices. Storage patterns, module structure, DSL design - all emerged from test needs.
- **Business value stays visible.** Any person should be able to read specifications and understand what the app does.
- **Implementation details get appropriate testing levels.** Form validation gets fast module tests. Storage gets unit tests. User workflows get specifications.
- **Refactoring becomes safe.** Green specifications mean user value stays intact while you improve code.

## Try This Yourself

You don't have excuses anymore. Here's your playbook:

1. Write one acceptance test describing user value (it must fail)
2. Build just enough infrastructure to run it (it must fail)
3. Implement the simplest solution that passes (make it pass)
4. Refactor when tests provide safety (keep it passing)

**Start today.** Pick a feature. Write the specification first. See how it guides your design.

Don't wait for a new project to start from scratch. You can do it for a module just as well.

Your users will thank you.

Your future self will thank you.

Your test suite will actually mean something.

## Further Reading

To dive deeper into concepts used here, check out my other articles:

- [The cadence of Behavior-Driven Development](https://jakubsobolewski.com/blog/bdd-cadence/)
- [Techniques for resilient UI tests](https://jakubsobolewski.com/blog/robust-shinytest2/)
- [Designing testable R6 classes](https://jakubsobolewski.com/blog/testable-r6-interfaces/)
- [Unit testing vs acceptance testing](https://jakubsobolewski.com/blog/2-aspects-of-software-quality/)
- [Focus on behavior with TDD](https://jakubsobolewski.com/blog/how-tdd-helps-you-build-the-right-thing/)
