# Troubleshooting

Start with `status`, then `activity` with `kind: "error"`. Explain what you found before changing anything.

| Symptom | Check | Fix |
| --- | --- | --- |
| Tools missing or 401 | Connector connected? | [connect.md](connect.md). Expired login: reconnect the connector. |
| No answer to a comment | `status.webhook_subscriptions`, automation `active`, not a draft, right reel | `subscribe_webhooks`; `go_live` after OK; `test_automation` with the comment text |
| Public reply but no DM with the link | `activity` for the contact | Instagram only allows DMs within 24 hours after the person wrote or tapped a button. |
| `thread_owner_blocked` or "not the thread owner" | `status.migration` | Another app (often ManyChat, sometimes an older Meta app) owns the conversation. Remove it in Instagram (Settings, App and website permissions, Apps and websites) or in Meta Business Suite under conversation routing, then `finish_migration` after OK. If only single threads are blocked while others go through, it does not have to be ManyChat: look for an older Meta app. |
| Runs with `skipped_other_tool` | `get_contact` | The account had already answered that comment without AgentChat. This is the double DM protection, nothing to fix. |
| Link broken | `preview_automation` | `update_automation` with the right `link_url`. |
| `account_status` is `token_invalid` | | The user logs in with Instagram again at https://agentchat.georgkinzel.de/start |
| A tool says AgentChat is paused | `billing_status` | Trial ended or payment failed. The user picks a plan at https://agentchat.georgkinzel.de/app/plan |
| 429 rate limited | | Wait the seconds from `Retry-After`, then retry once. |
| Follower check never passes | `stats` `gated` | After 3 checks the link goes out anyway. Instagram sometimes reports fresh follows late. |

More: https://agentchat.georgkinzel.de/docs#troubleshooting
