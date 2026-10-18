# Switch from ManyChat

Goal: every ManyChat comment automation and every contact is in AgentChat, no reel goes quiet during the switch and nobody gets a DM twice. Guide for the user: https://agentchat.georgkinzel.de/migrate

Lead the user. They should always know which step you are on, what you do next and what they have to do. Talk in their language, short, no tool names unless they ask.

**Hard rule: in ManyChat you only read.** Do not click Save, Publish, Pause, Delete, Duplicate or any toggle. If a dialog asks to save, choose discard. The only thing the user changes in ManyChat land is removing ManyChat in Instagram at the end (step 7), and they do that themselves.

## 0. Kickoff: say what happens and what you need

Before any tool call, tell the user in one short message:

**What I will do (about 15 minutes):**
1. Read your ManyChat automations (only read, nothing changes there).
2. Read your ManyChat contacts and save them as a CSV in your downloads.
3. Recreate the automations in AgentChat as drafts and show you a preview of each.
4. Import the contacts.
5. Switch AgentChat live after your OK.
6. You remove ManyChat in Instagram, I switch on the follower check. Done.

**What I need from you:**
- Claude in Chrome (or another browser agent) is switched on, and you are logged in to ManyChat in that browser.
- AgentChat is connected (Instagram login). If not, we do that first ([connect.md](connect.md)).
- Your OK that I may read the contacts and save them as a CSV.

Then ask: "Ready?" Wait for a yes. That yes covers reading ManyChat and saving the contact CSV, nothing that goes live.

Without a browser agent: offer screenshots or a list of the automations instead, or `suggest_automations_from_posts`, which finds "Comment WORD" in captions and returns `import_input`. Contacts then come as a CSV the user pastes (step 2, item 5).

## 1. Check AgentChat

Call `status` and `list_posts`. Tell the user in one line: account, connected yes or no, how many reels you see. If `account_status` is not `active`, fix that first ([connect.md](connect.md)).

## 2. Export from ManyChat (read only)

Tell the user: "Step 1 of 6: I am reading your ManyChat automations."

1. In the browser tab where the user is logged in to ManyChat, run the steps in [manychat-automations-export.js](manychat-automations-export.js). It returns the `automations` array for `import_automations` (reel, keywords or "any comment", public replies, first DM and button, follower check text, link DM, link and button). Tested with 24 live automations.
2. No JavaScript in the browser: use the MCP prompt `manychat_migration_prompt` or open every comment automation and note name, keywords, reel, public replies, DM texts, buttons, link, follower check, email question, active or not.

Tell the user: "Step 2 of 6: I am reading your contacts. This takes about 6 minutes per 1,000 contacts."

3. In the same tab run the three steps in [manychat-contacts-export.js](manychat-contacts-export.js): step A loads the list, step B reads tags and source of each contact, step C downloads `agentchat-contacts.csv`. Compare `progress().list` with `progress().total` and with the number on the ManyChat Contacts page. Never open the Bulk actions menu.
4. ManyChat has no CSV export of its own, this script is the only way. Keep the CSV until the move is done.
5. No browser agent: the user pastes a CSV (columns as in step C) or a list into the chat.

Give a short summary: "Found N automations and M contacts."

## 3. Build the JSON and test it

One object per automation for `import_automations`:

```json
{"automations": [{"name": "GUIDE reel", "trigger": "comment", "permalink": "https://www.instagram.com/reel/ABC123/", "keywords": ["GUIDE"], "public_replies": ["Sent you the link {username} 📩"], "link_text": "Here is your guide 👇", "link_button": "Open guide", "link_url": "https://example.com/guide", "follow_gate": false, "email_gate": false, "active": true}], "dry_run": true}
```

- No reel link: `caption_contains` with a unique caption part. Next post: `next_post: true`.
- Any comment: `match_mode: "any"` and no keywords.
- First DM with a button that leads to a second DM with the link: first DM into `opening_text` and `opening_button`, second into `link_text` and `link_button`.
- Follower check: `follow_gate: true` plus `gate_text` and `gate_button`. Email: `email_gate: true` plus `email_text`.
- Entries from the script with a `review` field need a look in ManyChat first. Leave out what you could not find. Never invent a link.

Call `import_automations` with `dry_run: true`. Show the user a compact table: reel, keyword, link, button. List warnings (post not found, ambiguous caption, keyword conflict, missing link) and errors and fix them together.

## 4. Drafts and preview

Tell the user: "Step 3 of 6: I am creating the automations as drafts. They answer nothing yet."

1. `import_automations` with `dry_run: false`. Valid entries become drafts with a shared `import_batch`.
2. `preview_automation` for each draft. Show once what a commenter gets: public reply, DMs, buttons. Then the link check for all links. Flag broken links and fix them with `update_automation`. A `link_url` on `mnch.at` stops working when ManyChat is cancelled: ask for the real target.

## 5. Contacts

Tell the user: "Step 4 of 6: I am importing your contacts."

1. `import_contacts` with the CSV text in `csv`, `dry_run` is true by default. Show `new`, `updated`, `skipped`, `errors`, `duplicates_in_file`, `invalid_emails` in one short table.
2. Sources: tags like `link_clicked (<date>)` and widget columns become `source`. If a source should belong to a specific automation, pass `source_map` and run the dry run again.
3. After the user's OK: `import_contacts` with `dry_run: false`. Existing contacts are only filled in, never overwritten. The Instagram ID from ManyChat is the same one AgentChat gets, so contacts are linked right away.

## 6. Go live

Tell the user: "Step 5 of 6: AgentChat goes live. ManyChat keeps running until you remove it, AgentChat skips comments ManyChat already answered."

Ask for an explicit OK, then `go_live` with the `import_batch`. While ManyChat is still connected, AgentChat runs in transition mode: the link goes out directly in the one private reply, without follower check. That is fine for a few minutes.

The result also contains `manychat_pause_checklist`. The user does not need it: removing ManyChat in Instagram (step 7) stops all ManyChat automations at once. Only offer the checklist if the user wants to keep ManyChat connected for a while, and pause an automation only after the user said OK for exactly that one.

## 7. Remove ManyChat in Instagram

Tell the user exactly what to tap, in their language:

- English: Instagram app, Settings, **App and website permissions**, **Apps and websites**, ManyChat, **Remove**.
- German: Instagram App, Einstellungen, **Berechtigungen für Apps und Websites**, **Apps und Websites**, ManyChat, **Entfernen**.

Add: "Your automations and contacts stay in ManyChat. If you ever want to go back, connect Instagram in ManyChat again and everything runs as before."

Wait until the user says it is done.

## 8. Finish

Tell the user: "Step 6 of 6: I am switching on the follower check and the buttons."

1. `finish_migration` without confirmation and show in two lines what changes.
2. After the user's OK: `finish_migration` with `confirm_manychat_disconnected: true`.
3. Catch the gap: run the `gap_fill` calls from the `go_live` result (`run_automation_on_existing_comments` with `since_minutes: 30` and `dry_run: true`). If someone would get a DM, show who and send only after OK with `dry_run: false`.
4. Load the DM history: `backfill_conversations`. It only reads and sends nothing. Check `status` for `backfill`. Meta only returns the last 20 messages per conversation.

If `thread_owner_blocked` or "not the thread owner" shows up in `activity` afterwards: some app still owns that conversation. If all conversations fail, ManyChat is still connected: ask the user to check the Instagram path from step 7 again and remove ManyChat there if it shows up. Never suggest disabling or removing the Instagram account inside ManyChat: that is not needed and can delete the data there. If only one conversation fails, an older app owns just that one, see [troubleshooting.md](troubleshooting.md).

## 9. Wrap up

Close with a short summary:

- N automations live, M contacts imported, DM history loading.
- Test tip: comment under one reel with a second account that does not follow yet and tap through.
- Cancel the ManyChat subscription after one or two quiet days.
- Offer the command for new automations: `/agentchat:reel`.
- Ask whether you should delete the contact CSV in the downloads.
