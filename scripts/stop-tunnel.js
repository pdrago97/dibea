#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛑 Parando túneis Cloudflare...');

const pidsFile = path.join(__dirname, '..', '.tunnel-pids');

if (fs.existsSync(pidsFile)) {
  const pids = fs.readFileSync(pidsFile, 'utf-8').trim().split('\n');
  
  pids.forEach(pid => {
    try {
      process.kill(parseInt(pid), 'SIGTERM');
      console.log(`   ✓ Processo ${pid} parado`);
    } catch (error) {
      // Processo já não existe
    }
  });
  
  fs.unlinkSync(pidsFile);
} else {
  console.log('⚠️  Nenhum túnel ativo encontrado');
  console.log('   Tentando parar todos os processos cloudflared...');
  
  try {
    execSync('pkill -f cloudflared', { stdio: 'ignore' });
    console.log('   ✓ Processos cloudflared parados');
  } catch (error) {
    // Nenhum processo encontrado
  }
}

// Limpar arquivo de URLs
const urlsFile = path.join(__dirname, '..', '.tunnel-urls.json');
if (fs.existsSync(urlsFile)) {
  fs.unlinkSync(urlsFile);
}

console.log('✅ Túneis parados!');

