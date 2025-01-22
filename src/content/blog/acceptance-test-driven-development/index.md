---
title: 'Acceptance Test-Driven Development with Shiny'
description: 'Learn how to apply Acceptance Test-Driven Development (ATDD) to build robust Shiny applications using {shinytest2} and {selenider}.'
pubDate: Jan 22 2025
tags: ["r", "tests", "shiny"]
---

I've created this Shiny project to showcase how I practice Acceptance Test-Driven Development with {shinytest2}. The app is very simple – calculate net income from income and expenses inputs. Even in such a simple example we can see:

- how to start a Shiny project by writing a test first. I'm using {rhino}, but the same method can be used for any Shiny framework you use,
- how to interact with the app from tests in a way that won't break them often by using {selenider} instead of {shinytest2} snapshots,
- how to evolve your project from the simplest solutioan, to implementing more usable app – here we're starting with a "forgetful" app, then implementing persistent storage,
- how to cycle between ATDD and TDD – from specifying user's needs to working on implementation details that are hidden from users,
- how using robust selectors allows us to refactor UI without breaking tests.

💡 **The best way to explore the repo is to go commit by commit listed in the README.**

See how we can go from a failing test to a working app.
I know, it's a very simple app, but the same process can be applied to any project, no matter how complex it is.

Check it out here: https://github.com/jakubsob/shiny-acceptance-tdd
