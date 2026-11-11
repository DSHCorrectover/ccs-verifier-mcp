#!/usr/bin/env node

const TOKEN = process.env.GITHUB_TOKEN || '';

if (!TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable not set');
  process.exit(1);
}

async function checkPRs() {
  console.log(`🔍 Checking PR status at ${new Date().toISOString()}...\n`);
  
  // Check punkpeye/awesome-mcp-servers PR #19185
  const pr1 = await fetch('https://api.github.com/repos/punkpeye/awesome-mcp-servers/pulls/19185', {
    headers: { 'Authorization': `token ${TOKEN}` }
  }).then(r => r.json());
  
  console.log(`📋 punkpeye/awesome-mcp-servers #19185:`);
  console.log(`   State: ${pr1.state}`);
  console.log(`   Merged: ${pr1.merged_at || 'No'}`);
  console.log(`   Updated: ${pr1.updated_at}`);
  
  if (pr1.merged_at) {
    console.log(`   ✅ MERGED!`);
  } else if (pr1.state === 'closed') {
    console.log(`   ❌ CLOSED (not merged)`);
  } else {
    console.log(`   ⏳ Still open`);
  }
  
  console.log('');
  
  // Check YuzeHao2023/Awesome-MCP-Servers PR #850
  const pr2 = await fetch('https://api.github.com/repos/YuzeHao2023/Awesome-MCP-Servers/pulls/850', {
    headers: { 'Authorization': `token ${TOKEN}` }
  }).then(r => r.json());
  
  console.log(`📋 YuzeHao2023/Awesome-MCP-Servers #850:`);
  console.log(`   State: ${pr2.state}`);
  console.log(`   Merged: ${pr2.merged_at || 'No'}`);
  console.log(`   Updated: ${pr2.updated_at}`);
  
  if (pr2.merged_at) {
    console.log(`   ✅ MERGED!`);
  } else if (pr2.state === 'closed') {
    console.log(`   ❌ CLOSED (not merged)`);
  } else {
    console.log(`   ⏳ Still open`);
  }
  
  console.log('');
  
  // Check our repo for new PRs/issues
  const ourPRs = await fetch('https://api.github.com/repos/DSHCorrectover/ccs-verifier-mcp/pulls?state=all', {
    headers: { 'Authorization': `token ${TOKEN}` }
  }).then(r => r.json());
  
  console.log(`📦 DSHCorrectover/ccs-verifier-mcp PRs: ${ourPRs.length}`);
  for (const pr of ourPRs) {
    console.log(`   #${pr.number}: ${pr.title} (${pr.state})`);
  }
  
  const ourIssues = await fetch('https://api.github.com/repos/DSHCorrectover/ccs-verifier-mcp/issues?state=all', {
    headers: { 'Authorization': `token ${TOKEN}` }
  }).then(r => r.json());
  
  console.log(`\n🐛 DSHCorrectover/ccs-verifier-mcp Issues: ${ourIssues.length}`);
  for (const issue of ourIssues) {
    if (!issue.pull_request) {
      console.log(`   #${issue.number}: ${issue.title} (${issue.state})`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

checkPRs().catch(console.error);
