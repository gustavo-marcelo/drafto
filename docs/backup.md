# Backup e restauração do banco de dados

Não existe backup do banco pela interface web. O procedimento é feito fora da aplicação, com `pg_dump` e `pg_restore` do PostgreSQL.

> **Segurança:** o dump contém dados de clientes, propostas e hashes de senha. Guarde os arquivos fora do servidor, com permissão restrita (`chmod 600 backups/*.dump`) e nunca os commite no Git.

## 1. Antes de começar

- **Com Docker Compose:** o banco roda no serviço `db` (volume `db-data`) e a imagem já contém `pg_dump`/`pg_restore`. Use as variáveis do `.env.docker`.
- **Sem Docker (ex.: Raspberry Pi):** o PostgreSQL roda no próprio sistema. Instale o cliente, se necessário: `sudo apt-get install -y postgresql-client`. Use as variáveis do `.env`.
- Os exemplos abaixo usam o formato **custom** (`-Fc`), que deve ser restaurado com `pg_restore`.
- Substitua `backups/arquivo.dump` pelo nome do arquivo que você quiser manter.

## 2. Com Docker Compose

Carregue as variáveis do ambiente e crie o backup:

```bash
set -a
source .env.docker
set +a

mkdir -p backups
docker compose --env-file .env.docker exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc \
  > "backups/drafto-$(date +%F-%H%M).dump"
```

O `-T` desativa o TTY, necessário para redirecionar a saída para o arquivo. Se `POSTGRES_USER` ou `POSTGRES_DB` não estiverem no `.env.docker`, use os padrões do Compose: `proposta` e `propostadb`.

### Restaurar

Execute no mesmo shell em que as variáveis foram carregadas. Pare a aplicação para evitar conexões ativas durante a restauração:

```bash
docker compose --env-file .env.docker stop app

docker compose --env-file .env.docker exec -T db \
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists \
  < backups/drafto-2026-11-23-0300.dump

docker compose --env-file .env.docker start app
```

`--clean --if-exists` remove e recria os objetos existentes. O banco (`POSTGRES_DB`) precisa existir — ele é criado pelo Postgres na primeira inicialização.

## 3. Sem Docker (PostgreSQL no sistema)

Carregue o `.env` e remova o parâmetro `schema` da URL: o cliente do PostgreSQL (libpq) não aceita `?schema=public`, presente na `DATABASE_URL` usada pelo Prisma.

```bash
set -a
source .env
set +a

DB_URL="${DATABASE_URL%%\?*}"   # ex.: postgresql://proposta:senha@localhost:5432/propostadb
mkdir -p backups

pg_dump -Fc "$DB_URL" > "backups/drafto-$(date +%F-%H%M).dump"
```

### Restaurar

Execute no mesmo shell em que `DB_URL` foi definida. Pare a aplicação primeiro (com PM2, `pm2 stop proposta`; sem PM2, encerre o processo do `next start`):

```bash
pg_restore --clean --if-exists -d "$DB_URL" < backups/drafto-2026-11-23-0300.dump

pm2 start proposta   # pule se a app não usa PM2
```

## 4. Conferir o dump

Para listar o conteúdo sem restaurar:

```bash
pg_restore -l backups/drafto-2026-11-23-0300.dump | head
```

Faça um teste de restauração em outro banco periodicamente — um dump que nunca foi restaurado não é um backup confiável.

## 5. Automatizando (opcional)

Exemplo de entrada no `crontab` para um backup diário às 03:00 (ajuste o caminho do projeto):

```cron
0 3 * * * cd /caminho/do/projeto && set -a && . ./.env.docker && set +a && mkdir -p backups && docker compose --env-file .env.docker exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > backups/drafto-$(date +\%F-\%H\%M).dump
```

Para a instalação sem Docker, troque o comando do Docker por `pg_dump -Fc "$DB_URL"`, após carregar o `.env` e definir `DB_URL` como no passo 3.

> No `crontab`, o sinal `%` precisa ser escapado como `\%`. Mantenha apenas alguns backups e configure a cópia para outro host ou storage — um backup na mesma máquina não protege contra falha de disco.
