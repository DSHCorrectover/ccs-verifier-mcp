# CCS Verifier MCP Server

**Free, unlimited CCS receipt verification as a Model Context Protocol server.**

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0--1.0-blue.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)
[![npm version](https://badge.fury.io/js/@correctover%2Fccs-verifier-mcp.svg)](https://badge.fury.io/js/@correctover%2Fccs-verifier-mcp)

## What is this?

This is the **Public Verifier** for the CCS (Cryptographic Commitment Scheme) standard. It verifies CCS receipts using Ed25519 signatures, providing cryptographic proof that an AI evaluation occurred as claimed.

**Key properties:**
- ✅ **Free forever** - verification is a public good
- ✅ **Unlimited** - no rate limits, no API keys
- ✅ **Open source** - CC0 1.0 (public domain), self-hostable
- ✅ **Model-agnostic** - works with any MCP-compatible client
- ✅ **Zero dependencies** on LLM inference - pure cryptographic verification

## Quick Start

### 1. Install MCP Client

This server works with any MCP-compatible client:
- [Claude Desktop](https://claude.ai/download)
- [Cursor](https://cursor.sh)
- [Continue](https://continue.dev)
- Any MCP SDK implementation

### 2. Add to MCP Config

```json
{
  "mcpServers": {
    "ccs-verifier": {
      "command": "npx",
      "args": ["-y", "ccs-verifier-mcp"]
    }
  }
}
```

### 3. Verify a Receipt

Ask your AI assistant:
> "Verify this CCS receipt: {receipt_json}"

Or use the tool directly:
```javascript
// Via MCP client
const result = await mcp.callTool('verify_receipt', {
  receipt: {
    receipt_id: "abc-123",
    evaluation_id: "eval-456",
    timestamp: 1699900000000,
    model_id: "gpt-4",
    prompt_hash: "sha256:...",
    response_hash: "sha256:...",
    commitments: ["commitment-1"],
    signature: "ed25519_signature_hex",
    public_key: "ed25519_public_key_hex"
  }
});
```

## Available Tools

### `verify_receipt`

Verify a CCS receipt's cryptographic integrity.

**Input:**
```json
{
  "receipt": {
    "receipt_id": "string (required)",
    "evaluation_id": "string",
    "timestamp": "number (unix ms)",
    "model_id": "string",
    "prompt_hash": "string (sha256:hex)",
    "response_hash": "string (sha256:hex)",
    "commitments": "string[]",
    "signature": "string (hex, required)",
    "public_key": "string (hex, required)"
  }
}
```

**Output:**
```json
{
  "valid": true,
  "confidence": 1.0,
  "receipt_id": "abc-123",
  "verification_id": "uuid",
  "verified_at": 1699900000000,
  "checks": [
    "structure_validation",
    "signature_verification",
    "timestamp_validation",
    "hash_integrity",
    "commitments_validation"
  ],
  "details": {
    "signature": {
      "valid": true,
      "algorithm": "Ed25519",
      "public_key": "abc123..."
    }
  }
}
```

### `get_verifier_info`

Get information about the verifier (version, usage stats, pricing).

**Output:**
```json
{
  "verifier": {
    "version": "1.0.0",
    "spec_version": "draft-correctover-ccs-11",
    "license": "CC0-1.0 (Public Domain)"
  },
  "usage": {
    "total_verifications": 12345,
    "successful": 12300,
    "failed": 45,
    "success_rate": "99.64%"
  },
  "pricing": {
    "verification": "FREE (unlimited)",
    "issuance": "Contact Correctover for licensing",
    "source_code": "CC0-1.0 (self-hostable)"
  }
}
```

### `generate_test_receipt`

Generate a test receipt for development (requires Ed25519 private key).

**⚠️ WARNING:** Test receipts are for development only. Production receipts must be issued by authorized CCS issuers.

## Pricing Model

This server implements the CCS ecosystem pricing:

| Action | Cost | Limit |
|--------|------|-------|
| **Verify receipt** | FREE | Unlimited |
| **Issue receipt** | Contact Correctover | Licensed |
| **Self-host verifier** | FREE | CC0-1.0 |

**Why is verification free?**

Verification must be free and unlimited for the CCS ecosystem to work:
1. **Third-party verification builds trust** - anyone can verify, not just the issuer
2. **Network effects** - more verifiers → more trust → more issuers → more receipts
3. **Public good** - verification is infrastructure, not a product

**How do we make money?**

We charge for **issuance** (creating receipts), not verification. This aligns incentives:
- Issuers pay for the privilege of creating trusted receipts
- Verifiers (you) get free, unlimited verification
- The ecosystem grows because verification is frictionless

## CCS Standard

This server implements [draft-correctover-ccs-11](https://datatracker.ietf.org/doc/draft-correctover-ccs/), the CCS specification.

**CCS provides:**
- Cryptographic proof of AI evaluation
- Tamper-evident receipts
- Model-agnostic verification
- Deterministic, reproducible results

## Self-Hosting

The verifier is CC0-1.0 (public domain). You can self-host it:

```bash
# Clone
git clone https://github.com/DSHCorrectover/ccs-verifier-mcp.git
cd ccs-verifier-mcp

# Install
npm install

# Run
npm start
```

Or use Docker:
```bash
docker run -i --rm correctover/ccs-verifier-mcp:latest
```

## Development

```bash
# Install dependencies
npm install

# Run in dev mode (with watch)
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Integration Examples

### LangChain

```python
from langchain.tools import MCPTool

ccs_verifier = MCPTool.from_server(
    server_url="npx://ccs-verifier-mcp",
    tool_name="verify_receipt"
)

# Use in your chain
result = ccs_verifier.invoke({"receipt": receipt_data})
```

### LlamaIndex

```python
from llama_index.tools.mcp import MCPTool

ccs_verifier = MCPTool(
    command="npx",
    args=["-y", "ccs-verifier-mcp"],
    tool_name="verify_receipt"
)
```

### Direct MCP SDK

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'ccs-verifier-mcp']
});

const client = new Client({ name: 'my-app', version: '1.0.0' });
await client.connect(transport);

const result = await client.callTool('verify_receipt', { receipt });
```

## Security

This server performs **cryptographic verification only**. It does not:
- Store receipts
- Transmit data to external services
- Require authentication
- Have side effects

**Security properties:**
- ✅ Ed25519 signature verification (128-bit security)
- ✅ SHA-256 hash validation
- ✅ Timestamp validation (24-hour window)
- ✅ Structure validation (prevents malformed input)
- ✅ No external dependencies beyond MCP SDK

**Report security issues:** See [SECURITY.md](SECURITY.md)

## License

**CC0 1.0 Universal (Public Domain)**

You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

## Links

- **CCS Standard**: [draft-correctover-ccs-11](https://datatracker.ietf.org/doc/draft-correctover-ccs/)
- **GitHub**: https://github.com/DSHCorrectover/ccs-verifier-mcp
- **npm**: https://www.npmjs.com/package/ccs-verifier-mcp
- **MCP Protocol**: https://modelcontextprotocol.io
- **Issues**: https://github.com/DSHCorrectover/ccs-verifier-mcp/issues

---

**Built by [Correctover](https://correctover.com)** - Cryptographic evidence infrastructure for AI evaluation.
