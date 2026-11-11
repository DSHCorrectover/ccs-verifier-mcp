# CCS Verifier MCP Server - 技术方案与分发路径

**状态：** 规划完成，待执行  
**日期：** 2026-11-11  
**目标：** 将 Public Verifier 打包为 MCP server，作为 L2 分发层的种子

---

## 1. 已完成的工作

### 1.1 核心实现

✅ **CCS Verifier（Ed25519 验签）**
- 文件：`src/verifier.js`
- 功能：验证 CCS receipt 的 Ed25519 签名、结构、时间戳、哈希完整性
- 特性：纯加密验证，无 LLM 依赖，确定性输出
- 许可证：CC0-1.0（公共领域）

✅ **MCP Server 封装**
- 文件：`src/server.js`
- 功能：将 verifier 暴露为 MCP 工具
- 工具：
  - `verify_receipt` - 验证 CCS receipt
  - `get_verifier_info` - 获取验证器信息和使用统计
  - `generate_test_receipt` - 生成测试用 receipt（开发用）
- 传输：stdio（标准 MCP 传输）

✅ **文档**
- 文件：`README.md`
- 内容：快速开始、工具说明、定价模型、集成示例、自托管指南

### 1.2 项目结构

```
ccs-verifier-mcp/
├── package.json          # npm 包配置
├── README.md             # 用户文档
├── src/
│   ├── verifier.js       # 核心验证器
│   └── server.js         # MCP server
├── tests/                # 测试（待实现）
└── docs/                 # 额外文档（待实现）
```

---

## 2. 待完成的工作

### 2.1 测试套件（优先级：P0）

**目标：** 确保验证器正确性，建立信任

**测试用例：**
1. **有效 receipt 验证** - 应该返回 `valid: true, confidence: 1.0`
2. **无效签名** - 应该返回 `valid: false, confidence: 0.0`
3. **过期 receipt** - 应该返回 `valid: false`（timestamp > 24h）
4. **结构不完整** - 应该返回 `valid: false`
5. **哈希格式错误** - 应该返回 `valid: false`
6. **空 commitments** - 应该返回 `valid: false`
7. **边界情况** - 超大输入、特殊字符、Unicode

**实现：**
```javascript
// tests/verifier.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { CCSVerifier } from '../src/verifier.js';

test('valid receipt verification', () => {
  const verifier = new CCSVerifier();
  const receipt = generateValidReceipt();
  const result = verifier.verify(receipt);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.confidence, 1.0);
});

// ... more tests
```

**验收标准：**
- 所有测试通过
- 覆盖率 > 90%
- 包含至少 10 个边界情况测试

---

### 2.2 使用统计持久化（优先级：P1）

**目标：** 为 L3 决策提供数据依据

**当前实现：** 内存统计（重启丢失）

**改进方案：**

#### 方案 A：本地 JSON 文件（简单）
```javascript
// src/usage-tracker.js
import fs from 'node:fs';
import path from 'node:path';

const USAGE_FILE = path.join(process.cwd(), '.ccs-verifier-usage.json');

export class UsageTracker {
  constructor() {
    this.stats = this.load();
  }
  
  load() {
    if (fs.existsSync(USAGE_FILE)) {
      return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
    }
    return {
      totalVerifications: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
      startTime: Date.now(),
      verificationsByDay: {}
    };
  }
  
  save() {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(this.stats, null, 2));
  }
  
  track(result) {
    this.stats.totalVerifications++;
    if (result.valid) {
      this.stats.successfulVerifications++;
    } else {
      this.stats.failedVerifications++;
    }
    
    const day = new Date().toISOString().substring(0, 10);
    this.stats.verificationsByDay[day] = 
      (this.stats.verificationsByDay[day] || 0) + 1;
    
    this.save();
  }
}
```

**优点：** 简单、无外部依赖、隐私友好  
**缺点：** 单实例统计、无法聚合

#### 方案 B：远程统计服务（复杂，L3 阶段）
- 部署统计 API（Cloudflare Workers / Vercel Edge Functions）
- MCP server 每次验证时发送匿名统计
- 聚合所有实例的使用数据

**优点：** 全局视图、可分析趋势  
**缺点：** 需要基础设施、隐私考虑

**建议：** 先用方案 A，三个月后如果有真实使用量再升级到方案 B。

---

### 2.3 npm 发布准备（优先级：P0）

**目标：** 让开发者可以通过 `npx @correctover/ccs-verifier-mcp` 使用

**步骤：**

1. **创建 npm 账号**（如果还没有）
   ```bash
   npm adduser
   ```

2. **配置 package.json**
   ```json
   {
     "name": "@correctover/ccs-verifier-mcp",
     "version": "1.0.0",
     "description": "MCP Server for CCS Receipt Verification",
     "main": "src/server.js",
     "bin": {
       "ccs-verifier-mcp": "src/server.js"
     },
     "files": [
       "src/",
       "README.md",
       "LICENSE"
     ],
     "keywords": [
       "mcp",
       "ccs",
       "verification",
       "security",
       "receipt",
       "ed25519"
     ],
     "license": "CC0-1.0",
     "repository": {
       "type": "git",
       "url": "https://github.com/Correctover/ccs-verifier-mcp.git"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

3. **添加 LICENSE 文件**
   ```
   CC0 1.0 Universal
   
   Statement of Purpose
   ...
   ```

4. **测试发布（dry-run）**
   ```bash
   npm publish --dry-run
   ```

5. **正式发布**
   ```bash
   npm publish --access public
   ```

**验收标准：**
- `npx @correctover/ccs-verifier-mcp` 可以运行
- npm 页面显示正确的文档和元数据

---

### 2.4 GitHub 仓库（优先级：P0）

**目标：** 建立开源项目，接受社区贡献

**步骤：**

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 上创建：Correctover/ccs-verifier-mcp
   ```

2. **初始化本地仓库**
   ```bash
   cd ccs-verifier-mcp
   git init
   git add .
   git commit -m "Initial commit: CCS Verifier MCP Server"
   git branch -M main
   git remote add origin https://github.com/Correctover/ccs-verifier-mcp.git
   git push -u origin main
   ```

3. **配置仓库设置**
   - Issues: 启用
   - Discussions: 启用（用于 Q&A）
   - Wiki: 禁用（README 足够）
   - Projects: 启用（用于路线图）

4. **添加 GitHub Actions CI**
   ```yaml
   # .github/workflows/ci.yml
   name: CI
   
   on: [push, pull_request]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install
         - run: npm test
   ```

5. **添加 Issue 模板**
   ```markdown
   <!-- .github/ISSUE_TEMPLATE/bug_report.md -->
   ---
   name: Bug Report
   about: Report a bug in CCS Verifier
   ---
   
   **Describe the bug**
   ...
   ```

**验收标准：**
- 仓库公开可访问
- CI 通过
- README 渲染正确

---

### 2.5 MCP Registry 提交（优先级：P1）

**目标：** 让 MCP server 在官方 registry 中可发现

**当前状态：** MCP registry 尚未正式发布（截至 2026-11）

**备选方案：**

#### 方案 A：MCP Server 列表（社区维护）
- 提交到 [mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) 等社区列表
- 提交到 [MCP 官方示例](https://github.com/modelcontextprotocol/servers)

#### 方案 B：自建发现页面
- 在 correctover.com 创建 `/mcp-servers` 页面
- 列出所有 Correctover MCP servers
- 提供一键安装脚本

**建议：** 先用方案 A，等 MCP registry 正式发布后再提交。

---

### 2.6 框架集成示例（优先级：P2）

**目标：** 降低 LangChain/LlamaIndex 用户的接入门槛

**待实现的集成：**

1. **LangChain Python**
   ```python
   # examples/langchain-python/verify_receipt.py
   from langchain.tools import MCPTool
   
   ccs_verifier = MCPTool.from_server(
       server_url="npx://@correctover/ccs-verifier-mcp",
       tool_name="verify_receipt"
   )
   ```

2. **LlamaIndex Python**
   ```python
   # examples/llamaindex-python/verify_receipt.py
   from llama_index.tools.mcp import MCPTool
   
   ccs_verifier = MCPTool(
       command="npx",
       args=["-y", "@correctover/ccs-verifier-mcp"],
       tool_name="verify_receipt"
   )
   ```

3. **MCP SDK JavaScript**
   ```javascript
   // examples/mcp-sdk-js/verify_receipt.js
   import { Client } from '@modelcontextprotocol/sdk/client/index.js';
   ```

**验收标准：**
- 每个示例都有 README
- 每个示例都可以独立运行
- 包含预期输出示例

---

## 3. 分发路径

### 3.1 第一阶段：npm + GitHub（现在）

**目标：** 让开发者可以通过 `npx` 使用

**渠道：**
- npm registry
- GitHub 仓库
- README 文档

**预期结果：**
- 0-10 个开发者使用
- 主要用途：测试、评估

### 3.2 第二阶段：社区列表（1-2 周后）

**目标：** 增加可见性

**渠道：**
- Awesome MCP Servers 列表
- MCP 官方示例（如果接受）
- Reddit r/LocalLLaMA、r/MachineLearning
- Hacker News Show HN

**预期结果：**
- 10-100 个开发者使用
- 开始有真实使用数据

### 3.3 第三阶段：框架集成（1-3 个月后）

**目标：** 成为 LangChain/LlamaIndex 的默认证据验证工具

**渠道：**
- 向 LangChain/LlamaIndex 提交 PR，添加 CCS verifier 集成
- 在框架文档中提及
- 提供官方集成示例

**预期结果：**
- 100-1000 个开发者使用
- 有足够数据支持 L3 决策

### 3.4 第四阶段：MCP Registry（registry 发布后）

**目标：** 在官方 registry 中获得推荐位置

**渠道：**
- MCP 官方 registry
- Claude Desktop、Cursor 等客户端的内置发现

**预期结果：**
- 1000+ 开发者使用
- 成为 CCS 生态的标准验证器

---

## 4. 成功指标

### 4.1 短期（3 个月）

| 指标 | 目标 | 测量方法 |
|------|------|----------|
| npm 下载量 | 1000+ | npm stats |
| GitHub stars | 50+ | GitHub |
| 独立使用者 | 10+ | 使用统计 |
| Issue/PR | 5+ | GitHub |

### 4.2 中期（6 个月）

| 指标 | 目标 | 测量方法 |
|------|------|----------|
| npm 下载量 | 10,000+ | npm stats |
| GitHub stars | 200+ | GitHub |
| 独立使用者 | 100+ | 使用统计 |
| 框架集成 | 2+ | LangChain/LlamaIndex |

### 4.3 长期（12 个月）

| 指标 | 目标 | 测量方法 |
|------|------|----------|
| npm 下载量 | 100,000+ | npm stats |
| GitHub stars | 1000+ | GitHub |
| 独立使用者 | 1000+ | 使用统计 |
| L3 决策依据 | 有 | 使用数据 |

---

## 5. 风险与缓解

### 5.1 风险：无人使用

**可能性：** 高（MCP 生态仍在早期）  
**影响：** 中（浪费 1-2 周开发时间）  
**缓解：**
- 快速发布 MVP（1 周内）
- 在 Reddit/HN 宣传
- 如果 3 个月后 < 10 用户，pivot 到其他分发渠道

### 5.2 风险：验证器有 bug

**可能性：** 中  
**影响：** 高（损害信任）  
**缓解：**
- 发布前完成测试套件
- 添加 CI 自动测试
- 在 README 中明确标注"beta"
- 快速响应 issue

### 5.3 风险：MCP 协议变化

**可能性：** 中（MCP 仍在快速迭代）  
**影响：** 中（需要适配）  
**缓解：**
- 紧跟 MCP SDK 更新
- 使用稳定的 SDK 版本
- 在 package.json 中锁定依赖版本

### 5.4 风险：竞争对手出现

**可能性：** 低（CCS 是 Correctover 主导的标准）  
**影响：** 中（分散生态）  
**缓解：**
- 保持 CC0-1.0 开源
- 积极参与 CCS 标准制定
- 建立社区治理

---

## 6. 下一步行动

### 本周（P0）

- [ ] 完成测试套件（`tests/verifier.test.js`）
- [ ] 添加 LICENSE 文件（CC0-1.0）
- [ ] 测试 npm 发布（dry-run）
- [ ] 创建 GitHub 仓库
- [ ] 发布到 npm

### 下周（P1）

- [ ] 实现使用统计持久化（方案 A：本地 JSON）
- [ ] 提交到 Awesome MCP Servers 列表
- [ ] 在 Reddit r/LocalLLaMA 发帖
- [ ] 在 Hacker News 发 Show HN

### 本月（P2）

- [ ] 实现 LangChain 集成示例
- [ ] 实现 LlamaIndex 集成示例
- [ ] 向 LangChain 提交 PR（添加 CCS verifier）
- [ ] 收集第一个月的使用数据

### 下季度（P3）

- [ ] 评估使用数据，决定是否升级到方案 B（远程统计）
- [ ] 如果 MCP registry 发布，提交到 registry
- [ ] 根据社区反馈迭代功能
- [ ] 准备 L3 定价模型

---

## 7. 资源需求

### 7.1 开发时间

| 任务 | 预估时间 |
|------|----------|
| 测试套件 | 4 小时 |
| npm 发布 | 2 小时 |
| GitHub 仓库 | 1 小时 |
| 使用统计 | 3 小时 |
| 框架集成示例 | 6 小时 |
| **总计** | **16 小时（2 天）** |

### 7.2 基础设施成本

| 项目 | 成本 |
|------|------|
| npm 发布 | $0（免费） |
| GitHub 仓库 | $0（免费） |
| 使用统计存储（方案 A） | $0（本地文件） |
| **总计** | **$0** |

### 7.3 营销成本

| 项目 | 成本 |
|------|------|
| Reddit/HN 发帖 | $0（有机） |
| 框架集成 PR | $0（开源贡献） |
| **总计** | **$0** |

---

## 8. 结论

MCP server 是一个**低成本、高潜力**的 L2 分发策略：

✅ **优势：**
- 边际成本接近 0（已有 verifier 实现）
- MCP 是 2026 年 Agent 工具分发的唯一免费入口
- 不占用 OEM 破零资源
- 三个月内可以验证是否有真实需求

⚠️ **风险：**
- MCP 生态仍在早期，可能无人使用
- 需要快速迭代，适应协议变化

🎯 **建议：**
- **立即执行**，本周完成 P0 任务
- **三个月后评估**，如果使用量 < 10，pivot 到其他渠道
- **不要过度投入**，保持轻量级

---

**文档版本：** 1.0  
**最后更新：** 2026-11-11  
**维护者：** Correctover Team
