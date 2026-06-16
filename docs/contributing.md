---
title: Share an experiment
sidebar_position: 0
description: How to add your AI experiment to the Knowledge Hub — no coding, no git.
---

# Share an experiment

You don't need to know GitHub, git, or Markdown. You fill out a web form; a maintainer
reviews it; it appears on the site. That's it.

## One-time setup (2 minutes)

1. Create a **free GitHub account** at [github.com/signup](https://github.com/signup).
2. Ask a maintainer to add you to the team (so your submissions are easy to track).

You'll never touch branches, commits, or code — just a form.

## Submit your experiment

1. Go to the repository on GitHub → the **Issues** tab → **New issue** →
   choose **Share an AI experiment**.
   _(Maintainers: the "Submit an experiment" links in the navbar and footer point straight at this form once you set your org/repo in `docusaurus.config.ts`.)_
2. Fill in the fields:
   - **Type of Resource** — Skill, Prompt, Directive, Project, Workflow, or Other
   - **Title** — clear, descriptive, Title Case (e.g. "Jira Worklog Skill")
   - **Banner / Image** *(optional)* — drag in one image for the card
   - **One-line summary** — shown on the card
   - **Description** — paste the skill / prompt / directive / project instructions (use a code block for prompts so they copy cleanly)
   - **Made by** — the person who created it
   - **Tags** *(optional)* — pick from the list; these power the homepage filters
   - **Figma / other links** *(optional)* — paste any URLs
   - **File attachments** *(optional)* — drag in one or more files (a `.skill`/`.zip`, a `.txt`/`.md`, etc.); they become downloads on your entry
3. Click **Submit**.

## What happens next

- A maintainer reviews your submission and adds the **`approved`** label.
- Automation turns it into a page and opens a pull request (you don't need to do anything).
- Once it's merged, your experiment is **live on the site** — images and files included.

## Tips

- One experiment per submission keeps things tidy.
- Put the actual prompt/skill text in the **Description** so people can copy it.
- Screenshots make cards much more clickable — attach at least one if you can.
