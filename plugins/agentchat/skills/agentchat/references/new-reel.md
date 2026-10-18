# Automation for a reel

Goal: a comment keyword under one reel sends the right link, checked before it goes live.

## 1. Collect what is missing

Ask in one message for what you do not know yet:

- Keyword (for example GUIDE).
- Link (https://...). Never guess it.
- Link only for followers? (`follow_gate`)
- Ask for the email first? (`email_gate`)
- Reel already posted, or the next one?
- Optional: reminder for people who did not click (`follow_up_text`, `follow_up_minutes` up to 1380).

If the user posts reels with "Comment WORD" in the caption regularly, suggest auto mode instead ([auto-mode.md](auto-mode.md)).

## 2. Find the reel

- Posted: `list_posts`, pick the reel by caption or date and confirm with the user if unsure.
- Not posted yet: `next_post: true`. The automation attaches to the next post at most 2 minutes after publishing.

## 3. Create

`create_automation` with `trigger: "comment"`, `keywords`, three to five short `public_replies` (with `{username}`), `link_url`, and `media_ids` or `next_post`. Add `follow_gate`, `email_gate` and texts as agreed. Show the preview and `notes` from the result.

## 4. Check

Call `preview_automation`: public reply, DMs, buttons and the link check. If the link is broken, fix it with `update_automation`. `test_automation` with a sample comment shows which automation would answer.

## 5. Comments that are already there

Offer `run_automation_on_existing_comments` with `dry_run: true` and show who would get a DM. Send only after the user's OK with `dry_run: false`. Comments older than 7 days can no longer get a private reply.

## 6. Change or pause later

`update_automation` with only the changed fields. Pause with `active: false`. Delete with `delete_automation` (history stays in the export).
