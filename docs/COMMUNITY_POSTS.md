# Reddit Post: r/LocalLLaMA

## Title
[Tool] ccs-verifier-mcp — Free, unlimited Ed25519 receipt verification for AI evaluation (CC0-1.0, stdio MCP server)

## Body

Hey r/LocalLLaMA,

I built a lightweight MCP server for verifying CCS (Cryptographic Commitment Scheme) receipts. It provides **free, unlimited** Ed25519 signature verification for AI evaluation receipts — no API keys, no rate limits, no cloud dependency.

### What it does

CCS is a standard for cryptographically proving that an AI evaluation occurred as claimed. This server lets any MCP-compatible client (Claude Desktop, Cursor, Continue, etc.) verify those receipts locally.

**Verification checks:**
- Structure validation (required fields, types)
- Ed25519 signature verification (128-bit security)
- Timestamp validation (24-hour window)
- Hash integrity (SHA-256 prompt/response hashes)
- Commitments validation

### Why it's free

The CCS ecosystem charges for **issuing** receipts (creating them), but verification is a public good. Anyone should be able to verify, unlimited, with no friction. This builds trust through third-party verification — you don't have to trust the issuer if you can verify the receipt yourself.

### Install

```bash
npx ccs-verifier-mcp
```

Or in your MCP client config:

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

### Links

- **npm**: https://www.npmjs.com/package/ccs-verifier-mcp
- **GitHub**: https://github.com/DSHCorrectover/ccs-verifier-mcp
- **License**: CC0-1.0 (public domain) — self-host, modify, redistribute, no restrictions

### Technical details

- Pure JavaScript, no native dependencies
- Uses tweetnacl for Ed25519 (128-bit security, constant-time)
- Stdio transport (works with any MCP client)
- 13/13 test cases passing
- Implements draft-correctover-ccs-11

Happy to answer questions or take feedback!

---

# Reddit Post: r/mcp

## Title
ccs-verifier-mcp — Free CCS receipt verification MCP server (Ed25519, CC0-1.0)

## Body

Built a simple MCP server for verifying CCS (Cryptographic Commitment Scheme) receipts. It's free, unlimited, and CC0-1.0 licensed (public domain).

**What it verifies:**
- Ed25519 signatures (128-bit security)
- Receipt structure and required fields
- Timestamps (24-hour validity window)
- SHA-256 hash integrity
- Commitment validation

**Install:**
```bash
npx ccs-verifier-mcp
```

**Tools exposed:**
- `verify_receipt` — verify a CCS receipt
- `get_verifier_info` — version, spec, usage stats, pricing
- `generate_test_receipt` — create test receipts for development

**Why free?** CCS charges for issuance (creating receipts), not verification. Verification is infrastructure — it needs to be frictionless for the ecosystem to work.

**Links:**
- npm: https://www.npmjs.com/package/ccs-verifier-mcp
- GitHub: https://github.com/DSHCorrectover/ccs-verifier-mcp

Feedback welcome!

---

# Hacker News: Show HN

## Title
Show HN: ccs-verifier-mcp – Free, unlimited Ed25519 receipt verification for AI evaluation (CC0-1.0)

## Body

I built an MCP server that provides free, unlimited verification for CCS (Cryptographic Commitment Scheme) receipts.

CCS is a standard for cryptographically proving AI evaluations occurred as claimed. The receipts use Ed25519 signatures (128-bit security) and include SHA-256 hashes of prompts/responses.

**Why free?** The CCS model charges for *issuing* receipts, not verifying them. Verification is a public good — anyone should be able to verify, unlimited, with no friction. This enables third-party verification, which builds trust without requiring you to trust the issuer.

**Install:**
```
npx ccs-verifier-mcp
```

**Tech:**
- Pure JavaScript, no native deps
- tweetnacl for Ed25519 (constant-time)
- Stdio transport (works with Claude Desktop, Cursor, Continue, etc.)
- 13/13 test cases
- CC0-1.0 licensed (public domain)

**Links:**
- npm: https://www.npmjs.com/package/ccs-verifier-mcp
- GitHub: https://github.com/DSHCorrectover/ccs-verifier-mcp

The server exposes three tools: verify_receipt, get_verifier_info, and generate_test_receipt (for development).

Happy to answer questions.
