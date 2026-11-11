import puppeteer from 'puppeteer';

const SERVER_DATA = {
  name: 'ccs-verifier-mcp',
  description: 'Free, unlimited CCS receipt verification via Ed25519 signatures. CC0-1.0 licensed.',
  github: 'https://github.com/DSHCorrectover/ccs-verifier-mcp',
  npm: 'https://www.npmjs.com/package/ccs-verifier-mcp',
  category: 'Security'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function submitToMcpSo() {
  console.log('📤 Submitting to mcp.so...');
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://mcp.so/submit?type=server', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(3000);
    
    // Take screenshot for debugging
    await page.screenshot({ path: '/tmp/mcp-so-form.png' });
    console.log('  📸 Screenshot saved');
    
    // Try to find and fill form fields
    const inputs = await page.$$('input, textarea, select');
    console.log(`  Found ${inputs.length} form elements`);
    
    for (const input of inputs) {
      const name = await input.evaluate(el => el.name || el.id || el.placeholder);
      const type = await input.evaluate(el => el.tagName);
      console.log(`  - ${type}: ${name}`);
    }
    
    console.log('✅ mcp.so page loaded (manual inspection needed)');
  } catch (e) {
    console.log('❌ mcp.so failed:', e.message);
  } finally {
    await browser.close();
  }
}

async function submitToMcpServersOrg() {
  console.log('📤 Submitting to mcpservers.org...');
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://mcpservers.org/submit', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(3000);
    
    // Fill form fields
    await page.type('input[name="name"]', SERVER_DATA.name);
    await page.type('input[name="description"]', SERVER_DATA.description);
    await page.type('input[name="url"]', SERVER_DATA.github);
    await page.select('select[name="category"]', 'Security');
    
    // Select free submission
    await page.click('input[name="plan"][value="free"]');
    
    // Take screenshot before submit
    await page.screenshot({ path: '/tmp/mcpservers-filled.png' });
    console.log('  📸 Form filled screenshot saved');
    
    // Submit
    await page.click('input[name="free-submit"], button[type="submit"]');
    await delay(5000);
    
    // Take screenshot after submit
    await page.screenshot({ path: '/tmp/mcpservers-submitted.png' });
    console.log('  📸 Submission result saved');
    
    console.log('✅ mcpservers.org submitted');
  } catch (e) {
    console.log('❌ mcpservers.org failed:', e.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 Starting automated submissions...\n');
  
  await submitToMcpSo();
  console.log('');
  await submitToMcpServersOrg();
  
  console.log('\n🎉 All submissions complete');
}

main().catch(console.error);
