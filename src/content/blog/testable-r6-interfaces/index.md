---
title: 'R6 Interfaces For Backend: Define What, Not How'
description: 'A Practical Guide to Faking External Dependencies and Business Logic with R6 Classes for Reliable Tests.'
pubDate: 2025-09-10
tags: [tests, r, shiny]
---

Your Shiny app has business logic scattered everywhere.

Testing it feels impossible. Every time you touch one piece, three others break. Dependencies tangle together like headphone cables in your pocket.

There's a cleaner way.

## Interfaces Define What, Not How

R6 interfaces let you bundle concepts together without locking in implementation details. Your business logic depends on contracts, not concrete classes.

Think about a Shiny app that needs to analyze customer data. Sometimes you want real database queries. During testing, you want fast fakes. In acceptance tests, you need controlled scenarios.

The interface stays the same. The implementation changes.

> [Level-up your testing game! Grab your copy of the R testing roadmap.](http://jakubsobolewski.com/get-roadmap/)

## Implement The Interface

Define the behavior of your interface. What methods should it have? What parameters? What return values?

Make all methods throw an error. In case a class that implements this interface forgets to override one, it should fail loudly.

```r
CustomerAnalyzerInterface <- R6::R6Class(
  classname = "CustomerAnalyzerInterface",
  public = list(
    initialize = function() {
      rlang::abort("This class cannot be instantiated.")
    },
    get_customer_metrics = function(customer_id) {
      rlang::abort("Not implemented.")
    },
    calculate_risk_score = function(metrics) {
      rlang::abort("Not implemented.")
    },
    generate_recommendations = function(customer_id, risk_score) {
      rlang::abort("Not implemented.")
    }
  )
)
```

Then depending on what your workflow is, create concrete implementations, either real or fake.

## Choose Your Workflow

### Inside out

If you want to nail the business logic, write tests for the real implementation and implement it. It might be worth checking if what you need to calculate is even possible.

- Can you get the data you need?
- Can you run the calculations in a reasonable time?

This approach might lead to a more complex real implementation, but you will know it works. You can always write an adapter to serve the data in the app later.

### Outside in

If you want to get the app working, write the fake implementation to serve fake data in the app. Focus on the user and developer experience.

- Can users get what they need in the app?
- What should the UI look like?
- What code interface makes serving the interface easy?

What you learn in this stage can inform the real implementation later.

## The Real Implementation

Your production class does the heavy lifting. It connects to databases, calls APIs, runs expensive calculations.

```r
CustomerAnalyzer <- R6::R6Class(
  classname = "CustomerAnalyzer",
  inherit = CustomerAnalyzerInterface,
  public = list(
    initialize = function(...) {
      # Set up whatever is needed to work in production
    },
    get_customer_metrics = function(customer_id) {
      # Query production database
      # Call analytics service
      # Return complex calculations
    },
    calculate_risk_score = function(metrics) {
      # Run ML model prediction
      # Factor in market conditions
      # Return weighted score
    },
    generate_recommendations = function(customer_id, risk_score) {
      # Query recommendation engine
      # Apply business rules
      # Return personalized actions
    }
  )
)
```

## The Fake Implementation For Testing

Testing needs control. Your fake returns known values every time.

```r
CustomerAnalyzerFake <- R6::R6Class(
  classname = "CustomerAnalyzerFake",
  inherit = CustomerAnalyzerInterface,
  public = list(
    initialize = function() {},
    get_customer_metrics = function(customer_id) {
      list(
        revenue = 5000,
        retention = 0.85,
        satisfaction = 4.2
      )
    },
    calculate_risk_score = function(metrics) {
      0.3
    },
    generate_recommendations = function(customer_id, risk_score) {
      c("Schedule follow-up call", "Send satisfaction survey")
    }
  )
)
```

## Create a Factory For Instantiation

Implement a `make_`/`create_`,`build_`,`get_`/`new_` function that picks and initializes the right implementation. Environment variables or config files control the choice.

```r
make_customer_analyzer <- function(
  type = c("real", "fake"),
  ... # additional parameters for initialization
) {
  type <- match.arg(type)
  switch(
    type,
    real = CustomerAnalyzerReal$new(),
    fake = CustomerAnalyzerFake$new()
  )
}
```

## Shiny App Stays Clean And Testable

Business logic depends on the interface. Implementation details hide behind the factory. External dependencies become swappable. You can still develop the app if the production DB is down.

```r
server <- function(input, output, session) {
  analyzer_type <- Sys.getenv("ANALYZER_TYPE", "fake")
  analyzer <- make_customer_analyzer(analyzer_type)

  output$metrics <- renderPlot({
    req(input$customer_id)
    metrics <- analyzer$get_customer_metrics(input$customer_id)
    chart(metrics)
  })

  # ... other server logic
}
```

## Testing Becomes Straightforward

Use the same to create the instance in your tests as in production. This is the public interface of the business logic, not the classes themselves.

Test that the logic is correct in the real implementation:

```r
test_that("high risk customers get urgent recommendations", {
  # Arrange
  analyzer <- make_customer_analyzer("real")

  # Act
  recommendations <- analyzer$generate_recommendations("customer-123", 0.9)

  # Assert
  expect_set_equal(recommendations, c("Immediate outreach"))
})
```

Test that the fake fulfills the interface contract:

```r
test_that("fake customer analyzer returns a recommendation", {
  # Arrange
  analyzer <- make_customer_analyzer("fake")

  # Act
  recommendations <- analyzer$generate_recommendations("123", 0.3)

  # Assert
  expect_s3_class(recommendations, "character")
})
```

For testing the app itself, use the fake implementation to serve predictable data. Especially if it depends on fragile external dependencies. Be it APIs, databases, or filesystems.

```r
test_that("app shows customer metrics", {
  # Arrange
  withr::with_envvar(c(ANALYZER_TYPE = "fake"), {
    app <- AppDriver$new("path/to/app")
  })

  # Act
  app$set_inputs(customer_id = "123")

  # Assert
  output <- app$get_value("metrics")
  expect_true(is.character(output$src))
})
```

Don't test the same logic twice. Use fakes for acceptance testing. You'll get a better separation of concerns, faster and more reliable tests.

## Acceptance Tests Control Full Scenarios

The same code that runs in production runs in your tests. Only the data source changes.

This pattern transforms fragile apps into testable systems. Your business logic stays isolated. Dependencies become swappable. Tests run fast and reliable.

Stop fighting tangled code. Start designing with interfaces.
