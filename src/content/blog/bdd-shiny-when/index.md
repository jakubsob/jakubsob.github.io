---
title: 'Behavior-Driven Development in R Shiny: Writing When Steps That Model User Behavior'
description: 'Learn how to write When steps that describe user actions without leaking implementation details. Build a clean DSL that survives UI refactors and keeps specifications readable.'
pubDate: 'May 22 2026'
tags: ["r", "tests", "bdd", "shiny", "shinytest2"]
draft: true
---

A specification tells a story.

Given describes the world before the action. When describes the action itself. Then describes what changed as a result.

If Given is the setup and Then is the payoff, When is where the plot happens — and how you write it determines whether your specifications stay readable for months or decay after the very first change you make to your project.

------------------------------------------------------------------------

This article is part of a series on Behavior-Driven Development for Shiny applications. We’ve been building a data submission form from scratch, adding an email notification feature, and managing preconditions with Given steps.

Read the previous articles to get up to speed, or continue here to focus on how to write When steps.

1.  **[Behavior-Driven Development in R Shiny: A Step-By-Step Example](https://jakubsobolewski.com/blog/bdd-shiny-feature/)**
2.  **[Behavior-Driven Development in R Shiny: Setting Up Test Preconditions with Given Steps](https://jakubsobolewski.com/blog/bdd-shiny-given/)**

------------------------------------------------------------------------

> [Level-up your testing game! Grab your copy of the R testing roadmap.](https://jakubsobolewski.com/get-roadmap/)

## The Purpose of When

When steps answer one question: **What is the user doing?**

Not what button they clicked. Not what input ID was set. What **they** did, from **their perspective**.

The difference matters because UI implementations change constantly. Input IDs get renamed, buttons get moved, forms get refactored into modules. If your When steps name those details, they break every time something shifts. If they describe user intent, they survive almost any UI change.

A When step should read like a sentence from a user story.

Compare these two:

``` r
# Implementation-coupled! Breaks when the button ID changes
when_i_click_submit_button <- function(context) { ... }

# Behavior-focused! Survives any UI refactor
when_i_submit_entry_with_all_required_fields <- function(context) { ... }
```

The second version tells you what the user accomplished, not how the app was wired. That’s the goal.

## Starting the App

When steps are where the Shiny app launches — but not directly.

As we established in the Given article, the app starts lazily: the first When step calls `.start_driver()`, which creates the driver with all configuration accumulated from Given steps. Every subsequent When step interacts with the already-running app.

``` r
#' tests/testthat/setup-dsl.R
when_i_submit_entry_with_all_required_fields <- function(context) {
  .start_driver(context)
  context$driver$fill_required_fields(
    url = "https://example.com/",
    title = "Example"
  )
  context
}
```

Calling `.start_driver()` in every When step is safe — it’s a no-op if the driver already exists:

``` r
.start_driver <- function(context) {
  if (is.null(context$driver)) {
    context$driver <- MyAppDriver$new(
      storage = context$storage,
      email_service = context$email_service,
      user = context$user
    )
  }
  context
}
```

This means Given steps are purely configuration — they never touch the running app. The app only starts when the user’s first action is about to happen. This makes Given steps fast, composable, and easy to reason about.

## Implementing When Steps

The When step function itself should be thin. Its only job is to delegate to the driver and pass the context forward.

All implementation details live in the driver:

``` r
#' tests/testthat/setup-driver.R
MyAppDriver <- R6::R6Class(
  classname = "MyAppDriver",
  inherit = shinytest2::AppDriver,
  public = list(
    fill_required_fields = function(url, title) {
      self$set_inputs(url = url, title = title)
      self$click(input = "submit")
      self$wait_for_idle()
    },
    fill_all_fields = function(url, title, description) {
      self$set_inputs(url = url, title = title, description = description)
      self$click(input = "submit")
      self$wait_for_idle()
    }
  )
)
```

The driver encapsulates everything: which inputs to set, what to click, what to wait for. The When step just calls the right driver method by name.

This separation pays off immediately. If the submit button ID changes from `"submit"` to `"btn_submit"`, you fix it in one place — the driver method — and every specification that calls `fill_required_fields` continues to work unchanged.

Note that the same driver method can be called from multiple When steps.

**The driver is a translation layer.** It translates user intent (fill required fields) into UI mechanics (set these inputs, click this button).

## Naming When Steps

Good names follow a simple pattern: `when_<who>_<verb>_<object>`.

The verb describes the action from the user’s point of view. The object is what they acted on — expressed in domain language, not UI language.

``` r
# Good! We use domain language
when_i_submit_entry_with_all_required_fields()
when_i_submit_entry_with_missing_title()
when_i_delete_the_first_entry()
when_i_inspect_the_submissions_list()

# Bad! UI details are leaking in
when_i_click_the_submit_button()
when_i_clear_the_title_input()
when_i_navigate_to_slash_list()
```

Domain names survive redesigns. UI names couple your specifications to the current implementation.

One more rule: **one action per When step**. A step named `when_i_fill_and_submit_the_form()` is doing two things. That makes it harder to compose and harder to understand which action caused which outcome.

``` r
# One action per step — composable
when_i_fill_in_the_form(url = "https://example.com", title = "Example") |>
  when_i_submit_the_form()

# Doing too much — hard to reuse
when_i_fill_and_submit_the_form()
```

Smaller, focused steps let you test multi-step flows precisely.

### My Thoughts on Navigation Steps

You might think, this is an easy example.

Real apps aren’t single-page forms. They have navigation, multiple pages, modals, they might feel like navigating through a maze. It’s not that simple to interact with all the features! It’s not, but we can apply the same principles to more complex interactions.

**Here’s what I do.**

In apps we have pages. Users need to navigate to those pages before they can interact with them. How do we name When steps that represent navigation?

I prefer to name them based on their intent, what they’re trying to achieve, rather than the mechanics of how they get there. For example:

``` r
# Good! Focuses on the user's goal, not the UI structure
when_i_inspect_submissions()
when_i_open_the_first_entry()
when_i_change_settings(...) # composite step, implicitly navigates to the settings page and changes settings

# Bad! Reveals that there is a "submissions" page, what if we move submissions listing to another page?
when_i_navigate_to_submissions_page()
```

This way, the step names reflect the user’s goals, not the UI structure. If we later change how navigation works — say we add another page and move our targeted component there — we can update the driver methods without changing the When step names. The specifications remain stable and focused on user behavior, not implementation details.

That’s how specifications stay stable and don’t need updating every time the UI changes.

## Multi-Step Flows

When a scenario involves several user actions in sequence, chain them:

``` r
it("should allow editing a submitted entry", {
  given_existing_entries() |>
    given_an_authenticated_user() |>
    when_i_open_the_first_entry() |>
    when_i_update_the_title(title = "Updated Title") |>
    when_i_submit_the_form() |>
    then_the_entry_has_title("Updated Title")
})
```

Each step does one thing. The sequence reads like a user story. And if the assertion fails, you can see exactly which action preceded the broken state.

This is also where the context pipeline pattern earns its keep. Every step receives context and returns context, so you can add or remove steps in the middle without restructuring the whole test:

``` r
it("should show confirmation after submitting", {
  given_no_content() |>
    given_an_authenticated_user() |>
    when_i_submit_entry_with_all_required_fields() |>
    then_entry_is_submitted()
})
```

The pipeline works because every step function — Given, When, or Then — has the same contract: receive `context`, return `context`. That uniformity is what lets pipe operator connect them.

> This is basically how [cucumber](https://github.com/jakubsob/cucumber) works under the hood.

Here is the pattern on its own, with no Shiny involved. The When steps are thin — each one just calls a driver method and returns context:

``` r
# A minimal driver that records what it was asked to do
MockDriver <- function() {
  form <- NULL
  submitted <- FALSE
  list(
    fill_required_fields = function(url, title) {
      form <<- list(url = url, title = title)
    },
    submit = function() {
      submitted <<- TRUE
    },
    get_form = function() form,
    was_submitted = function() submitted
  )
}

# When steps are thin: call a driver method, return context
when_i_fill_in_the_form <- function(context, url, title) {
  context$driver$fill_required_fields(url = url, title = title)
  context
}

when_i_submit_the_form <- function(context) {
  context$driver$submit()
  context
}

ctx <- new.env(parent = emptyenv())
ctx$driver <- MockDriver()

ctx |>
  when_i_fill_in_the_form(url = "https://example.com", title = "Example") |>
  when_i_submit_the_form()
```

The step functions contain no UI details — those live entirely inside `MockDriver`. Swapping the driver is all it takes to point the same steps at a different implementation.

## Testing Error Paths

User interactions that trigger failures are still described with When steps. The step describes what the user attempted, not whether it succeeded.

``` r
it("should require all required fields", {
  given_no_content() |>
    given_an_authenticated_user() |>
    when_i_submit_entry_with_missing_required_fields() |>
    then_i_am_prompted_to_provide_required_fields()
})
```

The When step looks identical to the happy-path version — which is the point. The user tried to submit with missing fields. The difference lives in the Then step, which checks what the app communicated back to the user.

``` r
when_i_submit_entry_with_missing_required_fields <- function(context) {
  .start_driver(context)
  context$driver$fill_required_fields(
    url = "https://example.com/",
    title = ""  # Missing required field
  )
  context
}
```

You don’t need to create special “error path” When steps with names like `when_i_incorrectly_submit()`. Name them after what the user did, not after whether it was correct. The Then step will check whether the app responded correctly to that action.

## Parameterising When Steps

Sometimes you want to test multiple variations of the same action. Rather than creating a separate step for each variation, make the step accept parameters:

``` r
when_i_submit_entry_with_title <- function(context, title) {
  .start_driver(context)
  context$driver$fill_required_fields(
    url = "https://example.com/",
    title = title
  )
  context
}
```

Now you can express different scenarios clearly:

``` r
it("should reject titles that are too short", {
  given_no_content() |>
    given_an_authenticated_user() |>
    when_i_submit_entry_with_title(title = "ab") |>
    then_i_am_prompted_to_provide_required_fields()
})

it("should accept titles of the minimum length", {
  given_no_content() |>
    given_an_authenticated_user() |>
    when_i_submit_entry_with_title(title = "abc") |>
    then_there_are_entries(n = 1)
})
```

Use parameters when the difference between scenarios is data, not behavior. Keep the step name stable; let the arguments express the variation.

------------------------------------------------------------------------

> [cucumber](https://github.com/jakubsob/cucumber) allows you to write multiple variants of scenarios with `Scenario Outline` and `Examples` keywords.

In a cucumber feature file this scenario would look like this:

``` gherkin
Feature: Data submission form validation
  Scenario Outline: Submitting entries with different title lengths
    Given no content
    And an authenticated user
    When I submit an entry with title <title>
    Then I am prompted to provide required fields
    Examples:
      | title |
      | "ab"  |
      | "abc" |
```

In our implementation we don’t have a built-in way to express scenario outlines, but we can achieve the same effect by writing multiple scenarios that call the same parameterised When step.

------------------------------------------------------------------------

## Signs a When Step Is Too Complex

A When step that runs more than a few lines of logic is usually trying to do too much.

1.  **If a step is setting state** — checking whether something exists before interacting with it, or conditionally taking different actions — that logic belongs in Given steps or in the driver implementation, not the When step itself.
2.  **If a step has branching logic** — doing one thing when a flag is set and another when it isn’t — split it into two steps with clear names.
3.  **If a step is making assertions** — checking that something happened mid-flow — move those checks to Then steps. A When step should interact and nothing more. Mixing assertions into When steps makes failures ambiguous: you can’t tell whether the setup was wrong or the outcome was wrong. There might be exceptions to assert whether we’re on the right path in a multi-step flow – to fail eagerly – but generally, try to keep assertions in Then steps.

## The Pattern in Practice

Here’s the full shape of a specification using the When steps we’ve built:

``` r
describe("data submission", {
  it("should submit entry and send notification", {
    given_no_content() |>
      given_an_authenticated_user() |>
      given_email_service_is_available() |>
      when_i_submit_entry_with_all_required_fields() |>
      then_entry_is_submitted() |>
      then_email_notification_is_sent()
  })

  it("should require all required fields", {
    given_no_content() |>
      given_an_authenticated_user() |>
      when_i_submit_entry_with_missing_required_fields() |>
      then_i_am_prompted_to_provide_required_fields()
  })

  it("should allow editing a submitted entry", {
    given_existing_entries() |>
      given_an_authenticated_user() |>
      when_i_open_the_first_entry() |>
      when_i_update_the_title(title = "Updated Title") |>
      when_i_submit_the_form() |>
      then_the_entry_has_title("Updated Title")
  })
})
```

The specifications read naturally. None of them mention input IDs, button selectors, or shinytest2. Those details live in the driver, hidden away from the scenarios they serve.

------------------------------------------------------------------------

Note how specifications don’t even reveal it’s a Shiny app. They don’t reveal how we interact with the app. We could use `shinytest2` or `selenider` or any other method, however we want. It’s all hidden and irrelevant to the story we’re telling about user behavior.
- We can always, safely swap insides and keep the same specifications true.
- We can even swap the implementation of the system, and as long as it serves the same business requirements, you won’t need to update the specification.
- There is no risk of refactoring tests and loosing track of what has been already implemented. It is live, it is executable. It’s not some list of tickets in an external system.

That’s exactly the opposite of what happens when we write tests that are tightly coupled to the UI structure.

------------------------------------------------------------------------

## Wrapping Up

When steps model user behavior, not UI implementation.

That distinction is what keeps specifications readable days, weeks, months later, when the form has been refactored a few times, the button IDs have changed, the form has been moved to another page and nobody remembers what the original implementation looked like.

**Keep When steps focused on one action.**

**Put implementation details in the driver.**

**Use domain language, not UI language.**

The payoff is specifications that read like requirements and survive refactors like they were designed for it.

In the next article in the series we’ll look at Then steps — where we assert that the right things happened, at the right level, with failure messages that actually help.
