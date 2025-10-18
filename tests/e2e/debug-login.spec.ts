import { test, expect } from '@playwright/test';

test.describe('Debug Login and Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Capturar todos os logs do console
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[Browser ${type}]:`, text);
    });

    // Capturar erros de página
    page.on('pageerror', error => {
      console.error('[Browser Error]:', error.message);
      console.error('[Stack]:', error.stack);
    });

    // Capturar requisições falhadas
    page.on('requestfailed', request => {
      console.error('[Request Failed]:', request.url(), request.failure()?.errorText);
    });

    // Limpar localStorage antes de cada teste
    await page.goto('http://localhost:3002');
    await page.evaluate(() => localStorage.clear());
  });

  test('Debug Admin login and dashboard access', async ({ page }) => {
    console.log('\n🔍 === INICIANDO TESTE DE DEBUG - ADMIN ===\n');

    // 1. Ir para página de login
    console.log('📍 Navegando para /auth/login...');
    await page.goto('http://localhost:3002/auth/login');
    await page.waitForLoadState('networkidle');
    
    // 2. Preencher formulário
    console.log('📝 Preenchendo formulário de login...');
    await page.fill('input[type="email"]', 'admin@dibea.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // 3. Fazer login
    console.log('🖱️ Clicando no botão de login...');
    await page.click('button[type="submit"]');
    
    // 4. Aguardar navegação ou erro
    console.log('⏳ Aguardando resposta do login...');
    await page.waitForTimeout(3000);
    
    // 5. Verificar URL atual
    const currentUrl = page.url();
    console.log('📍 URL atual:', currentUrl);
    
    // 6. Verificar localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    console.log('💾 Token:', token ? 'EXISTS' : 'NOT FOUND');
    console.log('👤 User:', user ? JSON.parse(user) : 'NOT FOUND');
    
    // 7. Capturar screenshot
    await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
    console.log('📸 Screenshot salvo: debug-after-login.png');
    
    // 8. Verificar se há conteúdo na página
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📄 Texto da página (primeiros 500 chars):', bodyText.substring(0, 500));
    
    // 9. Verificar se há elementos visíveis
    const visibleElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let visible = 0;
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          visible++;
        }
      });
      return visible;
    });
    console.log('👁️ Elementos visíveis:', visibleElements);
    
    // 10. Verificar HTML da página
    const html = await page.content();
    console.log('📝 HTML da página (primeiros 1000 chars):', html.substring(0, 1000));
    
    // 11. Verificar se há erros no console
    const errors = await page.evaluate(() => {
      // @ts-ignore
      return window.__errors || [];
    });
    console.log('❌ Erros capturados:', errors);
    
    // 12. Aguardar mais um pouco para ver se algo carrega
    console.log('⏳ Aguardando 5 segundos para ver se algo carrega...');
    await page.waitForTimeout(5000);
    
    // 13. Screenshot final
    await page.screenshot({ path: 'debug-final.png', fullPage: true });
    console.log('📸 Screenshot final salvo: debug-final.png');
    
    const finalUrl = page.url();
    console.log('📍 URL final:', finalUrl);
    
    console.log('\n✅ === TESTE DE DEBUG CONCLUÍDO ===\n');
  });

  test('Debug Veterinário login and dashboard access', async ({ page }) => {
    console.log('\n🔍 === INICIANDO TESTE DE DEBUG - VETERINÁRIO ===\n');

    await page.goto('http://localhost:3002/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'vet@dibea.com');
    await page.fill('input[type="password"]', 'vet123');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 URL atual:', currentUrl);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📄 Texto da página:', bodyText.substring(0, 500));
    
    await page.screenshot({ path: 'debug-vet-dashboard.png', fullPage: true });
    console.log('📸 Screenshot salvo: debug-vet-dashboard.png');
  });

  test('Debug Funcionário login and dashboard access', async ({ page }) => {
    console.log('\n🔍 === INICIANDO TESTE DE DEBUG - FUNCIONÁRIO ===\n');

    await page.goto('http://localhost:3002/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'func@dibea.com');
    await page.fill('input[type="password"]', 'func123');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 URL atual:', currentUrl);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📄 Texto da página:', bodyText.substring(0, 500));
    
    await page.screenshot({ path: 'debug-staff-dashboard.png', fullPage: true });
    console.log('📸 Screenshot salvo: debug-staff-dashboard.png');
  });

  test('Debug Cidadão login and dashboard access', async ({ page }) => {
    console.log('\n🔍 === INICIANDO TESTE DE DEBUG - CIDADÃO ===\n');

    await page.goto('http://localhost:3002/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'cidadao@dibea.com');
    await page.fill('input[type="password"]', 'cidadao123');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 URL atual:', currentUrl);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📄 Texto da página:', bodyText.substring(0, 500));
    
    await page.screenshot({ path: 'debug-citizen-dashboard.png', fullPage: true });
    console.log('📸 Screenshot salvo: debug-citizen-dashboard.png');
  });
});

