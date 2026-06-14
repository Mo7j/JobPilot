# JobPilot MCP server

A tiny [Model Context Protocol](https://modelcontextprotocol.io) server that
gives **your** Claude direct read/write access to **your** JobPilot Firestore.
Every agent run flows through these tools.

## Tools

| Tool | What it does |
|---|---|
| `list_collection` | Read every doc in a collection |
| `get_document` | Read one doc by ID |
| `add_document` | Create a doc with an auto ID (jobCases, notifications, …) |
| `set_document` | Create-or-merge a doc with a specific ID (agents/{slug}, meta/…) |
| `update_document` | Patch fields on an existing doc |
| `delete_document` | Delete one doc |
| `send_push` | Push notification to your phone via FCM (optional) |
| `clear_collection` | ⚠ Delete ALL docs in a collection, explicit confirmation only |

## Setup

1. **Install dependencies** (from the repo root, `npm install` covers this workspace too).

2. **Service-account key**, Firebase console → Project settings →
   *Service accounts* → **Generate new private key**. Save the JSON as
   `mcp-server/service-account.json` (gitignored), or anywhere else and point
   `SERVICE_ACCOUNT_PATH` at it in `mcp-server/.env`.

   > ⚠ This key is the master key to your Firebase project. Never commit it,
   > never share it. If it leaks: Google Cloud console → IAM → Service accounts
   > → delete the key and generate a new one.

3. **Register the server with Claude.**

   **Claude Desktop**, add to `claude_desktop_config.json`
   (Settings → Developer → Edit Config), then restart Claude Desktop:

   ```json
   {
     "mcpServers": {
       "jobpilot": {
         "command": "node",
         "args": ["C:/path/to/JobPilot/mcp-server/server.js"]
       }
     }
   }
   ```

   **Claude Code**, from the repo root:

   ```bash
   claude mcp add jobpilot -- node ./mcp-server/server.js
   ```

   …or drop the same JSON shape into `.mcp.json` at the repo root.

4. **Verify**, ask Claude: *"Use the jobpilot MCP to list the agents collection."*
   An empty list is fine; an auth error means the key or project is wrong.

## Seeding agents manually

The setup agent normally seeds `agents`, `agentInstructions`, and
`agentMemory` for you. To do it by hand:

```bash
cd mcp-server
npm run seed
```

Idempotent, never resets live counters or your custom instructions.
