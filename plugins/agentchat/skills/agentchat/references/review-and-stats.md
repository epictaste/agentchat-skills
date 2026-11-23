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

## YouTube, TikTok and Facebook numbers

`platform_insights` with `platform` youtube, tiktok or facebook (optional `connection_id`, `video_ids`, `limit`, `days`):

- youtube: views, likes, comments per video. With the analytics permission also watch time, `averageViewPercentage`, shares and subscribers gained.
- tiktok: followers and likes of the account, views, likes, comments and shares per video.
- facebook: page views, engagement and follows over `days`, plus plays, reach and watch time per reel.
- youtube with `retention: true` and exactly one `video_ids` entry: the retention curve (watch ratio per point of the video), shows where viewers drop off.
- `post_stats` with `ids` from create_post: one post on every platform side by side (`summary` views, likes, comments, shares).
- If the answer says a permission is missing, the user reconnects that platform once with `connect_platform`.

## Test several versions, post the best

1. Schedule two or three versions as Instagram trial reels: `schedule_reel` or `create_post` with `instagram.trial` `manual` (the owner shares the winner later in the Instagram app) or `auto` (Instagram shares it with followers if it performs well). Trial reels are shown to non-followers first.
2. After about 24 hours compare them with `post_insights`: views, `reels_skip_rate`, `avg_watch_time_s`, shares and saved matter most.
3. Name the winner with the numbers. With `manual` the owner shares it in the app (the API cannot do that), or post the winner as a regular reel and on the other platforms with `create_post`.

## Contacts

- `list_contacts` filters by `search`, `tag`, `follows`, `has_email`, `clicked`, `automation_id`, `since`, and without_tag (contacts that do not have that tag).
- `get_contact` shows runs and history of one person.
- `update_contact` sets tags (`add_tags`, `remove_tags`), email or a note.

## Activity

`activity` lists the latest events, filter with `kind` (for example `error`, `dm_out`, `comment_in`), `automation_id` or `contact`.

## Export

- `export_data` with `table` (contacts, automations, runs, events, clicks, scheduled_posts, videos) returns the rows as CSV directly, optional `since`.
- Without `table` it lists the REST download URLs. They need the API key as header `Authorization: Bearer <key>`, never in the URL.
- One export per account runs at a time. If a second one is refused (REST answers 429), wait until the first is done and try again.
