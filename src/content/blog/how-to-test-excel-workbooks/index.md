---
title: 'Exporting Excel Workbooks From Your Shiny App? Snapshot Test Them!'
description: 'And make it easy to inspect if things go wrong'
pubDate: 'Mar 6 2024'
tags: ["r", "tests", "tdd", "shiny"]
---

**Let's imagine the worst case scenario a developer – you're told users want to export data from your app to Excel.** 😭

Imagine you have the following requirements for this feature:
1. Users should be able to add variables to export: there is a set of fixed columns that are always exported and optional columns they can add.
2. Users should be able to download data in an Excel Workbook.

Based on those assumptions about the feature we can establish 2 base test cases:
1. I go to the page and then download the data.
1. I go to the page, select additional variables, and then download the data.

Those test could look like this:

```r
describe("export", {
  it("should export data with default settings", {
    # Given
    page <- ExportPage$new(test_app())

    # When
    path <- page$export()

    # Then
    expect_snapshot(
      ExcelWorkbook$new(path),
      name = "export_default",
      variant = "iris"
    )
  })

  it("should export data with additional variables", {
    # Given
    page <- ExportPage$new(test_app())

    # When
    page$select_additional_variables(c("Sepal.Length", "Sepal.Width"))
    path <- page$export()

    # Then
    expect_snapshot(
      ExcelWorkbook$new(path),
      name = "export_with_additional_variables",
      variant = "iris"
    )
  })
})
```

We assume there is an `ExcelWorkbook` class that allows us to interact with the Excel file.

Having those tests in place, an automated way of running the code we want to get working, we can start implementing the module.

The `test_app` is a function that runs the module as a standalone Shiny app, as in [this post](../how-to-use-tests-to-develop-shiny-modules/). We implement the R6 `ExportPage` object and use it to interact with the page.

**The output of the module we need to test is an Excel file.**

Excel files are treated as binary files in git, so we won’t be able to easily see what changed if it does. How to compare them? How to make it easy to see what changed in the workbook if something breaks or the implementation changes?

**We can “unpack” the Excel file into tables from each spreadsheet and snapshot-test them.** 📸

To me, snapshot tests are not only about validating if a file from the current run is the same as from previous runs. They’re also about showing how things work. We can use them to document the shapes of the outputs of our code. Computer is fine with comparing binary files, but humans are not. Let's make it easy for humans to understand what’s going on.

In this case, I use a snapshot test to display how the content of each spreadsheet looks so that business experts can easily validate if it’s what they want.

You may have noticed that `testthat::expect_snapshot` function doesn't have a `name` parameter. This is because it's not a `testthat` function, but a custom one.

```r
expect_snapshot <- function(x, name, variant = NULL, ...) {
  UseMethod("expect_snapshot")
}

expect_snapshot.data.frame <- function(x, name, variant = NULL, ...) {
  path <- tempfile(fileext = ".csv")
  x |>
    arrange(across(everything())) |>
    mutate(across(where(is.numeric), round, 4)) |>
    write.csv(path)
  expect_snapshot_file(
    path = path,
    name = paste0(name, ".csv"),
    variant = variant
  )
}

expect_snapshot.ExcelWorkbook <- function(x, name, variant = NULL, ...) {
  x$sheets() |>
    set_names(x$sheets()) |>
    map(\(sheet) x$read(sheet)) |>
    iwalk(\(data, sheet_name) {
      expect_snapshot(
        data,
        name = paste0(name, "-", sheet_name),
        variant = variant
      )
    })
}
```

Using S3 method dispatch, I can easily add new types of objects to snapshot test. I already had a method to capture data frames in CSV files, so I just needed to add a method to capture Excel workbooks.

I decided that this is the behavior I want for comparing Excel files, but I leave doors open. If I change my mind in the future, and for example decide that it’s enough to treat Excel files as binary files, I’ll just update the implementation of expect_snapshot function. My test scenarios will remain intact.
