---
name: channel-report
description: "Weekly or monthly report across all connected channels (Instagram, YouTube, TikTok, Facebook) with a table per channel, top and flop posts with reasons, DM funnel numbers and three next steps. Use when the user runs /agentchat:channel-report or asks how the channels did this week or month."
---

# Channel report

The hard rules of the [AgentChat skill](../agentchat/SKILL.md) apply. Numbers and their meaning: [review-and-stats.md](../agentchat/references/review-and-stats.md). Only values returned by the tools go into the report, never estimates. If a value is missing, write "not available".

If the AgentChat tools are missing, follow [connect.md](../agentchat/references/connect.md) first. Call `status`, settle the account if there are several, and pass `account` on every call.

## 1. Period and channels

Ask for the period (week = 7 days, month = 30 days; the default is the week) unless the request says it. Call `list_connections` and report only on connected channels. Note that Instagram numbers can be up to 48 hours late.

## 2. Collect

- Instagram: `account_insights` with `days` set to the period, `post_insights` for the latest posts (`limit` about 20, then keep those inside the period).
- YouTube, TikTok, Facebook: `platform_insights` per connected platform with `days`. Per-post values from `post_stats` where it covers the post.
- DM funnel: `stats` with `days`. Name triggered, dm_sent, link_sent and clicked per automation, and one or two ratios (clicked of link_sent, stopped at the follower check).

## 3. Missing permissions

If a tool says a permission is missing or insights are not allowed, tell the user which channel is affected and let them reconnect it with `connect_platform` (they open the link in the browser where they are logged in to AgentChat). Then call the tool again. Leave the channel out of the report until it works, and say so.

## 4. Report

1. A short table per channel: reach or views, likes, comments, shares, followers change if the tool returns it.
2. Top 3 and flop 3 posts over all channels, ranked by views, each with the reason in numbers (for example `reels_skip_rate`, `avg_watch_time_s`, shares plus saved per view, or a low view count).
3. The DM funnel in two or three lines.
4. Three concrete next steps that follow from the numbers (for example repeat the hook of the top post, test a new cover with [test-round](../test-round/SKILL.md), add a keyword automation to a strong reel without one).

Keep it short. Do not publish or change anything as part of the report. If a next step needs a live action, ask first.
