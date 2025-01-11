---
title: 'The Consequences of Poor Test Writing in Software Development'
description: 'Learn how poor test writing can halt your development process and discover strategies to avoid this pitfall.'
pubDate: 'Nov 22 2024'
tags: ["tests"]
---

Whether we succeeded in writing good tests might be discovered only on the later stages of the project, when the test suite becomes large enough.

If we were unsuccessful, tests become a burden, and can halt the development process as changing the production code requires changing a ton of tests.

If tests become too difficult or time consuming to maintain, it’s easy to give up on adding them. We might be even tempted to remove some of the test code as it’s not possible to change it.

This situation is dangerous and it slowly creeps in, it might be hard to notice it early, but there are heuristics that can help us see and avoid it, like the Testing Pyramid and separation of concerns.

![Tests slow down development](/blog/what-happens-if-we-dont-write-good-tests/cost-testing_bad.svg)

To avoid this situation we need to focus on:

- Testing what we need from the system. Don’t test every combination of inputs.
- Testing only public interfaces of our code. Then we can be more confident we don’t test implementation details that make our tests brittle.
- Writing fast tests. If a specification of our system can be asserted in a focused, fast unit test, do it with a unit test, not E2E or acceptance test.

Don’t let tests get in your way of delivering great software, use them to build your code faster and with better confidence.
