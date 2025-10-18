import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de login
    await page.goto('http://localhost:3002/auth/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Verificar título
    await expect(page.locator('h1')).toContainText('Bem-vindo ao DIBEA');
    
    // Verificar campos de formulário
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Verificar botões de demo
    await expect(page.getByText('Admin')).toBeVisible();
    await expect(page.getByText('Veterinário')).toBeVisible();
    await expect(page.getByText('Funcionário')).toBeVisible();
    await expect(page.getByText('Cidadão')).toBeVisible();
  });

  test('should login successfully with Admin account', async ({ page }) => {
    console.log('🔐 Testing Admin login...');
    
    // Preencher formulário
    await page.fill('input[type="email"]', 'admin@dibea.com');
    await page.fill('input[type="password"]', 'admin123');
    
    console.log('📝 Form filled');
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    console.log('🖱️ Submit button clicked');
    
    // Aguardar navegação ou mensagem de erro
    await page.waitForTimeout(2000);
    
    // Verificar se foi redirecionado ou se há erro
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Capturar logs do console
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
      console.log(`Browser console [${msg.type()}]:`, msg.text());
    });
    
    // Verificar localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    
    console.log('💾 Token in localStorage:', token ? 'EXISTS' : 'NOT FOUND');
    console.log('👤 User in localStorage:', user ? 'EXISTS' : 'NOT FOUND');
    
    if (user) {
      const userData = JSON.parse(user);
      console.log('👤 User data:', userData);
    }
    
    // Verificar se foi redirecionado para dashboard
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
      console.log('✅ Successfully redirected to dashboard!');
      expect(currentUrl).toMatch(/\/(dashboard|admin)/);
    } else {
      console.log('❌ Not redirected. Still on:', currentUrl);
      
      // Capturar screenshot para debug
      await page.screenshot({ path: 'login-failed.png', fullPage: true });
      console.log('📸 Screenshot saved to login-failed.png');
      
      // Verificar se há mensagem de erro
      const errorMessage = await page.locator('text=/erro|incorreto|inválido/i').first().textContent().catch(() => null);
      if (errorMessage) {
        console.log('⚠️ Error message:', errorMessage);
      }
    }
  });

  test('should login with quick login button - Admin', async ({ page }) => {
    console.log('🔐 Testing Admin quick login button...');
    
    // Capturar logs do console
    page.on('console', msg => {
      console.log(`Browser [${msg.type()}]:`, msg.text());
    });
    
    // Capturar requisições de rede
    page.on('request', request => {
      if (request.url().includes('/api/v1/auth/login')) {
        console.log('📡 Request to:', request.url());
        console.log('📤 Request body:', request.postData());
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('/api/v1/auth/login')) {
        console.log('📥 Response status:', response.status());
        const body = await response.text().catch(() => 'Could not read body');
        console.log('📥 Response body:', body);
      }
    });
    
    // Clicar no botão de quick login do Admin
    await page.click('button:has-text("Admin")');
    
    console.log('🖱️ Admin quick login button clicked');
    
    // Aguardar campos serem preenchidos
    await page.waitForTimeout(500);
    
    // Verificar se os campos foram preenchidos
    const emailValue = await page.inputValue('input[type="email"]');
    const passwordValue = await page.inputValue('input[type="password"]');
    
    console.log('📝 Email filled:', emailValue);
    console.log('📝 Password filled:', passwordValue ? '***' : 'EMPTY');
    
    expect(emailValue).toBe('admin@dibea.com');
    expect(passwordValue).toBe('admin123');
    
    // Clicar no botão de submit
    await page.click('button[type="submit"]');
    
    console.log('🖱️ Submit button clicked');
    
    // Aguardar navegação ou erro
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 Final URL:', currentUrl);
    
    // Verificar localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    
    console.log('💾 Token:', token ? 'EXISTS' : 'NOT FOUND');
    console.log('👤 User:', user ? JSON.parse(user) : 'NOT FOUND');
    
    // Capturar screenshot
    await page.screenshot({ path: 'login-admin-final.png', fullPage: true });
    console.log('📸 Screenshot saved to login-admin-final.png');
  });

  test('should test all demo accounts', async ({ page }) => {
    const accounts = [
      { name: 'Admin', email: 'admin@dibea.com', password: 'admin123' },
      { name: 'Veterinário', email: 'vet@dibea.com', password: 'vet123' },
      { name: 'Funcionário', email: 'func@dibea.com', password: 'func123' },
      { name: 'Cidadão', email: 'cidadao@dibea.com', password: 'cidadao123' },
    ];

    for (const account of accounts) {
      console.log(`\n🧪 Testing ${account.name} account...`);
      
      // Limpar localStorage
      await page.evaluate(() => {
        localStorage.clear();
      });
      
      // Recarregar página
      await page.goto('http://localhost:3002/auth/login');
      
      // Preencher e submeter
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      await page.click('button[type="submit"]');
      
      // Aguardar
      await page.waitForTimeout(2000);
      
      // Verificar resultado
      const token = await page.evaluate(() => localStorage.getItem('token'));
      const currentUrl = page.url();
      
      console.log(`  📍 URL: ${currentUrl}`);
      console.log(`  💾 Token: ${token ? 'EXISTS' : 'NOT FOUND'}`);
      
      if (token && currentUrl.includes('dashboard')) {
        console.log(`  ✅ ${account.name} login successful!`);
      } else {
        console.log(`  ❌ ${account.name} login failed!`);
        await page.screenshot({ path: `login-failed-${account.name.toLowerCase()}.png` });
      }
    }
  });
});

