---
title: 'Deploy Multiple Shiny Apps from One R Package'
description: 'Code organization and deployment strategy for multiple Shiny apps sharing common logic within a single R package. Structuring your project in a monorepo format.'
pubDate: 'Oct 8 2025'
tags: ["r", "shiny", "deployment"]
---

Multiple Shiny apps sharing common logic demand a different deployment strategy than standalone applications.

Depending on the size of the project, you might choose
- a multirepo: each app in its own repository, R package(s) for shared logic, or
- a monorepo: all apps and shared logic in a single repository.

Both choices have their pros and cons.

The multirepo approach is easier from the Shiny (or reports) deployment perspective (especially to Posit servers), as each app has its own repo, and is a deployable directory. However it can be harder to maintain, as you need to jump between repositories to make changes to shared logic.

Here I explore the monorepo approach, where shared logic is bundled in an R package, and each app is a subdirectory of the package.

When you build several interconnected Shiny apps (or reports) that need shared functions, data processing utilities, or common configuration, bundling them in an R package creates an environment where you can develop all aspects of the project in one repository. Your shared functions live in the package's `R/` directory while individual apps reside in `inst/apps/`.

If solving a business problem requires few different apps or reports, this structure can be very efficient. A solution to the problem lives in one repository.

This structure allows you to deploy each app independently, but ship it with the same, shared logic.

> [Level-up your testing game! Grab your copy of the R testing roadmap.](https://jakubsobolewski.com/get-roadmap/)

## The Problem with [`rsconnect::deployApp()`](https://rstudio.github.io/rsconnect/reference/deployApp.html)

To deploy content with `rsconnect::deployApp()`, you need to point it to a directory that contains an `appPrimaryDoc` in `appDir`.

This limitation seems to not allow for a monorepo approach where each app is its own directory, and shared logic lives alongside them in its own directory.

```md
myproject/
├── R/          # Shared functions
├── dashboard/
├── form/
└── report/
```

Deployment with `rsconnect::deployApp("dashboard")` won't work, as the `R/` directory is not in the app directory. The code won't be shipped in the deployment bundle and the app won't work.

It's crazy that you need to consider the deployment platform when structuring your project... But we can work around this limitation.

## The Package Structure

```md
mypackage/
├── R/                      # Shared functions
├── inst/apps/              # Individual apps
│   ├── dashboard/
│   │   ├── R/
│   │   │   ├── server.R
│   │   │   └── ui.R
│   │   ├── tests/
│   │   │   └── testthat/
│   │   │       ├── setup-shinytest2.R
│   │   │       └── test-app.R
│   │   ├── app.R
│   ├── form/
│   │   └── app.R
│   └── report/
│       ├── index.qmd
│       └── functions.R
└── tests/
    └── testthat/
```

The `inst/apps/` directory becomes your deployment source. Each subdirectory contains a complete Shiny application that can reference functions from the parent package's `R/` directory

## The Deploy Function

The deployment script creates a temporary `app.R` file that loads your package and launches the specific app:

```r
deploy <- function(file, title, ...) {
  writeLines(
    c(
      'pkgload::load_all()',
      'options(shiny.autoload.r = FALSE)',
      sprintf('shiny::shinyAppDir("%s")', file)
    ),
    "app.R"
  )
  on.exit(unlink("app.R"))
  rsconnect::deployApp(
    appPrimaryDoc = "app.R",
    appName = title,
    appTitle = title,
    ...
  )
}
```

This approach mimics `golem`'s deployment strategy. The generated `app.R` uses `pkgload::load_all()` to make your package functions available, then launches the specific app directory with `shinyAppDir()`.

Since we're deploying from the package root, the `R/` directory is included in the deployment bundle, and all shared functions are available to the app.

## Multiple App Deployment

Deploy each app independently by specifying different directories:

```r
deploy("inst/apps/dashboard", "dashboard")
deploy("inst/apps/form", "form")
```

Each deployment creates a separate app. The apps share the same underlying package code but present different interfaces or serve different purposes.

## Why Choose This Structure?

This structure supports fast iteration where shared logic evolves alongside individual apps / deployable content.

Changes to functions in `R/` immediately affect all apps that use them. App-specific modifications remain isolated in their respective directories. I think it works best for small to medium-sized projects where apps are closely related and share logic.

The multirepo approach might be better for:

- larger projects,
- where apps are managed by different teams,
- or you have a seamless deployment where each app and its dependencies can be easily deployed independently.

This has been my experience with a project requiring multiple Shiny apps sharing common logic.

If you have suggestions or improvements, please reach out!
