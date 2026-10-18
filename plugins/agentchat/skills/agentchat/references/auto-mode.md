# Auto mode and keyword links

Goal: every new reel whose caption asks for a comment keyword gets its automation without the user asking.

## How it works

When a new post goes live, AgentChat looks for calls like "Comment GUIDE", "Kommentier KI", "type AI" or "DM me AUDIT" in the caption and creates an automation with the account defaults. Only posts published after auto mode was switched on count. A post that already has an automation never gets a second one.

The link comes from, in this order:

1. The keyword link library (`set_keyword_link`, `list_keyword_links`).
2. A URL in the caption.
3. `default_link` from `set_auto_mode`.

Without a link the automation is created paused and `status` warns.

## Set up

1. `set_auto_mode` without arguments shows the current settings.
2. Ask for the links of the keywords the user uses often and save each with `set_keyword_link`.
3. Ask for defaults: follower check, email question, public reply variants. Pass them as `defaults`.
4. Decide with the user: drafts (default, the user checks each one and you call `go_live` after a yes) or live right away (`go_live: true`). Live right away means real DMs without a check, so ask explicitly before setting it.
5. `set_auto_mode` with `enabled: true` and the agreed values.

## Daily use

- New drafts show up in `list_automations` with status draft. Show `preview_automation`, then `go_live` after the user's OK.
- Change a link: `set_keyword_link` again. Remove: `url: null`.
- Switch off: `set_auto_mode` with `enabled: false`.
