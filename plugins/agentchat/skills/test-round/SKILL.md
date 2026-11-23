---
name: test-round
description: "Test two or three versions of a reel as Instagram trial reels, compare the numbers after 24 hours and post the winner, guided step by step. Use when the user runs /agentchat:test-round or wants to A/B test hooks, captions, covers or lengths, or asks which version of a reel is better."
---

# Test versions, post the winner

The hard rules of the [AgentChat skill](../agentchat/SKILL.md) apply: nothing goes live without an explicit OK, name the account on every call. Background on trial reels and numbers: [review-and-stats.md](../agentchat/references/review-and-stats.md), publishing fields: [scheduling.md](../agentchat/references/scheduling.md).

If the AgentChat tools are missing, follow [connect.md](../agentchat/references/connect.md) first. Call `status`, check `publishing`, and settle the account if there are several.

## 1. Ask (one block)

- How many versions: 2 or 3.
- What differs: hook, caption, cover or length. Only one thing per test, otherwise the result says nothing.
- Which platforms, and the video source for each version (file or public URL).
- When the versions go out.

## 2. Instagram trial reels

Plan each version as a trial reel with `schedule_reel`, or with `create_post` when other platforms are involved (then use `instagram.trial`). Trial reels are shown to non-followers first. Explain the two modes:

- `manual`: the versions stay trials. After the test the owner shares the winner with followers in the Instagram app. The API cannot do that.
- `auto`: Instagram shares a version with followers by itself if it performs well. Simple, but the user gives up the choice.

Post the versions at the same time of day, ideally close together, so the comparison is fair. `get_publishing_limit` shows how many posts Instagram still allows.

YouTube, TikTok and Facebook have no trial function. Post variants there only if the user wants to. Say clearly that an unlisted YouTube video is not a fair test: it gets no recommendation traffic. A regular post of each version on those platforms splits the audience and cannot be undone.

Before every `schedule_reel` or `create_post` show a summary (account, versions, what differs, time, mode) and wait for a clear OK.

## 3. Come back after 24 hours

Numbers can be up to 48 hours late. Suggest a reminder or a new session in about 24 hours. If the numbers still look empty, wait and check again.

Then read the versions with `post_insights` (Instagram) or `post_stats` with the post ids (per platform: summary with views, likes, comments, shares). Show a table: version, views, `reels_skip_rate`, `avg_watch_time_s`, shares, saved, shares plus saved per view.

## 4. Name the winner

State the rule before the result and apply it in this order:

1. Lowest `reels_skip_rate`, together with the highest `avg_watch_time_s`.
2. If that is close or mixed: highest shares plus saved per view.
3. If still close: most views.

Use only numbers from the tools. If versions are too close or views too low (a few hundred or less), say it is a tie and do not pretend a result.

## 5. Post the winner

Offer the options, then act only after the OK:

- `manual` trials: the user shares the winner with followers in the Instagram app.
- Or post the winner as a regular reel, and distribute it to the other platforms with `create_post`. Show the summary first.
- Optional: a keyword automation on the winner, see [the reel skill](../reel/SKILL.md).
