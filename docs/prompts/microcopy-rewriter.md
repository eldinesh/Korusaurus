---
title: Microcopy rewriter
description: Rewrite UI strings for clarity, tone, and length constraints — with three options each.
tags: [model-agnostic, content, writer, beginner]
sidebar_custom_props:
  category: prompts
  author: Sample Author
---

# Microcopy rewriter

Get three on-brand variations for any UI string, respecting a character budget.

## Prompt

```text
Rewrite the following UI text. Voice: {{brand voice, e.g. "calm, confident, plain"}}.
Hard limit: {{N}} characters. Avoid jargon and exclamation marks.

Original: "{{paste string}}"

Give 3 options as a numbered list, each with its character count in parentheses.
```
