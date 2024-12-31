---
title: 'How We Achieved 96% Code Coverage in a 2-Week App Prototype'
description: 'Learn how we built an app prototype with 96% code coverage in just 2 weeks using TDD and effective testing strategies.'
pubDate: 'Oct 6 2023'
tags: ['r', 'tests', 'tdd', 'shiny']
---

**The project had unknowns that would affect the development, but since we only had 2 weeks we didn’t have time to wait for all the business experts’ answers — we had to work around them.**

The goal of the project is to build an app that visualizes project timelines based on data from Excel. There are many projects, each having multiple events that may span multiple years. We have some test data provided by the client, but we realize it’s not clear how to transform it into a shape the plot can be built from. We also know the test data doesn’t contain all the events it would in production, so we need to be flexible to adopt the app to more events later.

**We start with having a quite good idea of what we don’t know yet.**

Given all the unknowns we can’t work sequentially —  starting from preparing the data, then constructing app reactivity, to building the plot. We decided to work simultaneously on data reading and the plot — two opposite ends of the app. After having both ends in place we will then stitch two parts together. This will be done in a layer that takes input data and inputs from the UI to feed data into the plot.

**The test-first approach allows us to work independently on separate parts of the app — which leads to low coupling and good separation of concerns — while providing instant feedback on design choices we make.**

We started implementing the plot:

- We set up approval tests for the plot, testing all crucial behaviors it should manifest.
- We set up test data in a format that will be the easiest for the plot to parse — a list of lists.
- We ended up with a plot function that is completely decoupled from the app, with a well-defined interface — all its requirements set upfront.

At this point, we have an app that displays a plot with fake data — many parts are missing but we have a minimal specification done, one that we could deploy and get feedback on.

We know that in the final product, data will be read from an Excel file located in Sharepoint, but we don’t have access to it yet — how to get around this issue? We start with the simplest variant possible, replacing Sharepoint with a local directory with a CSV file.

- We set up a test that the app should read data using a `Connection` object when the session starts.
- We set up tests and implementation of the `CsvConnection` object that reads test data from a file in the repository.
- We plugged in the `CsvConnection` object to the app.
- When we move to clients’ infrastructure, we will add a `SharepointExcelConnection` that implements the `Connection` interface. We will only need to replace `CsvConnection` with the new object to get the app working.

Setting up tests first helps you focus on defining what you need to get the code to work — **use wishful thinking** — set up your interfaces the way you wish you had them, and you can translate the real world to match your interfaces later.

**Test Driven Development brings design to the front — it forces you to think about what you need to solve the problem — it helps you understand the domain.**

As we’re adding more plot features, we also implement the basic app layout - page navigation for different plot views. We also use the test-first approach. We start with a test that clicking on a button changes the URL query as we think we won’t need the state to be stored in the server. It doesn’t affect the plot yet, which is still static with fake data, but we will stitch those two later. We end up with a module that is responsible for setting up an observable event that can be consumed by other modules. We merged this non-functional feature to the main branch as the app isn’t used by users yet, if that was not the case we could still merge it, we’d just hide it with a feature flag until it’s finished.

As we learned more about the data shape required for the plot we started implementing a `DataApi` interface. Its responsibility is to transform input data using parameters from the interface to feed it into the plot. This is also a stage when we start implementing new features of the plot that will support those new views.

**As we started adding new views we realized that the accidental complexity of our code is higher than it should be.**

[Accidental complexity is the complexity that’s not essential to the problem](https://en.wikipedia.org/wiki/No_Silver_Bullet). It’s the additional complexity of solving the problem with code. Our first data structure choice was suboptimal — we used lists as this is a data structure that is fed to `echarts::e_list`, but data manipulation on tables would be way easier.

**We reduced the accidental complexity by refactoring — it was safe as we already had good tests in place.**

Plot function tests check the **behavior of the function** — we test if it produces the correct images. **We don’t test implementation details**. This allows us to safely change the implementation detail — switch from using lists to tables. This change reduced the accidental complexity of the code and allowed for easier parametrization to introduce new plot views.

**Once we concluded the App Sprint it turned out we obtained an almost perfect code coverage.**

We didn’t play catch-up with tests.

We didn’t create tasks for covering code with tests.

We mostly wrote tests first as a part of our development process.

We ended up with a prototype with a safety net that guarantees it works as expected and should be easy to extend in project continuation
