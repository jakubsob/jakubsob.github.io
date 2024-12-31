---
title: 'Choosing the Best Library for Acceptance Testing Shiny Apps: {shinytest2} vs Cypress'
description: 'Compare {shinytest2} and Cypress for acceptance testing Shiny apps. Learn their pros, cons, and which might suit your project better.'
pubDate: 'Dec 02 2024'
tags: ["r", "tests"]
---

There are a few library options when it comes to writing [acceptance tests](../acceptance_test_driven_development_of_shiny_modules/) for Shiny apps.

It's a good idea to make a conscious decision which one to use at the start of the project as changing the library after writing a lot of tests will be costly.

Let's compare two choices: {shinytest2} and Cypress.

I've used each of them in different projects. Let's explore what you might expect from choosing one over the other.

**⚠️ The following list is based on my experience and some points are opinions rather than an objective truth. Take it into account when considering this list. ⚠️**

## {shinytest2}

- ✅ Trivial setup. All we need is to install the package and have Chrome browser available.
- ✅ All tests, unit tests and acceptance tests are written in R.
  - It should be easier to set up and reuse fixtures for tests.
  - It should be easier to split the app to test individual modules, we can generate test apps with R functions.
- ✅ Code ran during {shinytest2} tests will be included in {covr} coverage reports.
- ✅ We can use [{cucumber}](github.com/jakubsob/cucumber) to abstract acceptance tests.
- ✅ We can use [`shiny::exportTestValues()`](https://rdrr.io/cran/shiny/man/exportTestValues.html) to export anything from the server. It can be a powerful technique when testing a legacy codebase. It allows us to print the state of the app without tying results to the UI which might be prone to change. ⚠️ If we directly export the values of reactives we tie the tests to the implementation. In order to make such tests more robust, outputs for tests should be abstracted to a format that's less likely to change often.
- 🟡 It gives us access to the server.
  - ✅ Good because we can more precisely wait for specific results without having to rely on timeouts.
  - ❌ Bad because we may leak some implementation details into tests.
- 🟡 We don't need to use JavaScript. But in order to write [robust selectors](../robust-targetting-of-html-for-tests) we might need some JavaScript and that JavaScript will be inline, as a string. Can be mitigated by using [{selenider}](https://ashbythorpe.github.io/selenider/).
- 🟡 Its methods strongly suggests using snapshot tests (`app$expect_screenshot()`, `app$expect_html()`, `app$expect_values()`), and while convenient, it might lead to brittle tests, especially if we take screenshots of the app. Can be mitigated by using [{selenider}](https://ashbythorpe.github.io/selenider/) to write more robust assertions.
- ❌ Poor Developer Experience, when previewing tests we don't easily see which action or test is currently running. It just opens a browser window without any additional feedback.
- ❌ Is slow. Each time we initialise the driver (so for each test scenario) we need to open a new Chrome session and a new R session. There's a way to [reuse the browser session](../optimizing-shinytest2-tests/), but it reduces the usability of `shinytest2::AppDriver`.
- ❌ It teases us to tap into input IDs with `app$set_inputs()`, making tests highly coupled to implementation details. Then a change as simple as renaming an ID will break our tests.
- ❌ If we use `app$set_inputs()` we set their server values, not values seen by the user. If we have a dropdown with `choices = c("A" = "a")` then we need to use `"a"` in a test instead of `"A"` which would be used by the user thus leaking implementation details. To mitigate this we might need some elaborate code to map choices to their server values. It's doable, but inconvenient. It might be easier to use [{selenider}](https://ashbythorpe.github.io/selenider/) to click on the dropdown and select the value.

## Cypress

- ✅ Nice Developer Experience, especially when combined with [Shiny autoreload](https://shiny.posit.co/r/reference/shiny/1.3.0/shiny-options.html). Cypress runs continuously as a separate process. When we change tests, they rerun. With autoreload, when we change the app, it reloads. In this setup we can immediately get feedback from the newest version of tests and the app after modyfing either.
- ✅ We can use [Cucumber](../setting-up-cucumber-in-rhino/) to abstract acceptance tests.
- ✅ Better separation of concerns between tests and the app code. In Cypress we don't have access to the Shiny server, we must treat the app as a "black box".
- ✅ We can be more likely to write [robust selectors](../robust-targetting-of-html-for-tests) as we're not enticed to use `app$set_inputs()`.
- ✅ In {shinytest2} we probably still need to write some JavaScript, but now you can write it in proper JavaScript files. We can use modules and classes to organise our test code.
- 🟡 More work is needed to interact with components that would be trivial to use with `app$set_inputs()`. On the other hand we should refrain from using that in order to make more resilient tests.
- ❌ You (and your team) need to have some experience with JavaScript.
- ❌ Setup might be difficult. It has a higher entry cost than {shinytest2}. Can be mitigated by using [{rhino}](https://appsilon.github.io/rhino/) which comes with Cypress out of the box.
- ❌ Code run during Cypress tests will not be included in {covr} coverage reports.

## My recommendation

If you have a chance, try both.

In my opinion both are good choices and you might just find that one suits you (and your team) better than the other.
