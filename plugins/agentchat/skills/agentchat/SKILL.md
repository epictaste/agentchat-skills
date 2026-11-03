---
name: agentchat
description: "Run AgentChat, the Instagram and Facebook page comment to DM automation, through its MCP connector. Use when the user wants to connect AgentChat, switch or migrate from ManyChat, set up a keyword automation for a reel (\"Comment GUIDE\"), save keyword links, check stats, views, watch time, reach, funnels, contacts or exports, schedule or publish a reel, photo post or story (also on YouTube, TikTok and Facebook), build multi step DM flows with button menus, reminders and tags, or fix automations that do not answer."
---

# AgentChat

AgentChat answers comments under Instagram reels and posts of Facebook pages with a public reply and a DM with a link, optionally checks that the person follows (Instagram only), asks for an email and sends a reminder. Every contact is stored. You control it through the AgentChat MCP tools. Documentation: https://agentchat.georgkinzel.de/docs

## Before anything else

1. Check that the AgentChat tools are available (for example `status`). If they are not, follow [connect.md](references/connect.md) and stop until the user has connected.
2. Call `status` once at the start. It shows the account, the connection, webhooks, migration state and publishing state.
3. If `status` lists more than one entry under `accounts`, settle which account (Instagram account or Facebook page, see `platform`) this task is for before anything else. Take it from the user's request; if the request does not say, ask. Say it back in one line ("Working on @myshop").

## Hard rules

- **Ask first.** These tools have a live effect on real people or on what is live. Call them only after the user said yes to exactly this action in this conversation: `go_live`, `send_dm`, `reply_to_comment`, `schedule_reel`, `finish_migration` with `confirm_manychat_disconnected: true`, `run_automation_on_existing_comments` with `dry_run: false`, `import_contacts` with `dry_run: false`, `update_automation` with `active: true`. Show what will happen first (preview, dry run, list of recipients).
- **Dry run first.** `import_automations`, `import_contacts` and `run_automation_on_existing_comments` default to a dry run. Show the result before the real call.
- **Never change ManyChat** except pausing an automation when the user explicitly says OK for that automation. Downloading the contact export only after the user said OK. No deleting, no editing, no publishing there.
- **Never invent links.** If a link is missing, ask.
- **Name the account on every call.** With several accounts, pass `account` (`@username`) on every tool call, reads included, and above all on `create_automation`, `update_automation`, `schedule_reel` and everything that posts or sends. Never rely on the default account: other assistants may work on another account of the same login at the same time, and the default is only what the user picked in the dashboard.
- Messages to followers: in the user's language, short, casual, no dashes. Button titles up to 20 characters, DM texts up to 640.

## Which workflow

Short commands in Claude Code: `/agentchat:manychat` (switch from ManyChat) and `/agentchat:reel` (automation for one reel).

| The user wants | Read |
| --- | --- |
| Connect AgentChat, or tools are missing | [connect.md](references/connect.md) |
| Move from ManyChat, including contacts and the DM history | [migrate-from-manychat.md](references/migrate-from-manychat.md) |
| An automation for a new or existing reel | [new-reel.md](references/new-reel.md) |
| Numbers, insights, funnels, contacts, export | [review-and-stats.md](references/review-and-stats.md) |
| A button menu, several reminders or questions before the link | [flows.md](references/flows.md) |
| Publish or schedule a reel, photo post or story, on one or several platforms | [scheduling.md](references/scheduling.md) |
| Something does not work | [troubleshooting.md](references/troubleshooting.md) |

## Flows (multi step DMs, button menus, reminders)

An automation can carry a `flow` instead of the single link DM: a button menu with several paths, two or more reminders, questions before the link, an email typed right into the DM, tags on the contact. Everything before the link DM stays (public reply, opening button, follower check, email). Use it when one link plus one reminder is not enough. Rules, the 24 hour window and ready recipes: [flows.md](references/flows.md). Show `test_automation` and `preview_automation` and get the user's OK before it goes live.

## Instagram rules that shape every answer

- One private reply per comment, only up to 7 days after the comment.
- More DMs only within 24 hours after the person's last message or button tap.
- The follower check only works after the person wrote or tapped a button, so with `follow_gate` the first DM has a button.
