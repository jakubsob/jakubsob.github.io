---
title: 'Simplifying Interactions with Complex Widgets in shinytest2 Using JavaScript APIs'
description: "When shinytest2's `set_inputs()` won't work, leverage widget APIs directly. Learn to write cleaner, faster and more robust tests using JavaScript APIs."
pubDate: 2025-10-31
tags: [tests, r, shiny, shinytest2]
---

`shinytest2` is powerful for writing Shiny tests effectively, but `AppDriver`'s methods don't always cover every interaction you need.

You might discover that the convenient `set_inputs()` method doesn't work for everything. Take `shiny::selectizeInput` with the create option enabled. While `set_inputs()` will work for selecting existing options, it stumbles when you try to add new ones.

Rather than fighting with high-level testing abstractions, or trying to simulate individual clicks to interact with the widget correctly, the solution lies in understanding how your widgets actually work under the hood.

And that's where **JavaScript APIs become your secret weapon**.

> [Level-up your testing game! Grab your copy of the R testing roadmap.](https://jakubsobolewski.com/get-roadmap/)

## The Problem with Complex Widget Interactions

The challenge arises because complex widgets like selectize inputs operate through their own JavaScript layer.

When shinytest2 can't directly interact with them, you might be tempted to simulate what a user would do: open a dropdown, type an option, confirm the selection, close the dropdown. This manual choreography is not only tedious – it's fragile.

Or you might be tempted to skip writing tests for these interactions altogether – which is even worse.

But if you decide to implement those interactions step by step, each step introduces potential points of failure:

- Timing issues emerge: has this animation finished?
- State management becomes unpredictable: is this dropdown already opened?

A change to how the widget renders, and your entire test breaks.

## Simplifying interactions with JavaScript APIs

Instead of orchestrating a series of UI actions, you can directly call the widget's JavaScript API.

For creating new items in `shiny::selectizeInput`, this means bypassing the UI choreography entirely and using the `createItem` method:

```r
app <- shinytest2::AppDriver$new(...)

# Use namespaced inputId
app$run_js(sprintf(
  "$('#%s select')[0].selectize.createItem('%s');",
  inputId,
  value
))

# If you're using test selectors - I highly recommend it
app$run_js(sprintf(
  "$('[data-testid=%s] select')[0].selectize.createItem('%s');",
  testid,
  value
))
```

This approach accomplishes in **one API call** what would otherwise require multiple sequential actions. There's no waiting for dropdowns to animate. No typing delays. No confirmation steps. Just direct, instantaneous manipulation of the widget's state.

### Manual interaction would look something like this

This is pseudocode, to illustrate the complexity:

```r
# Find HTML tag to click to trigger opening dropdown
# Find <input> to type new option
# Find HTML tag to click to confirm the new option
# Use HTML tag to close the dropdown
```

With the API approach, you eliminate orchestration complexity. The code becomes shorter, clearer, and less dependent on implementation details that might change.

We depend on the widget's own API to handle the internal state correctly, so we're still exposed to changes in the widget's implementation, but:

- **Robustness improves dramatically** because you're not relying on UI timing, animation frames, or event sequencing. The widget's API is a stable contract. When you call `createItem()`, it works the same way every time, regardless of the surrounding UI state. If the widget's API changes, you only need to update that single API call in your tests, not a whole series of UI interactions.
- **Clarity increases** because your test code expresses intent directly. Instead of a long sequence of UI manipulations, you have a single line that clearly states "create this item." This makes your tests easier to read and maintain.

But we can make it even better.

## Making It Scalable: Functions and AppDriver Extensions

Direct API calls are powerful, but they shouldn't clutter your test files. When you find yourself using a particular widget manipulation pattern more than once, **encapsulate it in a helper function or extend the AppDriver class itself**.

This pattern keeps your tests readable while centralizing your widget interaction logic. Instead of repeating JavaScript API calls throughout your test suite, you build a small library of domain-specific testing methods that express intent clearly.

Instead of doing:

```r
app$run_js(
  "$('#module-select select')[0].selectize.createItem('New Option');"
)
```

You could define a method in an extended `AppDriver`:

```r
ShinyDriver <- R6::R6Class(
  inherit = shinytest2::AppDriver,
  public = list(
    create_selectize_item = function(inputId, value) {
      self$run_js(sprintf(
        "$('#%s select')[0].selectize.createItem('%s');",
        inputId,
        value
      ))
    }
  )
)
```

For a deeper exploration of this pattern, including real examples of how to structure an extended `AppDriver` with custom methods, read [BDD Shiny feature testing guide](https://jakubsobolewski.com/blog/bdd-shiny-feature/#3-implementing-driver), which demonstrates how to build abstractions that make your tests both simple and maintainable.

## How to Discover JavaScript APIs for Widgets

Finding the right JavaScript API calls for your widgets can be straightforward if you know where to look.

Usually, component documentation includes links to which JavaScript libraries power them.

- `shinyWidgets::pickerInput` uses Boostrap Select with its own API documented [here](https://developer.snapappointments.com/bootstrap-select/methods/).
- `shinyWidgets::airDatePicker` uses Air Datepicker with its API documented [here](https://air-datepicker.com/methods/).

Just head over there and see if the widget exposes methods that let you manipulate it programmatically.

---

The most reliable path to testing complex widgets isn't always the highest-level abstraction.

Sometimes the answer lies one level down, in the actual APIs that power these components. By learning to work directly with JavaScript APIs, you gain both flexibility and stability – and your tests become more resilient to the inevitable changes that come with UI development.

Passing JavaScript code in strings might feel crude at first, but with proper encapsulation and abstraction, you can build robust Shiny tests that stand the test of time.
