# 🌐 Expor DIBEA para Internet

Este guia mostra como tornar sua aplicação DIBEA acessível pela internet usando Cloudflare Tunnel.

## 📋 Pré-requisitos

Instalar o Cloudflare Tunnel (cloudflared):

### Ubuntu/Debian:
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### macOS:
```bash
brew install cloudflare/cloudflare/cloudflared
```

### Windows:
Baixe o instalador em: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

## 🚀 Uso Rápido

### Opção 1: Desenvolvimento Local + Público (Recomendado)

```bash
npm run dev:public
```

Este comando irá:
1. ✅ Iniciar o backend (porta 3000)
2. ✅ Iniciar o frontend (porta 3002)
3. ✅ Criar túneis públicos para ambos
4. ✅ Exibir as URLs públicas no terminal

**Exemplo de saída:**
```
======================================================================
🎉 DIBEA está acessível publicamente!
======================================================================

📱 Frontend (Interface Web):
   https://abc123.trycloudflare.com

🔧 Backend (API):
   https://xyz789.trycloudflare.com

======================================================================
```

### Opção 2: Apenas Local (Sem Internet)

```bash
npm run dev
```

## ⚙️ Configuração Adicional

Após iniciar com `npm run dev:public`, você precisa atualizar a URL da API:

1. **Copie a URL do Backend** exibida no terminal
2. **Edite o arquivo** `apps/frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://xyz789.trycloudflare.com
   ```
3. **Reinicie apenas o frontend**:
   ```bash
   # Pare o processo atual (Ctrl+C)
   npm run dev:public
   ```

## 🛑 Parar os Túneis

Para parar apenas os túneis (mantendo backend/frontend rodando):

```bash
npm run tunnel:stop
```

Para parar tudo (backend + frontend + túneis):

```bash
# Pressione Ctrl+C no terminal onde está rodando npm run dev:public
```

## 📝 Notas Importantes

### ✅ Vantagens do Cloudflare Tunnel:
- **Gratuito e ilimitado** - Sem restrições de tempo ou requisições
- **HTTPS automático** - Certificado SSL incluído
- **Sem configuração de firewall** - Funciona em qualquer rede
- **Sem necessidade de IP público** - Funciona atrás de NAT/firewall

### ⚠️ Limitações:
- **URLs temporárias** - As URLs mudam a cada reinicialização
- **Não recomendado para produção** - Use apenas para desenvolvimento/demonstração

### 💡 URLs Fixas (Opcional):

Se você quiser URLs fixas que não mudam:

1. **Faça login no Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```

2. **Crie um túnel nomeado:**
   ```bash
   cloudflared tunnel create dibea
   ```

3. **Configure o túnel** (edite `~/.cloudflared/config.yml`):
   ```yaml
   tunnel: dibea
   credentials-file: /home/seu-usuario/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: dibea-frontend.seu-dominio.com
       service: http://localhost:3002
     - hostname: dibea-backend.seu-dominio.com
       service: http://localhost:3000
     - service: http_status:404
   ```

4. **Inicie o túnel:**
   ```bash
   cloudflared tunnel run dibea
   ```

## 🔧 Troubleshooting

### Problema: "cloudflared: command not found"
**Solução:** Instale o cloudflared seguindo as instruções de pré-requisitos acima.

### Problema: Túneis não iniciam
**Solução:** 
1. Verifique se as portas 3000 e 3002 estão livres
2. Aguarde 10 segundos após iniciar `npm run dev:public`
3. Verifique os logs no terminal

### Problema: Frontend não consegue acessar Backend
**Solução:**
1. Verifique se você atualizou o `NEXT_PUBLIC_API_URL` no `.env.local`
2. Reinicie o frontend após atualizar o `.env.local`
3. Verifique se o CORS está configurado corretamente no backend

### Problema: Erro de CORS
**Solução:** Adicione a URL do frontend no CORS do backend (`apps/backend/src/index.ts`):
```typescript
app.use(cors({
  origin: [
    'http://localhost:3002',
    'https://abc123.trycloudflare.com' // Adicione a URL do túnel
  ],
  credentials: true
}));
```

## 📚 Recursos Adicionais

- [Documentação Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Alternativas: ngrok, localtunnel, serveo](https://github.com/anderspitman/awesome-tunneling)

## 🎯 Casos de Uso

### Demonstração para Cliente
```bash
npm run dev:public
# Compartilhe a URL do Frontend com o cliente
```

### Teste em Dispositivo Móvel
```bash
npm run dev:public
# Acesse a URL do Frontend no seu celular
```

### Desenvolvimento Colaborativo
```bash
npm run dev:public
# Compartilhe as URLs com sua equipe
```

### Webhook Testing
```bash
npm run dev:public
# Use a URL do Backend para configurar webhooks
```

