# Flows: multi step DMs, button menus, reminders

Goal: instead of one link DM, the follower gets a short conversation. A menu with several paths, more than one reminder, questions before the link, tags on the way.

## When to use a flow

- One link, at most one reminder: no flow. Use `link_url` and, if wanted, `follow_up_text` plus `follow_up_minutes` (see [new-reel.md](new-reel.md)).
- Two or more reminders, a choice between offers, or questions before the link: flow.

A flow only replaces the link DM. Everything before it stays as it is: public reply, `opening_button`, `follow_gate`, `email_gate`. After those, the start step goes out instead of the link DM. With trigger comment and none of these three, the start step is the one private reply.

With a flow set, `link_url`, `link_text`, `link_button`, `extra_links`, `follow_up_text` and `follow_up_minutes` are ignored. There is no flow editor in the dashboard, you build the flow.

## How to set it

Pass `flow` to `create_automation` or `update_automation` (REST the same). Setting it to null removes the flow.

```json
{
  "start": "menu",
  "steps": {
    "menu":     { "text": "Hey {username}! What do you want?",
                  "buttons": [ { "title": "Guide", "goto": "guide", "tags": ["guide"] },
                               { "title": "Coaching", "goto": "coaching", "tags": ["coaching"] } ] },
    "guide":    { "text": "Here's your guide 👇", "buttons": [ { "title": "Open", "url": "https://example.com/guide" } ],
                  "wait": { "after_minutes": 5, "if": "no_click", "goto": "remind" } },
    "remind":   { "text": "Did you check it out? 👀", "buttons": [ { "title": "Open", "url": "https://example.com/guide" } ] },
    "coaching": { "text": "Nice! Apply here 👇", "buttons": [ { "title": "Apply", "url": "https://example.com/apply" } ], "tags": ["coaching_link"] }
  }
}
```

## Rules

- Step ids: lowercase letters, digits and underscore, up to 32 characters. Up to 50 steps. Every step has to be reachable from the start step.
- Step: text is required (up to 640 characters, {username} and {name} work). Up to 3 buttons. Optional tags (the contact gets them when the step goes out). Optional wait (one object).
- Button: title up to 20 characters, unique within its step. Exactly one of goto (a step id, the tap leads there) or url (an https link). Tags only on goto buttons, they are set on the tap.
- Wait: after_minutes from 0 to 1380, if one of no_click (no link click since this step), no_reply (no message and no tap since this step) or always, plus goto. If the condition is not met when the wait is due, nothing more is sent automatically (menu buttons in that step can still be tapped). after_minutes 0 with always sends the next DM right after, handy to merge two paths into one.
- Waits must not form a loop. Buttons may lead back to the menu.
- Email: `"email": { "goto": "thanks", "retry_text": "..." }` lets a step wait for an email reply (see recipe 4). Not together with a wait of 0 minutes and always.
- Once per contact: `"skip_if_tag": "freebie"` on a step means: if the contact already has this tag, the step is not sent and the flow ends (see recipe 5). Not on the start step. `once_per_user` only counts one automation, this one works across all of them.

## The 24 hour window

Instagram only allows messages within 24 hours after the person's last message or last button tap. A link click does not count. A step that is due outside the window is not sent: the run ends as flow_expired, the activity shows flow_step_expired.

For comments this means: a wait in the first step only works if the person taps a button or replies first. So for comments start with a button menu, or set `opening_button`. A tap on a menu button still works later, because the tap opens the window again.

Keep the waits of one path together under about 23 hours, counted from the last tap.

## Recipes

### 1. Link with two reminders

The first button opens the window, then two reminders for people who did not click.

```json
{
  "start": "hello",
  "steps": {
    "hello":   { "text": "Hey {username}! Tap below and I'll send you the guide.",
                 "buttons": [ { "title": "Send it", "goto": "link" } ] },
    "link":    { "text": "Here you go 👇", "buttons": [ { "title": "Open guide", "url": "https://example.com/guide" } ],
                 "wait": { "after_minutes": 60, "if": "no_click", "goto": "remind1" } },
    "remind1": { "text": "Did you get a chance to look at it?", "buttons": [ { "title": "Open guide", "url": "https://example.com/guide" } ],
                 "wait": { "after_minutes": 1200, "if": "no_click", "goto": "remind2" } },
    "remind2": { "text": "Last reminder, the guide is still here for you 🙌", "buttons": [ { "title": "Open guide", "url": "https://example.com/guide" } ] }
  }
}
```

60 plus 1200 minutes stays inside the 24 hours after the tap.

### 2. Menu with three paths and tags

Each button tags the contact, so later you can filter with `list_contacts` by tag (or without_tag for everyone who did not pick it).

```json
{
  "start": "menu",
  "steps": {
    "menu":     { "text": "Hey {username}! What can I send you?",
                  "buttons": [ { "title": "Free guide", "goto": "guide", "tags": ["guide"] },
                               { "title": "Templates", "goto": "templates", "tags": ["templates"] },
                               { "title": "Coaching", "goto": "coaching", "tags": ["coaching"] } ] },
    "guide":    { "text": "Here's the guide 👇",
                  "buttons": [ { "title": "Open", "url": "https://example.com/guide" }, { "title": "Back to menu", "goto": "menu" } ] },
    "templates":{ "text": "Here are the templates 👇",
                  "buttons": [ { "title": "Open", "url": "https://example.com/templates" }, { "title": "Back to menu", "goto": "menu" } ] },
    "coaching": { "text": "Nice! Apply here and I'll get back to you 👇",
                  "buttons": [ { "title": "Apply", "url": "https://example.com/apply" } ], "tags": ["coaching_link"] }
  }
}
```

### 3. Qualify with two questions

Two button questions in a row, the answers end up as tags, the link depends on the second answer.

```json
{
  "start": "q1",
  "steps": {
    "q1":     { "text": "Hey {username}! Quick question first: where are you at?",
                "buttons": [ { "title": "Just starting", "goto": "q2", "tags": ["level_beginner"] },
                             { "title": "Already selling", "goto": "q2", "tags": ["level_advanced"] } ] },
    "q2":     { "text": "Got it. Do you want to do it yourself or with help?",
                "buttons": [ { "title": "On my own", "goto": "diy", "tags": ["wants_diy"] },
                             { "title": "With help", "goto": "call", "tags": ["wants_help"] } ] },
    "diy":    { "text": "Then this guide is for you 👇", "buttons": [ { "title": "Open guide", "url": "https://example.com/guide" } ] },
    "call":   { "text": "Let's talk! Book a free call here 👇", "buttons": [ { "title": "Book call", "url": "https://example.com/call" } ],
                "wait": { "after_minutes": 120, "if": "no_click", "goto": "nudge" } },
    "nudge":  { "text": "Still up for a call? Here's the link again 👇", "buttons": [ { "title": "Book call", "url": "https://example.com/call" } ] }
  }
}
```

### 4. Email right in the DM

People can type their email instead of clicking. The next DM after the step counts as the answer, before any keyword. With an email: stored on the contact, event email_captured, the automation's `webhook_url` gets `email_captured` (same body and signature as with email_gate), then the flow goes on to goto right away. Without an email: retry_text once (default: the automation's `email_retry_text`), the second miss ends the flow. No answer within 72 hours: flow_expired. Taps on goto buttons of the step still work, a link click does not end the wait. A wait on the same step that moves on (always, or no_click without a click) ends the email wait too, so put reminders on an earlier step like in this recipe.

```json
{
  "start": "link",
  "steps": {
    "link":   { "text": "Here's your link 👇", "buttons": [ { "title": "Open", "url": "https://example.com/guide" } ],
                "wait": { "after_minutes": 5, "if": "always", "goto": "offer" } },
    "offer":  { "text": "By the way: want my top 10 tools? Tap below or just type your email here 👇",
                "buttons": [ { "title": "Get it", "url": "https://example.com/start" } ],
                "email": { "goto": "thanks", "retry_text": "Just send me your email address here 🙂" } },
    "thanks": { "text": "Done! Check your inbox and confirm the email 📩" }
  }
}
```

Set `webhook_url` (and `webhook_secret`) on the automation so your newsletter tool gets the address.

### 5. A freebie only once, across all reels

Every reel gets its own link, plus a freebie after it. Set `tags` and `skip_if_tag` with the same tag on the freebie step, in every automation. The first automation sends it and tags the contact. Later ones skip it, the contact only gets the steps before it.

```json
{
  "start": "link",
  "steps": {
    "link":    { "text": "Here's your link 👇", "buttons": [ { "title": "Open", "url": "https://example.com/guide" } ],
                 "wait": { "after_minutes": 5, "if": "always", "goto": "ask" } },
    "ask":     { "text": "Just write me if you have questions 🤝",
                 "wait": { "after_minutes": 0, "if": "always", "goto": "freebie" } },
    "freebie": { "text": "By the way, here are my top 10 tools 👇", "buttons": [ { "title": "Get it", "url": "https://example.com/start" } ],
                 "tags": ["freebie"], "skip_if_tag": "freebie" }
  }
}
```

Adding this to reels that already ran: the people who got the freebie before do not have the tag yet. Tag them first, with `import_contacts` (a list of ig_id and tags, dry_run first) or `update_contact`. A skipped step shows up as flow_step_skipped in the activity.

## Workflow

1. Ask in one message: which paths, which links (never guess a link), how many reminders, which tags, the language.
2. Write short, casual texts without dashes. Button titles up to 20 characters.
3. Create the automation as a draft (`create_automation` with active false) or add the flow to an existing one with `update_automation`.
4. Run `test_automation` with a sample comment and `preview_automation`. Show the user every step as a chat: text, buttons, where each button leads, when each reminder comes.
5. Switch it live only after the user's OK (`update_automation` with active true).
6. Later: `get_automation` shows flow stats per step (sent, clicks) and per button (taps). Steps with email also show emails (captured, retried, given_up). Run states are flow_wait, flow_done and flow_expired. `list_contacts` filters by tag and without_tag, `update_contact` changes tags with `add_tags` and `remove_tags`. A webhook body carries contact.tags.
