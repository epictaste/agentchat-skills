# Numbers, contacts and export

Goal: answer "how is it going" with real numbers from the tools, never estimated ones.

## Funnel

`stats` (optional `days`, default 30) returns per automation:

- `triggered`: comments or messages that matched.
- `dm_sent`, `button_tapped`.
- `gated`, `gate_passed`: at the follower check, and passed it.
- `email_asked`, `email_captured`, `email_expired`.
- `link_sent`, `clicked`, `followed_up`.
- `errors`, `skipped`, `skipped_other_tool` (already answered by another tool).

Report a few useful ratios, for example clicked of link_sent, or how many stopped at the follower check. `get_automation` shows one automation in full with its funnel.

## Contacts

- `list_contacts` filters by `search`, `tag`, `follows`, `has_email`, `clicked`, `automation_id`, `since`.
- `get_contact` shows runs and history of one person.
- `update_contact` sets tags, email or a note.

## Activity

`activity` lists the latest events, filter with `kind` (for example `error`, `dm_out`, `comment_in`), `automation_id` or `contact`.

## Export

- `export_data` with `table` (contacts, automations, runs, events, clicks, scheduled_posts, videos) returns the rows as CSV directly, optional `since`.
- Without `table` it lists the REST download URLs. They need the API key as header `Authorization: Bearer <key>`, never in the URL.
