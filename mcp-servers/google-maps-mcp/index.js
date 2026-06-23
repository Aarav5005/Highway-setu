import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error("GOOGLE_MAPS_API_KEY is not set. Google Maps running in mock mode.");
}

const server = new Server(
  {
    name: "google-maps-mcp",
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
        name: "generate_route",
        description: "Generates a route between an origin and destination.",
        inputSchema: {
          type: "object",
          properties: {
            origin: { type: "string" },
            destination: { type: "string" },
          },
          required: ["origin", "destination"],
        },
      },
      {
        name: "search_nearby_dhaba",
        description: "Searches for nearby dhabas (restaurants) based on latitude and longitude.",
        inputSchema: {
          type: "object",
          properties: {
            lat: { type: "number" },
            lng: { type: "number" },
            radius: { type: "number", description: "Radius in meters" },
          },
          required: ["lat", "lng"],
        },
      },
      {
        name: "search_nearby_mechanic",
        description: "Searches for nearby mechanics based on latitude and longitude.",
        inputSchema: {
          type: "object",
          properties: {
            lat: { type: "number" },
            lng: { type: "number" },
            radius: { type: "number", description: "Radius in meters" },
          },
          required: ["lat", "lng"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "generate_route") {
      const { origin, destination } = args;
      if (GOOGLE_MAPS_API_KEY) {
        const response = await client.directions({
          params: {
            origin,
            destination,
            key: GOOGLE_MAPS_API_KEY,
          },
        });
        return { content: [{ type: "text", text: JSON.stringify(response.data.routes) }] };
      }
      return { content: [{ type: "text", text: `Mock route from ${origin} to ${destination}` }] };
    }

    if (name === "search_nearby_dhaba") {
      const { lat, lng, radius = 5000 } = args;
      if (GOOGLE_MAPS_API_KEY) {
        const response = await client.placesNearby({
          params: {
            location: { lat, lng },
            radius,
            keyword: "dhaba restaurant",
            key: GOOGLE_MAPS_API_KEY,
          },
        });
        return { content: [{ type: "text", text: JSON.stringify(response.data.results) }] };
      }
      return { content: [{ type: "text", text: `Mock dhaba search near ${lat}, ${lng} within ${radius}m` }] };
    }

    if (name === "search_nearby_mechanic") {
      const { lat, lng, radius = 5000 } = args;
      if (GOOGLE_MAPS_API_KEY) {
        const response = await client.placesNearby({
          params: {
            location: { lat, lng },
            radius,
            keyword: "mechanic auto repair",
            key: GOOGLE_MAPS_API_KEY,
          },
        });
        return { content: [{ type: "text", text: JSON.stringify(response.data.results) }] };
      }
      return { content: [{ type: "text", text: `Mock mechanic search near ${lat}, ${lng} within ${radius}m` }] };
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
  console.error("Google Maps MCP server running on stdio");
}

main().catch(console.error);
