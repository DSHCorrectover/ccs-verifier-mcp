# MCP Server 自动分发完整指南

## 已完成 ✅

### 核心产品
- **npm**: `ccs-verifier-mcp@1.0.0` 
  - https://www.npmjs.com/package/ccs-verifier-mcp
- **GitHub**: `DSHCorrectover/ccs-verifier-mcp`
  - https://github.com/DSHCorrectover/ccs-verifier-mcp
- **测试**: 13/13 通过
- **License**: CC0-1.0

### 目录提交（已自动化）
- ✅ **punkpeye/awesome-mcp-servers** (92.7k stars)
  - PR #19185: https://github.com/punkpeye/awesome-mcp-servers/pull/19185
  - 状态: 已提交，等待审核
  
- ✅ **YuzeHao2023/Awesome-MCP-Servers** (1.1k stars)
  - PR #850: https://github.com/YuzeHao2023/Awesome-MCP-Servers/pull/850
  - 状态: 已提交，等待审核

### 自动索引（24-48h 内自动收录）
以下目录会从 npm 自动抓取：
- **Glama.ai** (119k+ servers): https://glama.ai/mcp/servers
- **mcp.so** (8.5k+ servers): https://mcp.so
- **Smithery.ai**: https://smithery.ai
- **PulseMCP**: https://pulsemcp.com
- **mcpservers.org**: https://mcpservers.org

---

## 需要手动提交 📝

### 1. mcp.so（免费提交）
**URL**: https://mcp.so/submit?type=server

**步骤**:
1. 访问上述链接
2. 填写表单：
   - **Name**: `CCS Verifier MCP Server`
   - **Description**: `Free, unlimited Ed25519 receipt verification for the CCS (Cryptographic Commitment Scheme) standard. CC0-1.0 licensed, implements draft-correctover-ccs-11.`
   - **GitHub Repository**: `https://github.com/DSHCorrectover/ccs-verifier-mcp`
   - **npm Package**: `ccs-verifier-mcp`
   - **Category**: `Security` 或 `Developer Tools`
   - **Tags**: `ccs`, `verification`, `ed25519`, `cryptography`, `mcp`
   - **Install Command**: `npx ccs-verifier-mcp`
3. 提交（免费审核，或 $39 立即发布）

### 2. mcpservers.org（免费提交）
**URL**: https://mcpservers.org/submit

**步骤**:
1. 访问上述链接
2. 填写表单：
   - **Server Name**: `CCS Verifier`
   - **Description**: `Free, unlimited CCS receipt verification via Ed25519 signatures. CC0-1.0 licensed.`
   - **GitHub URL**: `https://github.com/DSHCorrectover/ccs-verifier-mcp`
   - **npm Package**: `ccs-verifier-mcp`
   - **Category**: `Security`
3. 提交

### 3. Smithery.ai（需要 API Key）
**URL**: https://smithery.ai/account/api-keys

**步骤**:
1. 注册/登录 Smithery
2. 获取 API Key: https://smithery.ai/account/api-keys
3. 运行命令：
```bash
npx -y @smithery/cli mcp publish \
  "https://github.com/DSHCorrectover/ccs-verifier-mcp" \
  -n DSHCorrectover/ccs-verifier-mcp
```
4. 按提示输入 API Key

### 4. Reddit r/LocalLLaMA
**URL**: https://reddit.com/r/LocalLLaMA/submit

**标题**: 
```
[Tool] ccs-verifier-mcp — Free, unlimited Ed25519 receipt verification for AI evaluation (CC0-1.0, stdio MCP server)
```

**链接**: `https://github.com/DSHCorrectover/ccs-verifier-mcp`

**正文**（复制自 docs/COMMUNITY_POSTS.md）:
```
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
```

### 5. Reddit r/mcp
**URL**: https://reddit.com/r/mcp/submit

**标题**: 
```
ccs-verifier-mcp — Free CCS receipt verification MCP server (Ed25519, CC0-1.0)
```

**链接**: `https://github.com/DSHCorrectover/ccs-verifier-mcp`

**正文**（复制自 docs/COMMUNITY_POSTS.md）:
```
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
```

### 6. Hacker News Show HN
**URL**: https://news.ycombinator.com/submit

**标题**: 
```
Show HN: ccs-verifier-mcp – Free, unlimited Ed25519 receipt verification for AI evaluation (CC0-1.0)
```

**链接**: `https://github.com/DSHCorrectover/ccs-verifier-mcp`

**正文**（复制自 docs/COMMUNITY_POSTS.md）:
```
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
```

---

## 其他可选目录

### 7. MCP Registry（官方）
**状态**: 暂未开放 PR 提交
**预计**: 2026 Q1-Q2 开放正式发布流程
**关注**: https://github.com/modelcontextprotocol/registry

### 8. AllMCPs
**URL**: https://allmcps.com/submit（如有）
**说明**: 社区维护的 MCP 目录

### 9. MCP Market
**URL**: https://mcpmarket.com/submit（如有）
**说明**: 19k+ servers 的大型目录

---

## 自动化脚本（可选）

如果你想批量提交，可以用以下脚本框架：

```bash
#!/bin/bash
# submit-to-directories.sh

REPO_URL="https://github.com/DSHCorrectover/ccs-verifier-mcp"
NPM_PKG="ccs-verifier-mcp"

echo "Submitting to directories..."

# 这里可以添加 curl 命令调用各目录的 API（如果有）
# 大多数目录需要手动通过 Web 表单提交

echo "Manual submission required for:"
echo "- mcp.so: https://mcp.so/submit?type=server"
echo "- mcpservers.org: https://mcpservers.org/submit"
echo "- Smithery: npx @smithery/cli mcp publish"
echo "- Reddit: https://reddit.com/r/LocalLLaMA/submit"
echo "- HN: https://news.ycombinator.com/submit"
```

---

## 时间线

| 任务 | 状态 | 预计时间 |
|------|------|----------|
| npm 发布 | ✅ 完成 | - |
| GitHub 仓库 | ✅ 完成 | - |
| Awesome 列表 PR | ✅ 已提交 | 1-2 周审核 |
| 自动索引（Glama 等） | ⏳ 进行中 | 24-48h |
| mcp.so 手动提交 | 📝 待完成 | 5 分钟 |
| mcpservers.org 手动提交 | 📝 待完成 | 5 分钟 |
| Smithery 手动提交 | 📝 待完成 | 10 分钟 |
| Reddit 发布 | 📝 待完成 | 10 分钟 |
| HN 发布 | 📝 待完成 | 5 分钟 |

---

## 成功指标

**短期（1 周）**:
- Awesome 列表 PR 合并
- 自动目录收录完成
- 首批社区反馈

**中期（1 月）**:
- 100+ npm 下载
- 10+ GitHub stars
- 5+ 社区讨论

**长期（1 季度）**:
- 1,000+ npm 下载
- 50+ GitHub stars
- 首批 OEM 客户咨询

---

**执行时间**: 2026-11-11  
**版本**: v1.0.0  
**状态**: 产品就绪，分发进行中
