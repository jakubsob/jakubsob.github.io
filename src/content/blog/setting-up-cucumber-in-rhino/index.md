---
title: 'How to Set Up Cucumber for End-to-End Testing in Rhino Projects'
description: 'Learn how to set up Cucumber with Cypress in Rhino projects for clear and maintainable end-to-end tests.'
pubDate: 'Feb 28 2024'
tags: ["r", "tests", "shiny"]
---

**End-to-end testing can easily get difficult to maintain if we don't pay extra attention.**

End-to-end testing, compared to unit testing requires more setup to get the system to the desired state. If we don't reuse test code, testing scripts may get very difficult to update if the application changes. We can manage the complexity by wrapping reusable steps in functions and hiding page structure with [Page Objects](https://martinfowler.com/bliki/PageObject.html). Those are good ideas, but even then, what we're testing is obscured by the programming language syntax.

**We can abstract it even further, use an approach that makes it super clear what we're testing.**

[Cucumber](https://cucumber.io/) is a tool allows you to write tests in a human-readable format, using [Gherkin](https://cucumber.io/docs/gherkin/) – a language that is structured to be easy to understand by non-programmers and easy to parse by a test runner.


**What is easier to understand what is tested?**

Pure Cypress test?

```js
// cypress/e2e/featureDsiplay.cy.js
describe('Feature display', () => {
  it('Selecting Transmission as the grouping variable', () => {
    cy.visit('http://localhost:3333');
    cy.get('#variable_select').select('Transmission');
    cy.get('#formula_display').should('have.text', 'mpg ~ am');
  });

  it('Selecting Gears as the grouping variable', () => {
    cy.visit('http://localhost:3333');
    cy.get('#variable_select').select('Gears');
    cy.get('#formula_display').should('have.text', 'mpg ~ gear');
  });
});
```

Or a Cucumber specification:

```gherkin
# cypress/e2e/featureDisplay.feature
Feature: Formula display
  Scenario: Selecting Transmission as the grouping variable
    Given I am on the main page
    When I select Transmission variable
    Then the formula display should show 'mpg ~ am'

  Scenario: Selecting Gears as the grouping variable
    Given I am on the main page
    When I select Gears variable
    Then the formula display should show 'mpg ~ gear'
```

with support JS code?

```js
// cypress/e2e/featureDisplay.js
const { Given, When, Then } = require('@cypress/cucumber-preprocessor');

Given('I am on the main page', () => {
  cy.visit('http://localhost:3333');
});

When('I select {string} variable', (variable) => {
  cy.get('#variable_select').select(variable);
});

Then('the formula display should show {string}', (formula) => {
  cy.get('#formula_display').should('have.text', formula);
});
```

If you like the latter, read on. 👇

## Why should you use Cucumber?

- **Clear communication** - Gherkin is a language that makes it easy to understand for your stakeholders what is tested and how the system works. We can use this format not only to test existing code, but to drive development of new requirements with [ATTD](../acceptance_test_driven_development_of_shiny_modules/).
- **Reusability** - Steps can be reused across different scenarios, leading to less code duplication.
- **Maintainability** - If the implementation changes, you only need to update the step definitions, not the scenarios themselves. We are sure we preserve the business context.
- **Separation of concerns** - Scenarios describe the behavior of the application, step definitions describe how to test it.
- **Documentation** - Scenarios can be used as a form of documentation how the system works, what are the inputs and expected outputs.

## Adding Cucumber to a Rhino project

[Rhino](https://appsilon.github.io/rhino/index.html) comes packaged with [Cypress](https://appsilon.github.io/rhino/articles/tutorial/write-end-to-end-tests-with-cypress.html) for end-to-end testing. To use Cucumber we can use the [cypress-cucumber-preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor) that will parse Gherkin files and run them as Cypress tests.

Since Rhino uses webpack to bundle its JS dependencies, we can follow the [webpack-cjs](https://github.com/badeball/cypress-cucumber-preprocessor/tree/master/examples/webpack-cjs) example to set up the preprocessor.

The structure of the `tests/` directory in a rhino (>=1.6.0) project looks like this:

```
tests/
  testthat/
  cypress/
    e2e/
    plugins/
    support/
      e2e.js
  cypress.config.js
```

### 1. Initialize package in tests directory

In `tests/` directory we need to add a `package.json`:

```json
{
  "dependencies": {
    "@badeball/cypress-cucumber-preprocessor": "latest",
    "@cypress/webpack-preprocessor": "latest",
    "cypress": "latest",
    "webpack": "latest"
  }
}
```

### 2. Install dependencies

Run `cd tests & npm install` to install those dependencies. A `tests/package-lock.json` will be created.

*💡 Why not install those dependencies with the rest of JavaScript dependencies in `.rhino/` directory?*

*This directory is git-ingored by design. When a newer version of `rhino` is released, the `package.json` is overwritten.*

*If you modify rhino/package.json you'll loose those changes after an upgrade.*

### 3. Adjust Cypress config to use the preporcessor

We need to modify `tests/cypress.config.js` to use the cucumber preprocessor:

```js
const { defineConfig } = require("cypress");
const webpack = require("@cypress/webpack-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");

async function setupNodeEvents(on, config) {
  await addCucumberPreprocessorPlugin(on, config);

  on(
    "file:preprocessor",
    webpack({
      webpackOptions: {
        resolve: {
          extensions: [".js"],
        },
        module: {
          rules: [
            {
              test: /\.feature$/,
              use: [
                {
                  loader: "@badeball/cypress-cucumber-preprocessor/webpack",
                  options: config,
                },
              ],
            },
          ],
        },
      },
    })
  );

  return config;
}

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3333",
    specPattern: "**/*.feature",
    setupNodeEvents,
  },
});
```

This change tells Cypress preprocess `.feature` files before running tests.

### 4. Add required support file

We also need to add an empty `e2e.js` file to `tests/cypress/support/` directory.

### 5. Add feature files and step implementations

Now we're ready to start adding `.feature` files and their corresponding `.js` step definitions.

```feature
# cypress/e2e/featureDisplay.feature
Feature: Formula display
  Scenario: Selecting Transmission as the grouping variable
    Given I am on the main page
    When I select Transmission variable
    Then the formula display should show 'mpg ~ am'
```

```js
// cypress/e2e/featureDisplay.js
const { Given, When, Then } = require('@cypress/cucumber-preprocessor');

Given('I am on the main page', () => {
  cy.visit('http://localhost:3333');
});

When('I select {string} variable', (variable) => {
  cy.get('#variable_select').select(variable);
});

Then('the formula display should show {string}', (formula) => {
  cy.get('#formula_display').should('have.text', formula);
});
```

### 6. Make it run on CI

If you push those changes to CI you'll notice that they fail because we don't have the preprocessor installed.

To make it work on CI let's modify `rhino-ci.yml`

At any step before one that runs Cypress tests we need to install the preprocessor.

```yaml
- name: Install Cucumber preprocessor
  if: always()
  run: >
    cd tests && npm install
```

*💡 Note that we're modifying one of the rhino files.*

*If a new version of rhino changes the CI configuration, you'll need to bring back this step.*


🚀 **And that's it!**

After completing these steps your should run flawlessly.
