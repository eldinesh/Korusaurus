---
title: Usability test script generator
description: Turn a feature brief into a moderated usability test script with tasks, probes, and a warm-up.
tags: [claude, testing, research, designer, beginner]
sidebar_custom_props:
  category: prompts
  author: Sample Author
  figma: https://www.figma.com/file/EXAMPLE
---

# Usability test script generator

Paste a short feature description and get a ready-to-run moderated test script.

## Prompt

```text
You are a senior UX researcher. From the feature description below, write a
moderated usability test script for 5 participants.

Feature: {{paste feature description}}
Target users: {{who they are}}
Goal of the test: {{what we want to learn}}

Produce:
1. A 2-minute warm-up (rapport + context questions)
2. 4–6 realistic tasks, each with a success criterion
3. Neutral follow-up probes per task (no leading questions)
4. A 3-question wrap-up
Keep language plain and non-leading.
```

## Tips

- Replace every `{{placeholder}}` before running.
- Ask for a Markdown table if you want to paste straight into your research doc.
