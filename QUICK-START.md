# 🚀 DIBEA - Guia Rápido

## 📋 Instalação Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
npm run db:migrate
npm run db:seed
```

## 🎯 Desenvolvimento

### Opção 1: Apenas Local (Localhost)

```bash
npm run dev
```

Acesse:
- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:3000

### Opção 2: Acessível pela Internet 🌐

```bash
# 1. Instalar Cloudflare Tunnel (apenas uma vez)
# Ubuntu/Debian:
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# macOS:
brew install cloudflare/cloudflare/cloudflared

# 2. Iniciar com túneis públicos
npm run dev:public
```

Você verá algo assim:
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

**Compartilhe a URL do Frontend** com qualquer pessoa para acessar sua aplicação!

## 👥 Contas de Demonstração

Use estas contas para fazer login:

| Tipo | Email | Senha |
|------|-------|-------|
| 👑 **Admin** | admin@dibea.com | admin123 |
| 🩺 **Veterinário** | vet@dibea.com | vet123 |
| 👨‍💼 **Funcionário** | func@dibea.com | func123 |
| 👤 **Cidadão** | cidadao@dibea.com | cidadao123 |

## 🛑 Parar Servidores

```bash
# Pressione Ctrl+C no terminal
```

## 📚 Mais Informações

- **Túneis Públicos:** Veja [TUNNEL-SETUP.md](TUNNEL-SETUP.md)
- **Documentação Completa:** Veja [README.md](README.md)

## 🆘 Problemas Comuns

### Porta já em uso
```bash
# Matar processos nas portas 3000 e 3002
lsof -ti:3000 -ti:3002 | xargs kill -9
```

### Cloudflared não encontrado
```bash
# Instale seguindo as instruções acima
```

### Frontend não acessa Backend (modo público)
```bash
# 1. Copie a URL do Backend exibida no terminal
# 2. Edite apps/frontend/.env.local:
#    NEXT_PUBLIC_API_URL=https://xyz789.trycloudflare.com
# 3. Reinicie: npm run dev:public
```

