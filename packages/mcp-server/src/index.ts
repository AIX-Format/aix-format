import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import yaml from 'js-yaml';
import { scanAgent } from '../../../core/abom-scanner.js';

const server = new Server(
  {
    name: 'aix-agent-registry',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'discover_agents',
        description: 'Search and discover AI Agents registered in the AIX Format registry',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            kyc_tier: { type: 'string', enum: ['none', 'basic', 'verified'], description: 'Filter by KYC tier' }
          }
        },
      },
      {
        name: 'validate_aix',
        description: 'Validate an AIX Format YAML/JSON agent manifest',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'AIX YAML or JSON content' }
          },
          required: ['content']
        },
      },
      {
        name: 'scan_agent',
        description: 'Get ABOM risk score and compliance report for an AI Agent',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'AIX YAML or JSON content' }
          },
          required: ['content']
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'discover_agents') {
      // Mock discovery for now - in production this calls axiomid.app API
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              { name: 'Research Analyst', did: 'did:axiom:research-1', kyc_tier: 'verified' },
              { name: 'Code Assistant', did: 'did:axiom:coder-7', kyc_tier: 'basic' }
            ], null, 2),
          },
        ],
      };
    }

    if (name === 'validate_aix' || name === 'scan_agent') {
      const content = args?.content as string;
      if (!content) throw new Error('Missing content');

      let agentData;
      try {
        agentData = content.trim().startsWith('{') ? JSON.parse(content) : yaml.load(content);
      } catch (e: any) {
        throw new Error('Invalid format: ' + e.message);
      }

      if (name === 'validate_aix') {
        return {
          content: [{ type: 'text', text: 'Manifest is valid AIX format.' }],
        };
      }

      const report = scanAgent(agentData);
      return {
        content: [{ type: 'text', text: JSON.stringify(report, null, 2) }],
      };
    }

    throw new Error('Tool not found');
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: 'Error: ' + error.message }],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AIX Agent Registry MCP Server running on stdio');
}

runServer().catch(console.error);
