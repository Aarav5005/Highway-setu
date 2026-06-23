# Highway Setu MCP Servers

This directory contains the custom Model Context Protocol (MCP) servers used by the project's AI agents.

## 1. Filesystem MCP

We use the official Filesystem MCP server provided by the MCP team. You do not need any custom code for this.

**Command to run:**
```bash
npx -y @modelcontextprotocol/server-filesystem "c:\aarav\Highway Setu"
```

## 2. Firebase MCP

Provides tools for the agents to verify OTPs, manage FCM tokens, and send push notifications.

**Location**: `firebase-mcp/`

**Prerequisites**:
1. You must have a Firebase project set up.
2. Download your Firebase Admin SDK service account key.
3. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to that JSON file.

**Command to run:**
```bash
cd mcp-servers/firebase-mcp
node index.js
```

## 3. Google Maps MCP

Provides tools for the agents to generate routes, and search for nearby dhabas and mechanics.

**Location**: `google-maps-mcp/`

**Prerequisites**:
1. You must have a Google Cloud project with the Places API and Directions API enabled.
2. Set the `GOOGLE_MAPS_API_KEY` environment variable.

**Command to run:**
```bash
cd mcp-servers/google-maps-mcp
node index.js
```

## Configuring Your Agent Orchestrator

If you are using a standard `mcp_config.json` for a desktop client (like Claude Desktop) or an agent framework, here is what your configuration should look like:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "c:\\aarav\\Highway Setu"]
    },
    "firebase": {
      "command": "node",
      "args": ["c:\\aarav\\Highway Setu\\mcp-servers\\firebase-mcp\\index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "C:\\path\\to\\your\\serviceAccountKey.json"
      }
    },
    "google-maps": {
      "command": "node",
      "args": ["c:\\aarav\\Highway Setu\\mcp-servers\\google-maps-mcp\\index.js"],
      "env": {
        "GOOGLE_MAPS_API_KEY": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```
