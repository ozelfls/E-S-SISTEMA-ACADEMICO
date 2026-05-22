# Deploy GHFlusao

Este guia cobre o deploy simples em uma VM Linux, como uma instancia da Oracle Cloud.

## Arquivos de deploy

- `docker-compose.prod.yml`: sobe banco Oracle, backend Spring Boot e frontend Nginx.
- `.env.deploy.example`: modelo sem segredos reais para criar o `.env.deploy`.
- `frontend/nginx.conf`: serve o React e roteia `/api` para o backend.

## Primeira subida

Crie um arquivo local chamado `.env.deploy` e preencha:

```bash
cp .env.deploy.example .env.deploy
```

```env
APP_USER=GHFLUSAO
APP_USER_PASSWORD=troque_essa_senha_do_app
ORACLE_PASSWORD=troque_a_senha_sys_do_oracle
ORACLE_USER=GHFLUSAO
ORACLE_SCHEMA=GHFLUSAO
ORACLE_JDBC_URL=jdbc:oracle:thin:@//database:1521/FREEPDB1
# Exemplo valido, mas fraco. Gere outro antes de subir producao.
JWT_SECRET=YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYQ==
JWT_EXPIRATION=86400000
CORS_ORIGINS=https://seu-dominio.com.br
SWAGGER_ENABLED=false
SPRING_PROFILES_ACTIVE=prod
DB_POOL_MAX=8
DB_POOL_MIN_IDLE=1
FRONTEND_PORT=80
VITE_API_URL=/api
```

Para gerar `JWT_SECRET` no PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

Para subir:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.deploy up -d --build
```

Health checks:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.deploy ps
curl http://localhost/api/actuator/health/readiness
```

## Topologia recomendada

O frontend publica a porta `80` e o Nginx encaminha `/api` para o backend dentro da rede Docker.

O backend fica exposto apenas em `127.0.0.1:8080` para debug local na VM.

O banco nao deve ficar exposto publicamente. O volume `oracle-data` guarda os dados persistentes.

## Oracle Cloud

Para uma VM pequena, comece conservador:

- 2 OCPU / 12 GB RAM para rodar Oracle + backend + frontend no mesmo host.
- Liberar publicamente apenas `80` e, se usar TLS na propria VM, `443`.
- Manter `1521` fechado para a internet.
- Usar volume persistente para Docker/Oracle.
- Se usar HTTPS, termine TLS em Load Balancer/Cloudflare/reverse proxy externo ou adicione configuracao TLS ao Nginx antes de expor `443`.

Se o banco for migrar para Oracle Autonomous Database depois, mantenha o mesmo backend e troque `ORACLE_JDBC_URL`, `ORACLE_USER` e `APP_USER_PASSWORD` no `.env.deploy`.

## Atualizacao de versao

Antes de rebuildar uma versao que pode aplicar migrations, faca backup do schema Oracle.

Exemplo com Data Pump dentro do container:

```bash
set -a
. ./.env.deploy
set +a

docker exec ghflusao-database expdp "$APP_USER/$APP_USER_PASSWORD@FREEPDB1" \
  schemas="$APP_USER" directory=DATA_PUMP_DIR \
  dumpfile=ghflusao_$(date +%Y%m%d_%H%M%S).dmp \
  logfile=ghflusao_backup.log
```

Depois do dump, copie o arquivo para fora do container ou para um bucket/volume externo antes de mexer no banco.

Depois atualize sem derrubar volumes:

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.deploy up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.deploy ps
```

Evite `docker compose down` em producao para nao correr risco de remover recursos por engano. Use `up -d --build` e mantenha o volume `oracle-data`.

## Observacoes

- Em producao, `SWAGGER_ENABLED=false` por padrao.
- `VITE_API_URL=/api` evita CORS no deploy de VM unica.
- `CORS_ORIGINS` deve apontar para o dominio real do frontend.
- Nao versionar `.env.deploy`.
- `.env.deploy.example` tem apenas placeholders e pode ser versionado.
