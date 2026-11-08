---
title: "RAG without the buzzwords: FAISS, embeddings, and a chatbot that knows my CV"
date: "2026-11-08"
tags: ["rag", "faiss", "local-ai"]
---

Retrieval-augmented generation sounds like a buzzword. In practice it's three steps: chunk your documents, embed them, and look up the nearest neighbors before you ask the model anything.

## The pipeline

1. **Chunk** — split the source text (my CV, my publications, my project notes) into readable pieces.
2. **Embed** — turn each chunk into a vector with an embedding model.
3. **Retrieve** — when a question arrives, embed it and find the closest chunks with FAISS.
4. **Generate** — feed the question plus those chunks to the LLM as context.

## Why FAISS

FAISS is Meta's vector similarity search library. For a handful of documents it's overkill — but it's the same library that scales to billions of vectors, so learning it once means you're ready for the real thing.

## The local twist

In my prenatal-education chatbot (Gemma-3-4B-IT + FAISS + Flask), the whole pipeline runs on a single machine. The embedding model, the index, and the LLM are all local. That's the part that matters for healthcare data: the patient's words never leave the building.

The same idea powers this site's chatbot, except the "documents" are my own portfolio and the index is built at build time.
