// Script simples para testar login
const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Iniciando teste de login...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capturar logs do console
  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}]:`, msg.text());
  });
  
  // Capturar erros
  page.on('pageerror', error => {
    console.log(`[Browser Error]:`, error.message);
  });
  
  try {
    console.log('📍 Navegando para página de login...');
    await page.goto('http://localhost:3002/auth/login', { waitUntil: 'networkidle2' });
    
    console.log('📝 Preenchendo formulário...');
    await page.type('input[type="email"]', 'admin@dibea.com');
    await page.type('input[type="password"]', 'admin123');
    
    console.log('🖱️ Clicando em Entrar...');
    await page.click('button[type="submit"]');
    
    console.log('⏳ Aguardando navegação...');
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('📍 URL atual:', currentUrl);
    
    // Verificar localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    
    console.log('💾 Token:', token ? 'EXISTS' : 'NOT FOUND');
    console.log('👤 User:', user ? JSON.parse(user) : 'NOT FOUND');
    
    if (currentUrl.includes('dashboard')) {
      console.log('✅ Login bem-sucedido! Redirecionado para dashboard.');
    } else {
      console.log('❌ Login falhou ou não redirecionou.');
    }
    
    console.log('\n⏸️ Aguardando 10 segundos para você ver o resultado...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 Teste finalizado.');
  }
})();

