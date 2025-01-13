---
title: "Maximizing Efficiency with AI-Assisted Testing: Lessons Learned"
titleSocial: "I've been coding with AI assist for over a year. Here's what I've learned about AI-assisted tests."
description: "Discover the benefits and challenges of AI-assisted testing, and learn how to optimize your testing process for better code quality and maintainability."
pubDate: 'Jan 13 2025'
tags: ["r", "tests"]
---

With AI-assistance developers can focus on designing, not just writing code, so it's even more important we know what good code, and tests, looks like.

## AI generated tests might be not optimized for human readability.

When we allow the AI to generate tests, we might end up with tests that are working and are difficult to maintain.

One of the main reasons we write automated tests is to describe how the system should behave. If we can't easily understand what tests are doing, it's hard to know if the code is doing the right thing. Such tests will slow down the development process, as we need to spend more time understanding and maintaining them.

In my experience, the best method to immediately improve test readability is to:
- Use Arrange, Act, Assert comments. Use them to separate each part of the test.
- Always test for a single outcome/behavior. If you call your tested code multiple times in a test, you should split it.

If you are using a chat to generate tests, ask it to adhere to these rules, or write one test on your own and ask it to copy your style.

If you can't do that, refactor the tests.

## AI generated tests might not be aware of the intent.

If we just ask AI to generate unit tests, it might not be aware why the code is there in the first place.

If you see a generated test title that says, "it should work correctly", you should refactor it and specify what "correctly" means in this context. Otherwise instead of just reading the title and immediately knowing what the test is about, you will need to read the whole test to understand it.

Add context to your tests, your future self will thank you.

## AI generated tests can be added only after the code was written.

AI can be a great help when adding tests to a legacy codebase, but if we develop new code, I suggest keeping to the old-fashioned TDD.

When we write tests first, we are forced to think about the design of the code. We need to think about how the code should behave before we write it. We can also use tests to experiment with interfaces and select the best one.

When we're done with the design, we can ask AI to write the code to pass those tests.

Human-written tests are a guardrail for AI-generated code. We know what was the intent of the code, and we can check if the AI code is doing what we wanted. Just pay attention if AI isn't adding more code than necessary to pass the test.

Use AI wisely, and it can speed you up in the long term, not just here and now.
