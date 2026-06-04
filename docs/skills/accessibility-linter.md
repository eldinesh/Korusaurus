---
title: Accessibility linter skill
description: A Claude skill that reviews a screen description or spec against WCAG 2.2 AA.
tags: [claude, handoff, designer, advanced]
sidebar_custom_props:
  category: skills
  author: Sample Author
---

# Accessibility linter skill

Reviews a flow or component spec and lists WCAG 2.2 AA risks with concrete fixes.

## What it does

- Checks contrast, focus order, target size, and labels
- Returns issues ranked by severity with a suggested remedy
- Cites the relevant success criterion for each issue
