---
title: 'How To Write E2E Tests Selectors That Stand The Test Of Time'
description: 'Use them with E2E library of your choice'
pubDate: 'Mar 15 2024'
tags: ["r", "tests", "shiny", "ui"]
---

Do you know there’s a section in Cypress documentation on [best practices](https://docs.cypress.io/guides/references/best-practices)? There is a section on selecting elements.

> Every test you write will include selectors for elements. To save yourself a lot of headaches, you should write selectors that are resilient to changes.
>
> Oftentimes we see users run into problems targeting their elements because:
> - Your application may use dynamic classes or ID’s that change
> - Your selectors break from development changes to CSS styles or JS behavior
>
> Luckily, it is possible to avoid both of these problems.
> 1. Don’t target elements based on CSS attributes such as: id, class, tag
> 1. Don’t target elements that may change their textContent
> 1. Add data-* attributes to make it easier to target elements

Let's see how to use that advice in Shiny apps.

## Adding test attributes to HTML tags in Shiny

How to do that in Shiny?

Use ellipsis if a component supports it, if it doesn’t, use [`shiny::tagAppendAttributes`](https://shiny.posit.co/r/reference/shiny/1.7.1/tagappendattributes).


### Shiny component with ellipsis
```r
actionButton(
  "add",
  label = "Add",
  `data-test` = "button-add",
  icon = icon("plus"),
  width = "100%"
)
```
produces:

```html
<button
  class="btn btn-default action-button"
  data-test="button-add"
  id="add"
  style="width:100%;"
  type="button">
  <i
    class="fas fa-plus"
    role="presentation"
    aria-label="plus icon">
  </i>
  Add
</button>
```

### Shiny component with `tagAppendAttributes`

```r
textAreaInput(
  inputId = "description",
  label = "Description",
  width = "100%"
) |>
  tagAppendAttributes(
    .cssSelector = "textarea",
    `data-test` = "input-description"
  )
```

produces:

```html
<div
  class="form-group shiny-input-container"
  style="width: 100%;"
>
  <label
    class="control-label"
    id="description-label"
    for="description">
    Description
  </label>
  <textarea
    id="description"
    class="shiny-input-textarea form-control"
    style="width:100%;"
    data-test="input-description">
  </textarea>
</div>
```

For components that produce nested tags it's important to use `.cssSelector` to add attribute to the correct HTML tag. If you don't use it, the attribute will be added to the `div` instead of the `textarea` and your tests won't work properly.

### A `shiny::tag`

```r
tags$button(
  "Reset",
  `data-test` = "button-reset"
)
```

produces:

```html
<button data-test="button-reset">Reset</button>
```

We can use these guidelines for any E2E test we write, not only for Cypress. We can use the same approach when testing with `shinytest2`.


## Using it with shinytest2

Most of the `AppDriver` methods allow you to use a selector instead of and id.

For example the `click` method:

```r
AppDriver$click(
  input = missing_arg(),
  output = missing_arg(),
  selector = missing_arg(),
  ...
)
```

If we want to click the `Add` button we can refactor the `click` call from:

```r
AppDriver$click(
  input = "my_very_long-and-brittle_namespace-add"
)
```

to:

```r
AppDriver$click(selector = "[data-test=button-add]")
```

This way our tests are resilient to changes in namespaces of Shiny modules. You won't need to update tests as long as you preserve the `data-test` attribute.

We could refactor the `Add` button as well, and change it to another tag, like an `<a>`:

```r
tags$a("Add", `data-test` = "button-add")
```

and your tests would still pass as they don't require the ID or any other information about the HTML other than `data-test` attribute.

This way we can decouple E2E tests and details of the HTML structure of our app, leading to easier maintenance and more robust tests.
