---
title: 'Understanding Software Quality: Unit Tests vs Acceptance Tests'
description: 'Learn the differences between unit tests and acceptance tests and how they contribute to software quality.'
pubDate:  'Nov 29 2024'
tags: ["tests", "bdd"]
---

There are 2 aspects of software quality.
- Have we built the correct software?
- Have we built the software correctly?

Tests can help us achieve both.

- Acceptance tests tell us if built the correct software.
- Unit tests tell us if we built the software correctly.

![Testing pyramid](/blog/2-aspects-of-software-quality/pyramid.svg)

If we are practicing a development process in which we write tests before writing production code, tests give us a way to capture what we expect from the system before we build it.

Tests allow us to define the system's behavior across different scenarios in a format that can be executed. To ensure we're building the right software, it's essential that our tests accurately reflect how the system will be used in practice.

Thinking through these scenarios in sufficient detail to turn them into tests helps uncover areas where the requirements may be unclear or contradictory.

In this sense tests help us reduce the risk of building the wrong thing. This is the premise of Behavior-Driven Development.

Want to learn more how you could implement acceptance tests in practice? Check out the [cucumber](https://jakubsob.github.io/cucumber/) package.
