---
title: "Running a 1.5B LLM in your browser — what actually happens"
date: "2026-11-08"
tags: ["webgpu", "llm", "local-ai"]
---

This site's chatbot runs a Qwen 2.5 Coder 1.5B model entirely in your browser, on your GPU, via WebGPU. No server, no API key, no data leaves your machine. Here's what that actually means under the hood.

## The stack

- **MLC WebLLM** compiles the model to a portable format that WebGPU can execute.
- **WebGPU** is the browser's modern GPU API — compute shaders, not just drawing.
- **Q4 quantization** shrinks the model to ~1 GB so it fits in a browser tab.

## What you're feeling

The first visit downloads the model (~6 MB runtime + weights), which is why the chat view shows a loading state. After that, inference runs at a few tokens per second on a mid-range GPU. It's slow by server standards — but it's *yours*. Nothing you type is transmitted anywhere.

## Why bother?

Local inference is the honest way to build AI features: private by construction, works offline, and the user can see the whole stack. For a portfolio, it's also a live demo of the exact skills I use at work — RAG, local LLMs, and the patience to make hardware do things it wasn't sold for.
