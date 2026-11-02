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

## Instagram insights

- `post_insights` (optional `media_id`, otherwise the latest `limit` posts) returns views, reach, likes, comments, shares, saved, reposts and total_interactions. Reels also get `avg_watch_time_s`, `total_watch_time_s` and `reels_skip_rate` (percent of views skipped in the first 3 seconds); crossposted reels get `facebook_views`.
- `account_insights` (`days` 1 to 30, optional `demographics`) returns account totals, reach per day and, if asked, the audience by age, gender, country and city.
- Instagram has no retention curve in its API. Numbers can be up to 48 hours late. If the tool says insights are not allowed, the user reconnects the Instagram account once at https://agentchat.georgkinzel.de/app/connections and allows insights.

## Contacts

- `list_contacts` filters by `search`, `tag`, `follows`, `has_email`, `clicked`, `automation_id`, `since`, and without_tag (contacts that do not have that tag).
- `get_contact` shows runs and history of one person.
- `update_contact` sets tags (`add_tags`, `remove_tags`), email or a note.

## Activity

`activity` lists the latest events, filter with `kind` (for example `error`, `dm_out`, `comment_in`), `automation_id` or `contact`.

## Export

- `export_data` with `table` (contacts, automations, runs, events, clicks, scheduled_posts, videos) returns the rows as CSV directly, optional `since`.
- Without `table` it lists the REST download URLs. They need the API key as header `Authorization: Bearer <key>`, never in the URL.
