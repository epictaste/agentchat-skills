---
name: agentchat
description: "Run AgentChat, the Instagram comment to DM automation, through its MCP connector. Use when the user wants to connect AgentChat, switch or migrate from ManyChat, set up a keyword automation for a reel (\"Comment GUIDE\"), save keyword links, check stats, funnels, contacts or exports, schedule or publish a reel, or fix automations that do not answer."
---

# AgentChat

AgentChat answers comments under Instagram reels with a public reply and a DM with a link, optionally checks that the person follows, asks for an email and sends a reminder. Every contact is stored. You control it through the AgentChat MCP tools. Documentation: https://agentchat.georgkinzel.de/docs

## Before anything else

1. Check that the AgentChat tools are available (for example `status`). If they are not, follow [connect.md](references/connect.md) and stop until the user has connected.
2. Call `status` once at the start. It shows the account, the connection, webhooks, migration state and publishing state.

## Hard rules

- **Ask first.** These tools have a live effect on real people or on what is live. Call them only after the user said yes to exactly this action in this conversation: `go_live`, `send_dm`, `reply_to_comment`, `schedule_reel`, `finish_migration` with `confirm_manychat_disconnected: true`, `run_automation_on_existing_comments` with `dry_run: false`, `import_contacts` with `dry_run: false`, `update_automation` with `active: true`. Show what will happen first (preview, dry run, list of recipients).
- **Dry run first.** `import_automations`, `import_contacts` and `run_automation_on_existing_comments` default to a dry run. Show the result before the real call.
- **Never change ManyChat** except pausing an automation when the user explicitly says OK for that automation. Downloading the contact export only after the user said OK. No deleting, no editing, no publishing there.
- **Never invent links.** If a link is missing, ask.
- Messages to followers: in the user's language, short, casual, no dashes. Button titles up to 20 characters, DM texts up to 640.

## Which workflow

Short commands in Claude Code: `/agentchat:manychat` (switch from ManyChat) and `/agentchat:reel` (automation for one reel).

| The user wants | Read |
| --- | --- |
| Connect AgentChat, or tools are missing | [connect.md](references/connect.md) |
| Move from ManyChat, including contacts and the DM history | [migrate-from-manychat.md](references/migrate-from-manychat.md) |
| An automation for a new or existing reel | [new-reel.md](references/new-reel.md) |
| Numbers, funnels, contacts, export | [review-and-stats.md](references/review-and-stats.md) |
| Publish or schedule a reel | [scheduling.md](references/scheduling.md) |
| Something does not work | [troubleshooting.md](references/troubleshooting.md) |

## Instagram rules that shape every answer

- One private reply per comment, only up to 7 days after the comment.
- More DMs only within 24 hours after the person's last message or button tap.
- The follower check only works after the person wrote or tapped a button, so with `follow_gate` the first DM has a button.
