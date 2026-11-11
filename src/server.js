#!/usr/bin/env node
/**
 * CCS Verifier MCP Server
 * 
 * Model Context Protocol server for CCS receipt verification.
 * Provides free, unlimited verification as a public good for the CCS ecosystem.
 * 
 * Usage:
 *   npx @correctover/ccs-verifier-mcp
 * 
 * Or in MCP client config:
 *   {
 *     "mcpServers": {
 *       "ccs-verifier": {
 *         "command": "npx",
 *         "args": ["@correctover/ccs-verifier-mcp"]
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CCSVerifier } from './verifier.js';

// Initialize verifier
const verifier = new CCSVerifier();

// Usage tracking (in-memory, for demonstration)
const usageStats = {
  totalVerifications: 0,
  successfulVerifications: 0,
  failedVerifications: 0,
  startTime: Date.now(),
  verificationsByHour: {}
};

function trackUsage(result) {
  usageStats.totalVerifications++;
  if (result.valid) {
    usageStats.successfulVerifications++;
  } else {
    usageStats.failedVerifications++;
  }
  
  const hour = new Date().toISOString().substring(0, 13);
  usageStats.verificationsByHour[hour] = (usageStats.verificationsByHour[hour] || 0) + 1;
}

// Create MCP server
const server = new Server(
  {
    name: 'ccs-verifier',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'verify_receipt',
        description: 'Verify a CCS (Cryptographic Commitment Scheme) receipt. Free and unlimited.',
        inputSchema: {
          type: 'object',
          properties: {
            receipt: {
              type: 'object',
              description: 'CCS receipt to verify',
              properties: {
                receipt_id: { type: 'string' },
                evaluation_id: { type: 'string' },
                timestamp: { type: 'number' },
                model_id: { type: 'string' },
                prompt_hash: { type: 'string' },
                response_hash: { type: 'string' },
                commitments: { type: 'array', items: { type: 'string' } },
                signature: { type: 'string' },
                public_key: { type: 'string' }
              },
              required: ['receipt_id', 'signature', 'public_key']
            }
          },
          required: ['receipt']
        }
      },
      {
        name: 'get_verifier_info',
        description: 'Get information about the CCS verifier (version, spec, usage stats)',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'generate_test_receipt',
        description: 'Generate a test CCS receipt for development/testing (requires private key)',
        inputSchema: {
          type: 'object',
          properties: {
            model_id: {
              type: 'string',
              description: 'Model identifier for test receipt'
            },
            private_key: {
              type: 'string',
              description: 'Ed25519 private key (hex-encoded, 64 chars)'
            }
          },
          required: ['private_key']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'verify_receipt') {
      const receipt = args.receipt;
      const result = verifier.verify(receipt);
      trackUsage(result);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }

    if (name === 'get_verifier_info') {
      const uptime = Date.now() - usageStats.startTime;
      const info = {
        verifier: {
          version: verifier.version,
          spec_version: verifier.specVersion,
          license: 'CC0-1.0 (Public Domain)',
          description: 'Free, unlimited CCS receipt verification'
        },
        usage: {
          total_verifications: usageStats.totalVerifications,
          successful: usageStats.successfulVerifications,
          failed: usageStats.failedVerifications,
          success_rate: usageStats.totalVerifications > 0 
            ? (usageStats.successfulVerifications / usageStats.totalVerifications * 100).toFixed(2) + '%'
            : 'N/A',
          uptime_hours: (uptime / 1000 / 60 / 60).toFixed(2)
        },
        pricing: {
          verification: 'FREE (unlimited)',
          issuance: 'Contact Correctover for licensing',
          source_code: 'CC0-1.0 (self-hostable)'
        }
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(info, null, 2)
          }
        ]
      };
    }

    if (name === 'generate_test_receipt') {
      const { model_id, private_key } = args;
      
      if (!private_key || private_key.length !== 64) {
        throw new Error('Invalid private key: must be 64 hex characters (32 bytes)');
      }
      
      const receipt = CCSVerifier.generateTestReceipt(
        { model_id: model_id || 'test-model' },
        private_key
      );
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              receipt,
              warning: 'This is a TEST receipt for development only. Do not use in production.',
              note: 'In production, receipts are issued by authorized CCS issuers.'
            }, null, 2)
          }
        ]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            tool: name
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CCS Verifier MCP Server running on stdio');
  console.error('License: CC0-1.0 (Public Domain)');
  console.error('Verification: FREE and UNLIMITED');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
