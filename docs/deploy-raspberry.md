# Deploy no Raspberry Pi (sem Docker)

Guia passo a passo para rodar o Drafto em um **Raspberry Pi 4 (64-bit)** com
o PostgreSQL instalado no próprio sistema, na rede local.

- **Sem Docker**, sem proxy reverso e sem HTTPS — o mais simples possível.
- Acesso pela rede local: `http://<ip-do-pi>:3000`.
- A geração de PDF usa o **Chromium do sistema** (economiza RAM e espaço no Pi).
- Backup/restore do banco: veja [backup.md](./backup.md) (seção "Sem Docker").

> Tempo estimado: 20–30 minutos. Faça tudo pelo terminal (SSH) do Raspberry.

---

## 1. Descobrir a arquitetura

```bash
uname -m
```

- `aarch64` → 64 bits ✅ (este guia).
- `armv7l` → 32 bits ⚠️ (o Node 22 64-bit não roda; reinstale o OS em 64 bits).

Confirme que é um **Pi 4** com OS de 64 bits (Raspberry Pi OS ou Ubuntu Server):

```bash
cat /etc/os-release | grep PRETTY_NAME
```

---

## 2. Instalar o Node.js 22

O Node do repositório do Raspberry é antigo. Instale pelo NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Confirme:

```bash
node -v   # v22.x
npm -v
```

---

## 3. Instalar o PostgreSQL

```bash
sudo apt-get update
sudo apt-get install -y postgresql
sudo systemctl enable --now postgresql
```

Crie o banco e o usuário que a aplicação usa:

```bash
sudo -u postgres psql <<'SQL'
CREATE USER proposta WITH PASSWORD 'proposta';
CREATE DATABASE propostadb OWNER proposta;
SQL
```

Teste a conexão:

```bash
psql "postgresql://proposta:proposta@localhost:5432/propostadb" -c "SELECT 1;"
```

> **Segurança:** troque a senha `proposta` por uma forte e use-a no `DATABASE_URL`.
> Como o Postgres só é acessado localmente, o padrão já é razoável para rede local.

---

## 4. Instalar o Chromium (para gerar PDFs)

```bash
sudo apt-get install -y chromium-browser \
  fonts-liberation libnss3 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 \
  libcups2 libdrm2 libgbm1 libpango-1.0-0 libxcomposite1 libxdamage1 \
  libxrandr2 libasound2
```

No Raspberry Pi OS, o binário costuma estar em `/usr/bin/chromium-browser`.
Confirme o caminho:

```bash
which chromium-browser chromium 2>/dev/null
```

Guarde o caminho retornado (vamos usá-lo no passo 6).

---

## 5. Baixar o código

```bash
cd ~
git clone <URL-DO-REPOSITORIO> drafto
cd drafto
```

> Se o repositório for privado, use um token de acesso ou copie a pasta via
> `scp`/`rsync` da sua máquina.

Instale as dependências **pulando o download do Chromium** do Puppeteer (vamos
usar o do sistema, economizando ~150 MB e RAM):

```bash
export PUPPETEER_SKIP_DOWNLOAD=true
npm ci
```

> A variável `PUPPETEER_SKIP_DOWNLOAD=true` precisa estar ativa no momento do
> `npm ci` para o Puppeteer não baixar o navegador. O `Puppeteer` continua
> instalado como biblioteca — apenas não traz o Chromium embutido.

---

## 6. Configurar o ambiente (`.env`)

```bash
cp .env.example .env
nano .env
```

Ajuste pelo menos estas linhas:

```bash
DATABASE_URL="postgresql://proposta:proposta@localhost:5432/propostadb?schema=public"
SESSION_SECRET="<cole aqui a saída de: openssl rand -base64 32>"
ADMIN_EMAIL="admin@drafto.ai"
ADMIN_PASSWORD="<uma senha forte>"
ADMIN_NAME="Administrador"

# Aponta o Puppeteer para o Chromium do sistema
PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

# Acesso por HTTP na rede local (sem HTTPS): o cookie de sessão NÃO pode ser
# marcado como "Secure", senão o navegador o descarta e o login não persiste.
COOKIE_SECURE="false"
```

Gere o segredo de sessão:

```bash
openssl rand -base64 32
```

> Se o caminho do Chromium do passo 4 for diferente, use o que apareceu lá.

---

## 7. Banco de dados (migrações e usuário inicial)

```bash
# carrega o .env nas variáveis de shell
set -a; source .env; set +a

npx prisma generate         # gera o client em src/generated/prisma
npx prisma migrate deploy   # aplica as migrações
npm run db:seed             # cria o usuário inicial + dados de exemplo
```

O seed imprime o usuário criado (ex.: `admin@drafto.ai`). O `postinstall` do
`npm ci` já executa o `prisma generate`; o comando explícito acima garante que o
cliente Prisma 7 esteja atualizado antes do build.

---

## 8. Build e execução

```bash
npm run build
npm run start   # sobe em http://0.0.0.0:3000
```

No navegador de outro computador da rede, acesse:

```
http://<ip-do-pi>:3000
```

Descubra o IP do Pi com `hostname -I`.

Login com o `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env`.

---

## 9. Manter rodando (PM2) — opcional, recomendado

Para o app não morrer ao fechar o SSH e reiniciar junto com o Pi:

```bash
sudo npm install -g pm2

pm2 start npm --name proposta -- start

pm2 save
pm2 startup   # siga o comando que ele imprimir (uma vez)
```

> O Next.js carrega o `.env` automaticamente no `next start`, então o PM2 não
> precisa de configuração extra de variáveis.

Operação:

```bash
pm2 status              # situação
pm2 logs proposta       # logs ao vivo
pm2 restart proposta    # reiniciar após atualizar o código
```

---

## 10. Atualizações futuras

```bash
cd ~/drafto
git pull

# Não baixa o Chromium de novo (o do sistema é usado)
export PUPPETEER_SKIP_DOWNLOAD=true

npm ci
npx prisma generate      # regera o cliente Prisma 7 em src/generated/prisma
npx prisma migrate deploy
npm run build
pm2 restart proposta
```

> Com Prisma 7, o cliente é gerado em `src/generated/prisma` (pasta ignorada pelo
> Git) e consumido via `@/generated/prisma/client`. O `postinstall` do `npm ci`
> já roda o `prisma generate`; execute o comando explicitamente se o build
> reclamar de `Cannot find module '@/generated/prisma/client'`.

### Conferir qual versão está no ar

```bash
curl -s http://localhost:3000/api/version
# {"version":"a7c1d64","buildId":"p27QRl5HvVpjI-LH3BuYm","startedAt":"2026-10-21T20:00:00.000Z","node":"v22.14.0"}
```

- `version`: commit do Git do **build em execução** (também aparece na tela de login)
- `buildId`: identificador do `.next/BUILD_ID` — compare com `cat .next/BUILD_ID` para confirmar que o servidor serve o build recém-gerado
- `startedAt`: quando o processo subiu — se for anterior ao último build, há um processo antigo no ar (`pm2 restart proposta`)

Se a versão servida não for a esperada, o problema é cache/processo, não código:

```bash
rm -rf .next && npm run build     # limpa o cache de build do Turbopack
pm2 delete proposta && pm2 start npm --name proposta -- start && pm2 save
```

---

## Solução de problemas

**PDF dá erro / página em branco**
Verifique o caminho do Chromium e teste manualmente:

```bash
/usr/bin/chromium-browser --headless --no-sandbox --disable-dev-shm-usage --screenshot=/tmp/t.png about:blank
```

Se não existir, instale (`sudo apt-get install -y chromium-browser`) e ajuste
`PUPPETEER_EXECUTABLE_PATH` no `.env`.

**`Variáveis de ambiente inválidas: SESSION_SECRET ...`**
O `SESSION_SECRET` precisa ter 32+ caracteres. Gere com `openssl rand -base64 32`.

**Login funciona, mas qualquer link volta para `/login`**
O cookie de sessão está marcado como `Secure` e o acesso é por HTTP. Defina
`COOKIE_SECURE="false"` no `.env` e reinicie (`pm2 restart proposta`). Isso é
seguro para a rede local; ao usar HTTPS (com proxy/domínio), remova essa linha.

**Build falha com `Cannot find module '@/generated/prisma/client'`**
A pasta `src/generated/prisma` (cliente Prisma 7 gerado) está ausente ou
desatualizada. Regere antes do build:

```bash
npx prisma generate
```

Se o `generate` falhar baixando o engine (arquitetura `arm64`), confira a
conexão com `binaries.prisma.sh` e use a versão de OpenSSL do sistema:

```bash
openssl version   # precisa ser 3.x
sudo apt-get install -y libssl3
```

**Erro de conexão com o banco**
Confirme que o Postgres está ativo (`sudo systemctl status postgresql`) e que o
`DATABASE_URL` bate com usuário/senha/banco criados no passo 3.

**App não reinicia ao ligar o Pi**
Rode `pm2 save` e depois o comando que `pm2 startup` imprimiu.

**Memória / desempenho**
Durante `npm run build` o consumo de RAM é alto (pode passar de 1 GB). Se travar,
adicione swap (`sudo dphys-swapfile setup` + `sudo dphys-swapfile swapon`) ou
faça o build em outra máquina e copie a pasta `.next` para o Pi.

**Porta 3000 ocupada**
Troque a porta: `PORT=3001 npm run start` (e ajuste no PM2, se usar).

---

## Resumo (colinha)

```bash
# 1x
sudo apt-get install -y nodejs postgresql chromium-browser
git clone <repo> ~/drafto && cd ~/drafto
PUPPETEER_SKIP_DOWNLOAD=true npm ci
cp .env.example .env    # edite: DATABASE_URL, SESSION_SECRET, ADMIN_*, PUPPETEER_EXECUTABLE_PATH
set -a; source .env; set +a
npx prisma generate && npx prisma migrate deploy && npm run db:seed
npm run build && npm run start
```
