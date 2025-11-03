---
title: 'Behavior-Driven Development in R Shiny: Setting Up Test Preconditions with Given Steps'
description: 'Learn how to set up test preconditions in Shiny BDD using Given steps. Master dependency injection, test doubles, and composable setup patterns for reliable R testing.'
pubDate:  'Nov 3 2025'
tags: ["r", "tests", "bdd", "shiny", "shinytest2"]
---

As the system grows, there are more moving parts to manage.

External services, databases, and feature flags all introduce complexity. To keep specifications reliable and maintainable, we need a structured way to set up the system state before interactions happen, so that we know precisely what we're testing.

This is what the Given keywords are for.

---

This article is continuation of the previous article on building a Shiny app using Behavior-Driven Development (BDD). There we built a data submission form using Behavior-Driven Development. We wrote specifications that described user behaviors and implemented just enough code to make them pass.

Read it to get up to speed on BDD for Shiny apps, or continue here to focus on how to setup complex preconditions using Given steps.

**[Behavior-Driven Development in R Shiny: A Step-By-Step Example](https://jakubsobolewski.com/blog/bdd-shiny-feature/)**

---

> [Level-up your testing game! Grab your copy of the R testing roadmap.](https://jakubsobolewski.com/get-roadmap/)

## The Purpose of Given

Given steps answer one question: **What is the state of the system before I interact with it?**

They set up preconditions like:

- Test data in storage
- External service configurations
- Feature flags or application settings

Let's build on our previous example.

Let's imagine we need to send an email notification when a new entry is submitted. This introduces an external dependency: an email service.

Before we can test that behavior, we need to:

- Set up storage (where will the data go?)
- Configure the email service (which provider? what credentials?)
- Define who the current user is (who's submitting the form?)

We can control these preconditions using Given steps.

## Building on the Data Submission Form

Let's extend the form from the previous article.

Now, when someone submits an entry, the app sends an email notification to a designated recipient. This adds a new external dependency: an email service.

Here's a specification that describes this behavior:

```r
#' tests/testthat/test-acceptance-email_notification.R
describe("email notification", {
  it("should send email when entry is submitted", {
    given_no_content() |>
      given_an_authenticated_user() |>
      given_email_service_is_available() |>
      when_i_submit_entry_with_all_required_fields() |>
      then_email_notification_is_sent()
  })

  it("should handle email service failure gracefully", {
    given_no_content() |>
      given_an_authenticated_user() |>
      given_email_service_is_unavailable() |>
      when_i_submit_entry_with_all_required_fields() |>
      then_i_am_informed_email_was_not_sent()
  })
})
```

> If you prefer plain-text specifications, you can express them using Cucumber-style feature files and use [cucumber](https://jakubsobolewski.com/cucumber/) package to run them.

Notice we have **three Given steps** in the first specification. Each sets up a different part of the system:

- `given_no_content()` sets up storage
- `given_an_authenticated_user()` sets up the current user with their email
- `given_email_service_is_available()` sets up the email service

This separation is intentional.

It lets us compose different preconditions for different scenarios. In the second specification, we swap `given_email_service_is_available()` for `given_email_service_is_unavailable()` to test failure handling. We might also test what happens for unauthenticated users, if this is an intended behavior that needs to be implemented.

## Implementing Given Steps

You might wonder: we can set up something separate to the app, but how do we pass this configuration to the Shiny app when it launches?

We make Given steps collect configuration that will be passed to the Shiny app. We can store this configuration in a context that will be available when the app starts.

Here's how we can implement the storage precondition:

```r
#' tests/testthat/setup-dsl.R
given_no_content <- function(context = new.env()) {
  context$storage <- make_storage(
    type = "disk",
    store = cachem::cache_disk(tempdir())
  )
  context
}
```

This creates an in-memory disk-based storage and the storage object is stored in `context$storage`.

Now for the authenticated user precondition:

```r
given_an_authenticated_user <- function(
  context = new.env(),
  email = "user@example.com"
) {
  context$user <- email
  context
}
```

This sets up a user with their email address that will be used for sending notifications. It's just an email as it suffices for our purposes. It could be a more complex object if needed. If needed, this step could also create a user in a service that we use for authentication, or we could create the authentication service test double here, with this user pre-configured.

And here are the email service preconditions:

```r
given_email_service_is_available <- function(context = new.env()) {
  context$email_service <- structure(
    list(
      send_email = function(from, to, content) {
        list(success = TRUE, error = NULL)
      }
    ),
    class = "EmailService"
  )
  context
}

given_email_service_is_unavailable <- function(context = new.env()) {
  context$email_service <- structure(
    list(
      send_email = function(from, to, content) {
        list(success = FALSE, error = "Server error")
      }
    ),
    class = "EmailService"
  )
  context
}
```

- `given_email_service_is_available()` creates an interface that mimics a working email service.
- `given_email_service_is_unavailable()` creates an interface that simulates a failure when sending emails.

Notice we're not launching the Shiny app yet. We're just collecting configuration.

## Passing Options to shinytest2

The context object accumulates configuration from each Given step. When we're ready to interact with the app (in a When step), we start the driver and pass this configuration.

Here's the helper function that starts the driver:

```r
#' tests/testthat/setup-dsl.R
.start_driver <- function(context) {
  if (is.null(context$driver)) {
    context$driver <- ShinyDriver$new(
      app = "path/to/app",
      options = list(
        storage = context$storage,
        email_service = context$email_service,
        user = context$user
      )
    )
  }
  context
}
```

This function is called by When steps right before they interact with the app:

```r
when_i_submit_entry_with_all_required_fields <- function(context) {
  .start_driver(context)  # App launches here
  context$driver$fill_required_fields(
    url = "https://example.com/",
    title = "Example"
  )
  context
}
```

**The app launches lazily, only when we need to interact with it.**

This is crucial. If we launched the app in Given steps, we'd need a much smarter mechanism for launching the app. By delaying the launch until the first When step, we can compose multiple Given steps and start the app once with all configuration in place.

The app launches with the collected options, if something was not defined explicitly, default values defined in the app code are used.

## Understanding the `options` Parameter

When we call `ShinyDriver$new(options = list(...))` (which inherits from [`shinytest2::AppDriver`](https://rstudio.github.io/shinytest2/reference/AppDriver.html#method-new-)) we're passing objects to another R process where the Shiny app runs. This is key to understanding what we can and cannot pass.

But when we're extending `AppDriver`, we can make all available all options more explicit, by making them arguments of the constructor:

```r
#' tests/testthat/setup-driver.R
MyAppDriver <- R6::R6Class(
  classname = "MyAppDriver",
  inherit = ShinyDriver,
  public = list(
    initialize = function(
      app,
      storage = make_storage(),
      email_service = make_email_service(),
      user = NULL,
      ...
    ) {
      super$initialize(
        app = app,
        options = list(
          storage = storage,
          email_service = email_service,
          user = user
        ),
        ...
      )
    }
  )
)
```

It'll make it clearer what options are expected by the app and what should be set up in specifications.

The `options` list becomes available in the app through `getOption()`:

```r
#' app.R
app_server <- function(input, output, session) {
  storage <- getOption("storage", make_storage())
  email_service <- getOption("email_service", make_email_service())
  user <- getOption("user", session$user)
  # ... rest of server code
}
```

This pattern provides defaults (`make_storage()` and `make_email_service()`) while allowing tests to inject specific implementations through options. The user's email is used as the sender when notifications are sent.

### Limitations of Passing Objects Between Processes

Not all objects can be transferred between R processes. When `shinytest2` starts your app, it serializes the `options` list, sends it to the new process, and deserializes it there.

This means objects like database connections (`DBI`, `dbplyr`) cannot be passed directly. Instead, pass configuration parameters and create the connections inside the app process.

## Implementing the Email Service

Let's look at the email service implementation that makes this testing possible:

```r
#' R/email_service.R
EmailService <- R6::R6Class(
  classname = "EmailService",
  public = list(
    send_email = function(from, to, content) {
      rlang::abort("Not implemented")
    }
  )
)

EmailServiceBlastula <- R6::R6Class(
  classname = "EmailServiceBlastula",
  inherit = EmailService,
  public = list(
    send_email = function(from, to, content) {
      tryCatch(
        {
          blastula::smtp_send(
            email = content,
            to = to,
            from = from,
            subject = "New Entry Submitted",
            credentials = blastula::creds_envvar(
              user = Sys.getenv("SMTP_USER"),
              pass_envvar = "SMTP_PASSWORD",
              host = Sys.getenv("SMTP_HOST", "smtp.gmail.com"),
              port = as.integer(Sys.getenv("SMTP_PORT")),
              use_ssl = as.logical(Sys.getenv("SMTP_USE_SSL"))
            )
          )
          list(success = TRUE, error = NULL)
        },
        error = function(e) {
          list(success = FALSE, error = conditionMessage(e))
        }
      )
    }
  )
)

make_email_service <- function(type = "blastula") {
  switch(
    type,
    blastula = EmailServiceBlastula$new(),
    rlang::abort(sprintf("Unknown email service type: %s", type))
  )
}
```

The base `EmailService` class defines the interface. It is the same interface we used in tests. `EmailServiceBlastula` is the production implementation using the `blastula` package.

In tests, we can use a fake implementation that behaves exactly as needed for tests. In production, the app uses `EmailServiceBlastula` by default.

## Setting Up Test Data

Sometimes you need more than an empty state. You might test how the app behaves when data already exists:

```r
given_existing_entries <- function(context = new.env()) {
  context$storage <- make_storage(
    type = "disk",
    store = cachem::cache_disk(tempdir())
  )
  context$storage$add(
    make_storage_item(
      url = "https://google.com",
      title = "Google",
      description = "Search engine"
    )
  )
  context$storage$add(
    make_storage_item(
      url = "https://github.com",
      title = "GitHub",
      description = "Code hosting"
    )
  )
  context
}
```

Then test how the app lists existing entries:

```r
it("should display existing entries", {
  given_existing_entries() |>
    given_an_authenticated_user() |>
    given_email_service_is_available() |>
    then_there_are_entries_displayed(n = 2)
})
```

## The Pattern in Practice

Let's see the full flow of a specification:

1. **Given steps** collect configuration in a context object
2. **First When step** calls `.start_driver()` which launches the app with collected configuration
3. **Subsequent When steps** interact with the running app
4. **Then steps** make assertions about the app's state or behavior

```r
it("should save entry and send notification", {
  # Step 1: Set up preconditions
  given_no_content() |>
    given_an_authenticated_user() |>
    given_email_service_is_available() |>

    # Step 2: First When launches app with configuration
    when_i_submit_entry_with_all_required_fields() |>
    # Inside: .start_driver(context) creates driver with options
    # Then: interacts with app

    # Step 3: Make assertions
    then_there_are_entries(n = 1) |>
    then_email_notification_is_sent()
})
```

The beauty of this pattern is that Given steps can be developed, and reused independently. They're pure setup code with no side effects beyond setting context properties.

## Why This Approach Works

This pattern for Given steps provides several benefits:

- **Reliability**: Tests don't depend on external services. Email doesn't need to actually send. Databases can be in-memory or local. When we write code test-first, we don't focus on connecting to real services right away, it's actually easier to create test doubles first, making tests way more reliable.
- **Speed**: Fake services respond instantly. No network latency, no waiting for external servers. We can write tests focused on testing their availability elsewhere. Or if you want to test timeouts, just program them into the test double. But save this for unit tests, acceptance tests should focus on user-visible behaviors, so avoid testing implementation details like timeouts unless they directly impact user experience (like changing the user flow – e.g. being redirected to an error page, or being prompted to submit an error report).
- **Isolation**: Each test starts with a clean state. You can see what preconditions are set up. Make sure resources are cleaned up after tests (e.g., temporary files deleted).
- **Readability**: Each Given step clearly states what it sets up. Specifications read like documentation.
- **Composability**: Mix and match Given steps to create different scenarios without duplicating setup code. Code reusability is built-in in this pattern.

## When Given Steps Get Complex

If a Given step becomes too complex, it's a signal that the setup might be too complicated. Consider:

### Breaking it into smaller Given steps

```r
# Instead of:
given_complex_state <- function(context) {
  # 50 lines of setup
}

# Do:
given_storage_with_sample_data() |>
  given_email_service_configured() |>
  given_an_authenticated_user() |>
  given_feature_flags_set()
```

### Creating helper functions

```r
given_existing_entries <- function(
  context = new.env(),
  entries = default_entries()
) {
  context$storage <- make_storage(
    type = "disk",
    store = cachem::cache_disk(tempdir())
  )
  context$storage$clear()
  for (entry in entries) {
    context$storage$add(entry)
  }
  context
}

default_entries <- function() {
  list(
    make_storage_item(url = "https://google.com", title = "Google"),
    make_storage_item(url = "https://github.com", title = "GitHub")
  )
}
```

### Extracting fixtures

```r
#' tests/testthat/setup-fixtures-sample_entries.R
sample_entries <- list(
  make_storage_item(url = "https://google.com", title = "Google"),
  make_storage_item(url = "https://github.com", title = "GitHub"),
  make_storage_item(url = "https://stackoverflow.com", title = "Stack Overflow")
)
```

## Wrapping Up

The Given keyword is where you control your test environment. By carefully setting up preconditions through composable Given steps, you make tests reliable, fast, and maintainable.

**Start small.**

**Add Given steps as you discover new preconditions.**

**Keep steps focused and composable.**

With this approach, your BDD specifications for Shiny apps will remain robust and easy to maintain as your application grows in complexity.
