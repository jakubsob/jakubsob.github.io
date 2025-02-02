---
title: 'Real-Time Input Validation Using Bootstrap Form Validation API'
description: 'Learn how to implement real-time input validation in Shiny apps using Bootstrap Form Validation API for immediate feedback.'
pubDate: 'Jan 29 2024'
tags: ["r", "ui", "shiny"]
---

[Bootstrap allows you to build forms with validation.](https://www.notion.so/Instantaneous-Input-Validation-By-Reusing-Bootstrap-Form-Validation-79a88401c6234583beed97e12c75fcc5?pvs=21) But by default, it only works if inputs are collected in a `<form>` and the validation is triggered by clicking a button with `type="submit"`. What if we want to continuously validate inputs as they change?

We can leverage how Bootstrap uses `.is-invalid`  and `.invalid-feedback` classes to add validation feedback and show them on selected events.
For a text input, we could use:
- `oninput` to validate each time we add a new character, for immediate feedback.
- `onchange` to validate after the input loses focus.

We can create a validate function that takes a component and adds the validation attributes to the input.

```r
library(shiny)
library(bslib)

validate <- function(
  component,
  condition = "x => x === ''",
  invalid_label = "Name must be provided."
) {
  validation_js <- htmlwidgets::JS(sprintf("
    const condition = %s;
    if (condition(this.value)) {
      $(this)
        .addClass('is-invalid')
        .parent()
        .append('<div class=\"invalid-feedback\">%s</div>')
    } else {
      $(this).parent().find('.invalid-feedback').remove();
      $(this).removeClass('is-invalid');
    }",
    condition,
    invalid_label
  ))
  tagAppendAttributes(
    component,
    .cssSelector = "input",
    oninput = validation_js
  )
}

shinyApp(
  ui = fluidPage(
    theme = bs_theme(version = 5),
    textInput(
      inputId = "name",
      label = "Name",
      width = "100%"
    ) |>
      validate()
  ),
  server = function(input, output) {

  }
)
```

It's super simple requires no additional dependencies.
We can easily extend the code to include additional validation rules.
The same approach could be used to validate any type of input, not just text inputs.

<video src="/blog/simple-input-validation-with-bootstrap-form-validation-api/video.mp4" width="320" height="240" controls></video>
