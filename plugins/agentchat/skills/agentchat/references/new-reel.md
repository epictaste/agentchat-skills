# Automation for a reel

Goal: a comment keyword under one reel sends the right link, checked before it goes live.

Lead the user. Say which step you are on and what comes next. Talk in their language, short, no tool names unless they ask.

## 0. Kickoff

Tell the user in one short message:

**What I will do (about 2 minutes):**
1. Ask you four short questions.
2. Find the reel (or wait for your next one).
3. Build the automation as a draft and show you exactly what a commenter gets.
4. Switch it live after your OK.

Then ask everything you do not know yet in **one** message, with a default for each:

- Keyword? (for example GUIDE, or "any comment")
- Link? (https://...). Never guess it.
- Link only for followers? (default: no, `follow_gate`)
- Ask for the email first? (default: no, `email_gate`)
- Which reel: the latest, another one, or one that is not online yet? For one not online yet: the planned time and the first words of the caption.
- Optional: a reminder for people who did not click (`follow_up_text`, `follow_up_minutes` up to 1380).

## 1. Find the reel

- Posted: `list_posts`, pick the reel by caption or date. Show the user the caption start and date and confirm if unsure.
- Not posted yet (scheduled in AgentChat, Blotato, Instagram or anywhere else): `next_post: true` plus `reel_caption` (a unique part of the planned caption) and/or `reel_publish_at` (planned time with time zone). The automation shows as waiting, attaches itself to exactly that reel at most 2 minutes after it goes online and answers the comments from before. If two reels match, or the caption asks for a different keyword, it does not guess: it suggests the reel and you confirm with `attach_automation_to_reel`. No matching reel within 24 hours: it expires.
- Create it at the moment the reel gets scheduled, not after it is live. If AgentChat is not reachable at that moment, do not schedule the reel and tell the user.

## 2. Create as draft

`create_automation` with `active: false` (so nothing answers yet), `trigger: "comment"`, `keywords`, three to five short `public_replies` (with `{username}`), `link_url`, and `media_ids` or `next_post`. Add `follow_gate`, `email_gate` and texts as agreed. Write the texts in the language of the reel.

## 3. Show the preview

Call `preview_automation` and show the user, as it looks on Instagram:

1. The public reply under the comment.
2. Every DM with its button.
3. Whether the link opens.

If the link is broken, fix it with `update_automation`. Ask: "Looks right? Then I switch it live." Change what the user wants and show the preview again.

## 4. Go live

After the user's OK: `update_automation` with `active: true`. Confirm in one line: keyword, reel, live since now.

## 5. Comments that are already there

If the reel already has comments, offer `run_automation_on_existing_comments` with `dry_run: true` and show who would get a DM. Send only after the user's OK with `dry_run: false`. Comments older than 7 days can no longer get a private reply.

## 6. Wrap up

Tell the user how to test it: comment the keyword with a second account. Their own account is ignored. Offer `/agentchat:reel` again for the next reel.

## Change or pause later

`update_automation` with only the changed fields. Pause with `active: false`. Delete with `delete_automation` (history stays in the export).
