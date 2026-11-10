# Troubleshooting

Start with `status`, then `activity` with `kind: "error"`. Explain what you found before changing anything.

| Symptom | Check | Fix |
| --- | --- | --- |
| Tools missing or 401 | Connector connected? | [connect.md](connect.md). Expired login: reconnect the connector. |
| No answer to a comment | `status.webhook_subscriptions`, automation `active`, not a draft, right reel | `subscribe_webhooks`; `go_live` after OK; `test_automation` with the comment text |
| Public reply but no DM with the link | `activity` for the contact | Instagram only allows DMs within 24 hours after the person wrote or tapped a button. |
| `thread_owner_blocked` or "not the thread owner" | `status.migration` | Another app (often ManyChat, sometimes an older Meta app) owns the conversation. Remove it in Instagram (Settings, App and website permissions, Apps and websites) or in Meta Business Suite under conversation routing, then `finish_migration` after OK. If only single threads are blocked while others go through, it does not have to be ManyChat: look for an older Meta app. |
| Old ManyChat buttons, `unhandled_button` or `unhandled_dm` in `activity` | `activity` for the contact | AgentChat matches old ManyChat taps to the automation of the person's last comment (7 days) and logs `legacy_tap_resolved`. Replies under a comment and comments with an `exclude_keywords` word do not count. If nothing matches, answer by hand; the operator was notified. |
| `Send limit for this contact reached` in `activity` | `activity` for the contact | AgentChat sends one contact at most 20 messages per hour (DMs and private replies), so one person tapping buttons cannot use up the account's limit. Nothing to fix, it frees up within the hour. |
| A tool says `media_id` or `comment_id` "is not a valid ID" | | Pass the ID exactly as `list_posts` or `list_comments` return it (letters, digits, `_` and `-` only), never a URL or path. |
| Comments from an outage | `activity` with `recovery_done` | After the account is reconnected AgentChat catches up by itself (comments up to 7 days, DMs up to 23 hours). Nothing to do; `recovery_not_possible` lists what was too old. |
| Runs with `skipped_other_tool` | `get_contact` | The account had already answered that comment without AgentChat. This is the double DM protection, nothing to fix. |
| Link broken | `preview_automation` | `update_automation` with the right `link_url`. |
| `account_status` is `token_invalid` | | The user reconnects the Instagram account at https://agentchat.georgkinzel.de/app/connections (Reconnect). |
| A tool says AgentChat is paused | `billing_status` | Trial ended or payment failed. The user picks a plan at https://agentchat.georgkinzel.de/app/plan |
| 429 rate limited | | Wait the seconds from `Retry-After`, then retry once. |
| A JSON-RPC batch is refused, or single calls in it come back rate limited | | A batch holds at most 20 calls. Every tool call in it counts toward the rate limit, writing tools also toward the write limit. Wait the seconds from retry_after, then repeat only the refused calls. |
| Follower check never passes | `stats` `gated` | After 3 checks the link goes out anyway. Instagram sometimes reports fresh follows late. |

More: https://agentchat.georgkinzel.de/docs#troubleshooting
