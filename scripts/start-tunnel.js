#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🌐 Iniciando túneis públicos para DIBEA...\n');

// Aguardar servidores iniciarem
console.log('⏳ Aguardando servidores iniciarem (10 segundos)...');

setTimeout(() => {
  console.log('✅ Iniciando túneis Cloudflare...\n');

  // Iniciar túnel para frontend
  const frontendTunnel = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:3002'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Iniciar túnel para backend
  const backendTunnel = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:3000'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let frontendUrl = '';
  let backendUrl = '';

  // Capturar URL do frontend
  frontendTunnel.stderr.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !frontendUrl) {
      frontendUrl = match[0];
      checkAndDisplayUrls();
    }
  });

  // Capturar URL do backend
  backendTunnel.stderr.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !backendUrl) {
      backendUrl = match[0];
      checkAndDisplayUrls();
    }
  });

  function checkAndDisplayUrls() {
    if (frontendUrl && backendUrl) {
      console.log('\n' + '='.repeat(70));
      console.log('🎉 DIBEA está acessível publicamente!');
      console.log('='.repeat(70));
      console.log('\n📱 Frontend (Interface Web):');
      console.log(`   ${frontendUrl}`);
      console.log('\n🔧 Backend (API):');
      console.log(`   ${backendUrl}`);
      console.log('\n' + '='.repeat(70));
      console.log('\n💡 Dicas:');
      console.log('   • Compartilhe a URL do Frontend com outras pessoas');
      console.log('   • As URLs mudam a cada reinicialização');
      console.log('   • Para URLs fixas, use: npx cloudflared tunnel login');
      console.log('\n⚠️  IMPORTANTE:');
      console.log('   • Atualize NEXT_PUBLIC_API_URL no .env.local para:');
      console.log(`     NEXT_PUBLIC_API_URL=${backendUrl}`);
      console.log('   • Reinicie o frontend após atualizar o .env.local');
      console.log('\n' + '='.repeat(70) + '\n');

      // Salvar URLs em arquivo
      const urlsFile = path.join(__dirname, '..', '.tunnel-urls.json');
      fs.writeFileSync(urlsFile, JSON.stringify({
        frontend: frontendUrl,
        backend: backendUrl,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  }

  // Salvar PIDs para cleanup
  const pidsFile = path.join(__dirname, '..', '.tunnel-pids');
  fs.writeFileSync(pidsFile, `${frontendTunnel.pid}\n${backendTunnel.pid}`);

  // Cleanup ao sair
  process.on('SIGINT', () => {
    console.log('\n🛑 Parando túneis...');
    frontendTunnel.kill();
    backendTunnel.kill();
    if (fs.existsSync(pidsFile)) {
      fs.unlinkSync(pidsFile);
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    frontendTunnel.kill();
    backendTunnel.kill();
    if (fs.existsSync(pidsFile)) {
      fs.unlinkSync(pidsFile);
    }
    process.exit(0);
  });

}, 10000);

