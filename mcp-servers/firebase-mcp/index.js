import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import admin from "firebase-admin";

// Initialize Firebase Admin (requires GOOGLE_APPLICATION_CREDENTIALS)
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} else {
  console.error("GOOGLE_APPLICATION_CREDENTIALS is not set. Firebase Admin running in mock mode.");
}

const server = new Server(
  {
    name: "firebase-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "verify_otp",
        description: "Verifies an OTP code for a user.",
        inputSchema: {
          type: "object",
          properties: {
            phoneNumber: { type: "string" },
            code: { type: "string" },
          },
          required: ["phoneNumber", "code"],
        },
      },
      {
        name: "send_push_notification",
        description: "Sends a push notification via FCM.",
        inputSchema: {
          type: "object",
          properties: {
            token: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
            data: { type: "object", additionalProperties: true },
          },
          required: ["token", "title", "body"],
        },
      },
      {
        name: "manage_fcm_token",
        description: "Associates an FCM token with a user ID.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string" },
            token: { type: "string" },
          },
          required: ["userId", "token"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "verify_otp") {
      const { phoneNumber, code } = args;
      return {
        content: [{ type: "text", text: `Mock verifying OTP ${code} for ${phoneNumber}. Success.` }],
      };
    }

    if (name === "send_push_notification") {
      const { token, title, body, data } = args;
      if (admin.apps.length > 0) {
        const response = await admin.messaging().send({
          token,
          notification: { title, body },
          data: data || {},
        });
        return { content: [{ type: "text", text: `Push sent successfully: ${response}` }] };
      }
      return { content: [{ type: "text", text: `Mock push sent to ${token}: ${title} - ${body}` }] };
    }

    if (name === "manage_fcm_token") {
      const { userId, token } = args;
      if (admin.apps.length > 0) {
        await admin.firestore().collection('users').doc(userId).set({ fcmToken: token }, { merge: true });
        return { content: [{ type: "text", text: `Token for user ${userId} saved to Firestore.` }] };
      }
      return { content: [{ type: "text", text: `Mock saving token for user ${userId}.` }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Firebase MCP server running on stdio");
}

main().catch(console.error);
