# Connect AgentChat

Goal: the AgentChat tools are available in this assistant and `status` shows a connected Instagram account.

## 1. Instagram account

The user needs an Instagram creator or business account. They log in once at https://agentchat.georgkinzel.de/start (or during the connector login below). The 7 day trial starts with the first login.

## 2. Way 1: connector with login (recommended)

Connector URL: `https://agentchat.georgkinzel.de/mcp`. No key to copy. The assistant opens a login page, the user logs in with Instagram and clicks Allow.

- Claude.ai or the Claude apps: Settings, Connectors, Add custom connector. Name `AgentChat`, URL as above.
- Claude Code: `claude mcp add --transport http agentchat https://agentchat.georgkinzel.de/mcp`, then `/mcp` and choose AgentChat to log in. If the AgentChat plugin is installed, the connector is already there, only the login is missing.
- ChatGPT: needs developer mode (Settings, Connectors). Add a connector with the URL above and authentication OAuth.
- Codex: `codex mcp add agentchat --url https://agentchat.georgkinzel.de/mcp`, then `codex mcp login agentchat`.

## 3. Way 2: API key

For n8n, Make, scripts, the REST API and MCP clients that can send a header but do not support OAuth.

1. The user opens https://agentchat.georgkinzel.de/app, section API key, and generates a key. It is shown only once.
2. Always send it as header `Authorization: Bearer <key>`, never in a URL.
3. MCP: URL `https://agentchat.georgkinzel.de/mcp` plus that header. Claude Code: `claude mcp add --transport http agentchat https://agentchat.georgkinzel.de/mcp --header "Authorization: Bearer <key>"`.
4. REST: base `https://agentchat.georgkinzel.de/api/v1`, reference `https://agentchat.georgkinzel.de/api/v1/openapi.json`.

Never ask the user to paste the key into the chat if a connector login is possible.

## 4. Check

Call `status`. Good signs: `account` shows the username, `account_status` is `active`, `webhook_subscriptions` lists comments and messages. If webhooks are missing, call `subscribe_webhooks` once. Then continue with the workflow the user wanted.
