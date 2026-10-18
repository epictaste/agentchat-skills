# Switch from ManyChat

Goal: every ManyChat comment automation runs in AgentChat, no reel goes quiet during the switch and nobody gets a DM twice. Guide for the user: https://agentchat.georgkinzel.de/migrate

**Hard rule: in ManyChat you only read.** Do not click Save, Publish, Pause, Delete, Duplicate or any toggle. If a dialog asks to save, choose discard. The only exception is step 7: pausing one automation after the user said OK for exactly that one.

## 1. Start

Call `status` and `list_posts`. ManyChat stays connected for now.

## 2. Read ManyChat (browser agent, read only)

Fastest and exact: if you can run JavaScript in a browser tab where the user is logged in to ManyChat (Claude in Chrome, Codex with a browser), run the steps in [manychat-automations-export.js](manychat-automations-export.js). It reads every live comment automation from the ManyChat web app (reel ID, keywords or "any comment", public replies, first DM and button, follower check text, link DM, link and button) and returns the `automations` array for `import_automations` directly. Read only, nothing in ManyChat changes. Tested with 24 live automations, all passed the dry run.

Otherwise use the MCP prompt `manychat_migration_prompt` or follow it: open Automation, open every automation triggered by a comment on an Instagram post or reel and note name, keywords (or "any comment"), the reel (link, a unique part of the caption, or "next post"), public reply variants, DM text, button text, link, follower check and its text, email question, active or not.

Without a browser: ask for screenshots or a list, or call `suggest_automations_from_posts`, which finds "Comment WORD" in captions and returns `import_input`.

## 3. Build the JSON

One object per automation for `import_automations`:

```json
{"automations": [{"name": "GUIDE reel", "trigger": "comment", "permalink": "https://www.instagram.com/reel/ABC123/", "keywords": ["GUIDE"], "public_replies": ["Sent you the link {username} 📩"], "link_text": "Here is your guide 👇", "link_button": "Open guide", "link_url": "https://example.com/guide", "follow_gate": false, "email_gate": false, "active": true}], "dry_run": true}
```

- No reel link: `caption_contains` with a unique caption part. Next post: `next_post: true`.
- Any comment: `match_mode: "any"` and no keywords.
- First DM has a button that leads to a second DM with the link: first DM into `opening_text` and `opening_button`, second into `link_text` and `link_button`.
- Follower check: `follow_gate: true` plus `gate_text` and `gate_button`. Email: `email_gate: true` plus `email_text`.
- Entries from the browser script with a `review` field need a look in ManyChat first. The script was only tested with "any comment" automations: check `keywords` and `follow_gate` of every entry before the dry run.
- Leave out what you could not find. Never invent a link.

## 4. Dry run

Call `import_automations` with `dry_run: true`. Show per entry the post it found, warnings (post not found, ambiguous caption, keyword conflict, missing link, thread ownership) and errors. Fix them with the user and repeat.

## 5. Import as drafts

After the user's OK: `import_automations` with `dry_run: false`. Valid entries are created as drafts with a shared `import_batch`. Drafts answer nothing.

## 6. Preview every draft

Call `preview_automation` for each draft and show the public reply, every DM with buttons and the link check. Flag broken links (`ok: false`) and fix them with `update_automation` before going live. If a `link_url` points to `mnch.at` or another ManyChat short link, it stops working when ManyChat is cancelled: ask the user for the real target and fix it with `update_automation` before `go_live`.

## 7. Go live, then pause in ManyChat

Ask for an explicit OK. Then `go_live` with the `import_batch`. Follow `next_steps` from the result in this order:

1. AgentChat is live now.
2. Work through `manychat_pause_checklist` one automation at a time. For each one ask: "Pause <name> (<keyword>) in ManyChat now?" Pause only after a yes, or let the user do it.
3. Run the `gap_fill` calls (`run_automation_on_existing_comments` with `since_minutes: 30`): first with `dry_run: true`, show who would get a DM, then after the user's OK with `dry_run: false`.

During the overlap AgentChat protects against double DMs: Instagram allows one private reply per comment. Before answering, AgentChat reads the replies under the comment and skips it if the account already answered without AgentChat (run state `skipped_other_tool`). If Meta answers that the comment was already replied to, that also counts as skipped.

## 8. Transition mode

While ManyChat is connected it owns the conversations, so AgentChat may only send the one private reply. Imported automations run in transition mode: the link goes out directly in that reply. Follower check, buttons, email and reminder are stored as target settings. DM and story automations wait paused. `thread_owner_blocked` in `activity` or a warning in `status.migration` means ManyChat still owns conversations.

## 9. Finish

1. The user removes ManyChat in the Instagram app: Settings, Apps and websites.
2. Call `finish_migration` without confirmation and show what will change.
3. After the user confirms that ManyChat is disconnected and says OK: `finish_migration` with `confirm_manychat_disconnected: true`.
4. Offer auto mode for new reels ([auto-mode.md](auto-mode.md)).
5. Do not cancel the ManyChat subscription yet: read the contacts first (step 10).

## 10. Contacts and their origin

The contacts live in ManyChat, so they come over as a file.

ManyChat has no CSV export for contacts (Bulk actions only offer tagging, sequences, deleting and custom audiences). So the contacts are read from the ManyChat web app itself, read only.

1. Ask the user whether you may read the ManyChat contacts and save them as a CSV file in their downloads. Without a yes, stop here.
2. In a browser where the user is logged in to ManyChat, run the three steps in [manychat-contacts-export.js](manychat-contacts-export.js) in the ManyChat tab (JavaScript in the page). Step A loads the contact list, step B reads tags and source of each contact (about 6 minutes for 1,000 contacts), step C downloads `agentchat-contacts.csv` with Instagram username, Instagram ID, names, status, dates, tags and source. Never open the Bulk actions menu and never click anything that changes contacts.
3. Call `import_contacts` with the CSV text in `csv` (or a list in `contacts`). `dry_run` is true by default. Show the counts `new`, `updated`, `skipped`, `errors`, `duplicates_in_file` and `invalid_emails`, the column mapping and the examples.
4. Explain the origin: tags like `link_clicked (<date>)` and automation or widget columns become `source` and mark the contact as clicked. If a source should belong to a specific AgentChat automation and was not matched, pass `source_map` (ManyChat name or tag to automation id) and run the dry run again.
5. After the user's OK: `import_contacts` with `dry_run: false`. Existing contacts are only filled in, never overwritten.
6. The Instagram ID from ManyChat is the same ID the Instagram API gives AgentChat, so imported contacts are linked right away.
7. No browser agent: the user pastes the CSV into the chat (columns as in step C) and you import it with `import_contacts` as in steps 3 to 5. The dashboard has no import page; the docs explain the contact import under `/docs#manychat-contacts`.

## 11. DM history

The DMs are stored at Instagram, not at ManyChat.

1. Call `backfill_conversations`. It only reads, sends nothing and saves the messages on the contacts, skipping duplicates by message ID. It also links imported contacts to their Instagram ID.
2. It runs in the background in steps. Check `status` for `backfill` until it says `done`.
3. Tell the user the limit from Meta: only the 20 most recent messages of each conversation can be loaded, and old conversations in the Requests folder are left out.
