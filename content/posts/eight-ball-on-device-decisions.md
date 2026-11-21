---
title: "Eight Ball: From a Fortune-Telling Toy to an On-Device Decision Tool"
date: "2026-11-21"
category: "Product Engineering"
tags: ["iOS", "Core ML", "On-device AI", "Product Design", "Decision Making"]
stamp: "FIELD NOTES"
sources: ["https://apps.apple.com/tw/app/%E5%85%AB%E8%99%9F%E7%90%83/id6827388818?l=en-GB"]
---

A Magic 8 Ball is an almost perfect example of an interface that does one thing and does it memorably. Ask a question, shake a black sphere, and receive an answer through a small window. The answer may be reassuring, evasive, or disappointing. It is also random. The object has no knowledge of the person asking.

[Eight Ball (八號球)](https://apps.apple.com/tw/app/%E5%85%AB%E8%99%9F%E7%90%83/id6827388818?l=en-GB), an independently developed iOS app, starts with that familiar ritual and asks a more interesting product question: **what happens when the same playful object also becomes an interface for comparing options and remembering decisions?**

This is a case study in a small product with an unusually clear tension. A fortune-telling toy is interesting precisely because it makes no attempt to be rational. A decision-support tool is useful only if the user can understand what went into its answer. Putting both in one app forces the interface to distinguish entertainment from evaluation.

## Two modes, two different promises

The app brings together a **Classic** experience based on the Magic 8 Ball's familiar set of twenty responses and a **Truth** mode for comparing multiple options, presented as an on-device, Core ML-powered feature. They might share a visual language, but they need different rules.

Classic mode asks very little of the user. Pose a question, shake the device or interact with the ball, and read a response. Its value is immediacy, suspense, and the pleasure of delegating an insignificant choice to chance. There is no reason to pretend that its responses are evidence.

Truth mode changes the task. Instead of asking a yes-or-no oracle, the user can put **two to eight alternatives** side by side. Once a product compares named options, the result is no longer understood as a theatrical prediction. Users are entitled to ask what information the app considered and whether the comparison is relevant to their preferences.

That difference is the central interaction contract:

| Classic | Truth |
| --- | --- |
| One question, one playful response | Multiple named alternatives to compare |
| Chance is part of the experience | A comparison should expose its limits |
| Speed and atmosphere matter most | Clarity and user agency matter most |
| The answer is disposable | The decision may be worth revisiting |

A strong product should never let the authority implied by "AI" spill backward into a random answer. Equally, a model-generated preference should not be disguised as certainty. A recommendation is a prompt to think, not permission to stop thinking.

## Why a decision journal changes the product

A one-off answer is easy to forget. A decision journal makes the surrounding choice visible over time. Eight Ball includes a place to record decisions, notes, and subsequent reflections.

This creates a second use case beyond the initial moment of indecision. Someone might compare alternatives today, choose one, and later return to understand whether the reasoning held up. The most valuable part of that record is not whether the app was "right." It is the connection between the options, the user's stated reasons, and what happened afterward.

That matters because many comparison tools optimize the moment of selection but ignore what comes next. Without a record, the person has little opportunity to distinguish a bad decision process from an unlucky outcome.

A journal also creates a product-design obligation: the history should preserve enough context to remain interpretable. A verdict without the original alternatives or notes is much less useful than a compact record of how the choice was framed.

## What Core ML adds, and what it does not

Core ML is Apple's framework for running machine-learning models in Apple-platform applications. For this app, the relevant promise is **on-device comparison**, rather than a cloud conversation for every choice.

That is a meaningful architectural boundary. A local inference path can reduce dependence on a remote API, avoid network round trips for supported operations, and keep model inputs on the device when the full processing path is local. It also changes engineering economics: there is no per-request inference bill for those local predictions.

But "runs with Core ML" is not a synonym for "understands the user," and a model's presence alone does not prove recommendation quality. The model family, training data, quantization, feature representation, accuracy, and runtime characteristics cannot be determined from a storefront description. Nor does local inference automatically establish that every feature or purchase flow works without an internet connection.

For a decision tool, the meaningful test is whether the output reflects the choices actually entered, whether users can supply or change their criteria, and whether the interface makes its uncertainty legible. Those questions matter more than advertising the size of a model.

## Designing for both play and deliberation

Eight Ball's product surface includes a free, low-friction classic interaction and premium capabilities oriented toward more deliberate choices, including weighted decisions, a tournament-style comparison flow, and extended decision history.

These approaches answer different cognitive needs. A weighted comparison allows criteria to matter by different amounts. A tournament reduces a crowded field into a sequence of pairwise choices. Neither is inherently more correct; each changes the mental work requested of the user.

The visual design must therefore do more than look like a Magic 8 Ball. It has to signal when an outcome came from chance, when it came from an algorithmic comparison, and when the user remains responsible for setting the criteria. The transition between these states is where product design becomes consequential.

This also illustrates a useful monetization distinction. The immediate toy experience is complete in itself; the paid layer targets a different depth of use rather than simply charging to receive an answer. Whether that packaging converts is a question for actual product data, not something a feature list can establish.

## Shipping a small app is an end-to-end engineering problem

An App Store release is more than an executable that launches on a developer's phone. It is a product exposed to installation constraints, store metadata, device differences, accessibility expectations, privacy disclosures, review requirements, and a payment system. Eight Ball is available through the [Taiwan App Store listing](https://apps.apple.com/tw/app/%E5%85%AB%E8%99%9F%E7%90%83/id6827388818?l=en-GB), making it a shipped, independently built application rather than a speculative UI concept.

Its scope is modest, and that is precisely why it is interesting. It combines a deliberately simple interaction, a second mode with machine-learning implications, a persistence layer in the form of a decision journal, and a paid feature boundary. Each is easy to describe alone. Making their expectations coexist is a genuine product and engineering problem.

The broader lesson is not that every choice needs AI. Most choices do not. It is that a good interface should tell users **what kind of answer they are receiving**. Sometimes randomness is the entire point. Sometimes a comparison can help organize thought. The useful product is the one that respects the difference.

**Explore the app:** [Eight Ball on the App Store](https://apps.apple.com/tw/app/%E5%85%AB%E8%99%9F%E7%90%83/id6827388818?l=en-GB).
