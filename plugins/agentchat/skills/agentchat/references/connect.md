# Connect AgentChat

Goal: the AgentChat tools are available in this assistant and `status` shows a connected Instagram account.

## 1. Instagram account

The user needs an Instagram creator or business account.

1. They log in at https://agentchat.georgkinzel.de/start with Google or email and password (or during the connector login below).
2. Then they connect Instagram at https://agentchat.georgkinzel.de/app/connections with "Connect Instagram account". They can connect as many Instagram accounts as they like, and YouTube channels on the same page.

The 7 day trial starts when an Instagram account is connected.

## 2. Way 1: connector with login (recommended)

Connector URL: `https://agentchat.georgkinzel.de/mcp`. No key to copy. One connector per login covers all its Instagram accounts. The assistant opens a login page, the user logs in to AgentChat and clicks Allow.

- Claude.ai or the Claude apps: Settings, Connectors, Add custom connector. Name `AgentChat`, URL as above.
- Claude Code: `claude mcp add --transport http agentchat https://agentchat.georgkinzel.de/mcp`, then `/mcp` and choose AgentChat to log in. If the AgentChat plugin is installed, the connector is already there, only the login is missing. If you just installed the plugin from the command line, the running session does not see it yet: tell the user to type `/reload-plugins`, then `/mcp`, scroll down to the plugin section, choose `plugin:agentchat:AgentChat`, Authenticate and log in to AgentChat. Then they say "done" and you continue.
- ChatGPT: needs developer mode (Settings, Connectors). Add a connector with the URL above and authentication OAuth.
- Codex: `codex mcp add agentchat --url https://agentchat.georgkinzel.de/mcp`, then `codex mcp login agentchat`.

## 3. Way 2: API key

For n8n, Make, scripts, the REST API and MCP clients that can send a header but do not support OAuth.

1. Each Instagram account has its own key. It is shown once at https://agentchat.georgkinzel.de/app/connections right after the account is connected. Lost it? The user generates a new one at https://agentchat.georgkinzel.de/app/settings/assistant, section API key. It is shown only once.
2. Always send it as header `Authorization: Bearer <key>`, never in a URL.
3. MCP: URL `https://agentchat.georgkinzel.de/mcp` plus that header. Claude Code: `claude mcp add --transport http agentchat https://agentchat.georgkinzel.de/mcp --header "Authorization: Bearer <key>"`.
4. REST: base `https://agentchat.georgkinzel.de/api/v1`, reference `https://agentchat.georgkinzel.de/api/v1/openapi.json`.

Never ask the user to paste the key into the chat if a connector login is possible.

## 4. Check

Call `status`. Good signs: `account` shows the username, `accounts` lists every connected Instagram account, `account_status` is `active`, `webhook_subscriptions` lists comments and messages. If webhooks are missing, call `subscribe_webhooks` once. Then continue with the workflow the user wanted.

Several accounts: every tool takes the optional parameter `account` (`@username` or id). Without it the account chosen last is used. If the user has more than one account and does not say which, ask before writing anything.

`status` says no Instagram account is connected: send the user to https://agentchat.georgkinzel.de/app/connections.
