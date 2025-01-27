---
title: 'Keys To Scalable Code: Owning The Interfaces You Use'
description: 'Learn how to build scalable and maintainable code by abstraction and information hiding, improving flexibility and ease of future changes.'
pubDate: 'Jan 23 2025'
tags: ["r", "shiny"]
---

As the codebase grows, it's important to own the interfaces you use, especially for code that's more likely to change in the future.

When we develop code, we make choices about libraries we use that help us build the functionality we need. Sometimes those choices are more conscious, and sometimes we just use what we always do. It might be a no-brainer that we use `dplyr` to wrangle data. We might not expect to ever have to rewrite `dplyr` to `data.table`.

But there are some parts of the codebase that are more likely to change, and not even because of our own decisions.

## Shiny components are parts of the codebase that we might want to change in the future.

You're building a Shiny app.

You decide to use `shiny::selectInput` to create dropdowns, because you always use them, and they never failed you.

But then, you decide to refactor the interface.

You no longer like the default label being in the top left corner of the input, you want it to be in one line with the select. The function doesn't support such modification. Neither it's feasible with CSS.

So you need to change the markup.

```r
shiny::div(
  class = "d-flex flex-row gap-2 align-items-center",
  shiny::tags$label("Select a variable"),
  shiny::selectInput(
    inputId = "variable",
    label = NULL,
    choices = c("a", "b", "c"),
    selected = "a"
  )
)
```

This might be fine as long as you have at most a few dropdowns.

But what if you have plenty of them, all needing the same change? To carry out change we'd need to produce a huge diff. And it's just to reposition the label.

What if we want to make another change like that in the future?

All of the work will have to be repeated.

## The solution is to own the interfaces our code uses.

We can aviod changing code in a lot of places if we create a function producing this component.

Then we can change the code in one place, propagating the change to all the places where its used. Just wrap the code you suspect might change in the future in a function. You can also provide your own defaults, so you don't have to repeat them every time you use the component.

So if we used such a `select` component in our codebase, instead of `shiny::selectInput`:

```r
select <- function(id, label = NULL, choices = c(), selected = c(), ...) {
  shiny::selectInput(
    inputId = id,
    label = label,
    choices = choices,
    selected = selected,
    ...
  )
}
```

Then we can modify our code in one place:

```r
select <- function(id, label = NULL, choices = c(), selected = c(), ...) {
  shiny::div(
    class = "d-flex flex-row gap-2 align-items-center",
    shiny::tags$label(label),
    shiny::selectInput(
      inputId = id,
      label = NULL,
      choices = choices,
      selected = selected,
      ...
    )
  )
}
```

And all the places where we used the `select` function will be updated.

---

We're **abstracting** the select component and **hiding information** about the implementation.

---

## I implement it even if I don't know if it'll come in handy, better be safe than sorry.

If we do it for a select, we should also do this with other components.

```r
select <- function(id, label = NULL, choices = c(), selected = c(), ...) {
  shiny::div(
    class = "d-flex flex-row gap-2 align-items-center",
    shiny::tags$label(label),
    shiny::selectInput(
      inputId = id,
      label = NULL,
      choices = choices,
      selected = selected,
      ...
    )
  )
}

checkbox <- function(id, label, value) {

}

radio <- function(id, label = NULL, choices = c(), selected = NULL) {

}

button <- function(id, label, variant = "primary") {

}

# ...
```

Then you have the flexibility to update your components in one place and have less code to maintain. It also allows you to change the implementation of the component. Do you want to switch to `shinyWidgets`? No problem, just replace the body of the `select` function!

This idea doesn't end with Shiny components.

## Own all interfaces that might change their implementation.

Similar idea can be applied to other interfaces used in our codebase.
- Storage, so that you can switch providers. Whether you use a flat file, a database, or a cloud storage, you can run the same `create`, `read`, `update`, `delete` operations on them. Your code doesn't need to know from where the data comes from.
- Logging, so that you can switch the logging library without changing all calls to the log function.

Allowing dependencies to spill into your code might be okay when you're 100% sure you won't change your mind in the future. But if you suspect you might, it's better to own the interfaces your code calls.

**Abstraction and information hiding** is the key to scalable code, one that we can easily change in the future.
