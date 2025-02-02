---
title: 'Effective State Management in Shiny Modules: A React-Inspired Approach'
description: 'Learn how to manage state in Shiny modules using a React-inspired approach with event handlers for better control and flexibility.'
pubDate: 'Mar 29 2024'
tags: ["r", "shiny"]
---

There are a few established approaches to share state between Shiny modules.

1. [Module return value](https://shiny.posit.co/r/articles/improve/communicate-bet-modules/).
2. [Using `session$userData`](https://www.appsilon.com/post/super-solutions-for-shiny-architecture-1-of-5-using-session-data).
3. [Using `shiny::reactiveValues` or R6 classes](https://www.youtube.com/watch?v=fo4eiwGE6bw).

But there is another, and it's inspired by React. [Lifting state up in React](https://react.dev/learn/sharing-state-between-components#lifting-state-up-by-example) works like this:

> - When you want to coordinate two components, move their state to their common parent.
> - Then pass the information down through props from their common parent.
> - Finally, pass the event handlers down so that the children can change the parent’s state.
> - It’s useful to consider components as “controlled” (driven by props) or “uncontrolled” (driven by state).

## Let's see how that might look like in Shiny

Let's consider a module that renders data in a table and allows you to select rows.

1. Data is passed to the module.
2. Data is rendered.
3. Selected rows come out the module (indexes or actual rows).

This fits perfectly to using the module return value pattern, but any other approach will also work.

**But what if this module needs to do just a bit more?**

What if we want to interact with the table in [more ways than just selecting rows](https://www.nngroup.com/articles/data-tables/)? Deleting rows can be especially tricky:
- Should the module return the data with removed rows?
- Should it return the indexes of the rows to be removed?
- Should it return the data and the indexes?
- How to distinguish when the return value is selected rows and when it's rows for deletion?

If we add it to the fact that we can also do the other things in the module, we may arrive at a situation where a complex conditional control is needed. And that's not good.

## Let's see how we might implement the module with React inspired event handlers passed to the module.

```r
table_ui <- function(id) {
  ns <- NS(id)
  reactableOutput(ns("table"))
}

table_server <- function(
  id,
  data,
  render = function(data, session) { },
  on_select = function(data, index) { },
  on_details = function(data, index) { },
  on_delete = function(data, index) { }
) {
  moduleServer(id, function(input, output, session) {
    output$table <- renderReactable(render(data(), session)) |>
      bindEvent(data())

    observe(
      on_select(data(), getReactableState("table", "selected"))
    ) |>
      bindEvent(getReactableState("table", "selected"))

    observe(on_details(data(), input$details)) |>
      bindEvent(input$details)

    observe(on_delete(data(), input$delete)) |>
      bindEvent(input$delete)
  })
}
```

Based on the interface of the module we can deduce that:
- it should render data with `render` function,
- it should call `on_select` event handler after selecting a row,
- it should call `on_details` event handler after accessing row details,
- it should call `on_delete` event handler after deleting a row.

**Notice how the interface describes the behavior of the module.**

With this approach we don't need to guess what the return value means and how to handle it, or which `reactiveValues` from a parent module it modifies. Each action implemented in the module is handled separately. The caller is fully responsible for what it gets from this module.

♻️ Bonus: we can reuse this module with data of any shape, all we need to do is to provide a proper `render` method.

You might notice a few shortcomings of this implementation:
- We need to remember `input`s on which event handlers are called when providing `render` function. This is a bit unfortunate, but it's a tradeoff for the simplicity of the interface.
- If we want to implement a new event, we need to modify the module interface and add a new observer. This is suboptimal in this implementation but could be improved by using a list of handlers. We could provide a list of handlers and names of inputs they should observe.

## Let's see how we can integrate this module with a simple app.

Since we're using [`reactable`](https://glin.github.io/reactable/index.html) as the table library, we need to implement the `render` function with `reactable::reactable`. We need to also make sure that inputs that trigger `details` and `delete` events are rendered.

```r
library(bslib)
library(dplyr)
library(reactable)
library(shiny)

# Render links that send the selected row index to the server
actions_def <- function(session = getDefaultReactiveDomain()) {
  colDef(
    name = "",
    cell = function(value, row_index, column_name) {
      tags$div(
        class = "d-flex gap-1",
        tags$button(
          class = "btn btn-outline-info",
          "Details",
          onclick = sprintf(
            "Shiny.setInputValue('%s', %s, { priority: 'event' });",
            session$ns("details"),
            row_index
          )
        ),
        tags$button(
          class = "btn btn-outline-danger",
          "Delete",
          onclick = sprintf(
            "Shiny.setInputValue('%s', %s, { priority: 'event' });",
            session$ns("delete"),
            row_index
          )
        )
      )
    }
  )
}

ui <- fluidPage(
  theme = bs_theme(version = 5),
  table_ui("table"),
  verbatimTextOutput("selected_row")
)

server <- function(input, output, session) {
  data <- reactiveVal(iris)
  selected_row <- reactiveVal()
  output$selected_row <- renderPrint(selected_row())

  table_server(
    "table",
    data = data,
    render = function(data, session) {
      data |>
        mutate(actions = NA) |>
        reactable(
          selection = "single",
          # Don't select rows when action is clicked
          onClick = JS("function(row, column, { selected }) {
            if (column.id === 'actions') {
              return;
            }
            row.toggleRowSelected();
          }"),
          columns = list(
            actions = actions_def(session)
          )
        )
    },
    on_select = function(data, index) {
      selected_row(data[index, ])
    },
    on_details = function(data, index) {
      showModal(
        modalDialog(
          data[index, ]
        )
      )
    },
    on_delete = function(data, index) {
      data(data[-index, ])
    }
  )
}

shinyApp(ui, server)
```

See how the parent module (or the root server function) is responsible for:
- specifying how to render the data,
- deciding what to do when a row is selected, here it's saved and rendered in a separate output, could be passed to another module,
- deciding what to do with data when we click on the details button, here it's shown in a modal,
- deciding what to do with data when we click on the delete button, here it's removed from the data, and the table is rerendered.

<video src="/blog/the-other-way-of-lifting-state-up-from-shiny-modules/video.mov" width="320" height="240" controls></video>
