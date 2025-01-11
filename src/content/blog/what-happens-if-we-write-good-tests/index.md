---
title: 'The Benefits of Writing Good Automated Tests'
description: 'Learn how good automated tests can save time, reduce costs, and improve software quality.'
pubDate: 'Nov 24 2024'
tags: ['tests']
---

Introduction of automated testing has its costs. It takes time to learn testing, it takes time to write and maintain tests.

We need to be aware of those costs.

It might be tempting to skip on testing in the early stages of the project, but it might be a costly mistake.

Development without testing might be faster at the beginning, but as the project goes on, there should be a point when the initial investment of writing tests starts to pay off.

![Tests speed up development](/blog/what-happens-if-we-write-good-tests/cost-testing_good.svg)

We have built good tests when the additional cost of building and maintaining automated tests is offset by savings through reduced manual testing. It should be offset by savings on debugging, troubleshooting and the cost of fixing the defects that would have gone undetected until the early production usage of the software.

To have good tests we need to:
- Find the right tests for coverage. We don't need to test everything. Test only what we need from the system.
- Have resources for testing. Testing is an investment in quality that pays off in the long run.
- Ensure our tests are fast. If we need to wait for a long time for the feedback from tests, we will not run them often.
- Make tests predictable. We need both tests and the test environment to be deterministic to not troubleshooting them often.
- Prioritize testing. If we write them first, we'll never "run out of time" to write them.

When we managed to build good tests we can channel our resources away from manual testing to delivering value.
