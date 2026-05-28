# GHFlusao - Sistema Academico

Sistema academico com backend Spring Boot, banco PostgreSQL e frontend React/TypeScript.

O caminho operacional atual e PostgreSQL. As configuracoes e migrations legadas de Oracle foram removidas da aplicacao.

## Como Rodar Localmente

### Pre-requisitos

- Docker Desktop
- Node.js 20+
- Java 21
- Maven 3.9+

### Banco PostgreSQL

```bash
docker run -d --name ghflusao-postgres \
  -e POSTGRES_USER=ghflusao \
  -e POSTGRES_PASSWORD=ghflusao123 \
  -e POSTGRES_DB=ghflusao \
  -p 5432:5432 \
  postgres:16-alpine
```

No ambiente local desta maquina, o container de laboratorio pode estar com o nome `ghflusao_oracle`, mas ele roda PostgreSQL 16.

### Backend

No diretorio `backend`, use PostgreSQL com seed de laboratorio:

```bash
set SPRING_PROFILES_ACTIVE=dev,postgres-demo
set POSTGRES_JDBC_URL=jdbc:postgresql://localhost:5432/ghflusao
set POSTGRES_USER=ghflusao
set POSTGRES_PASSWORD=ghflusao123
set POSTGRES_SCHEMA=public
set JWT_SECRET=0123456789012345678901234567890123456789012345678901234567890123
set CORS_ORIGINS=http://localhost:5173
set SWAGGER_ENABLED=true
set BOOTSTRAP_DEMO_ADMINS=true
set PORT=8081
mvn spring-boot:run
```

API:

- `http://localhost:8081/api`
- Swagger: `http://localhost:8081/api/swagger-ui/index.html`

### Frontend

No diretorio `frontend`:

```bash
npm install
npm run dev
```

Aplicacao:

- `http://localhost:5173`

O arquivo `frontend/.env.local` aponta para `http://localhost:8081/api`.

## Docker

Servicos principais:

- `database/Dockerfile`: PostgreSQL 16 Alpine.
- `backend/Dockerfile`: Spring Boot Java 21 com build Maven multi-stage.
- `frontend/Dockerfile`: React/Vite compilado e servido por Nginx.

Build manual:

```bash
docker build -t ghflusao-database ./database
docker build -t ghflusao-backend ./backend
docker build --build-arg VITE_API_URL=/api -t ghflusao-frontend ./frontend
```

Deploy com Compose:

```bash
cp .env.deploy.example .env.deploy
docker compose -f docker-compose.prod.yml --env-file .env.deploy up -d --build
```

## Backend

Classes Java:

- `backend/src/main/java/br/edu/ghflusao`

Estrutura:

- `domain/`: entidades JPA.
- `enums/`: enums de dominio.
- `repository/`: Spring Data JPA.
- `service/`: regras de negocio.
- `controller/`: endpoints REST.
- `security/`: JWT e autenticacao.
- `config/`: seguranca, CORS e OpenAPI.
- `exception/`: tratamento global de erros.
- `dto/`: contratos de entrada/saida.

Migrations:

- PostgreSQL atual: `backend/src/main/resources/db/postgres`
- Seed local/demo PostgreSQL: `backend/src/main/resources/db/postgres-demo`

## Stack

Backend:

- Java 21
- Spring Boot 3.3.4
- Spring Web, Validation, Security, Data JPA
- JWT (`jjwt 0.12.5`)
- Flyway 10.15
- PostgreSQL JDBC
- Flyway PostgreSQL
- Hibernate PostgreSQLDialect
- OpenAPI/Swagger
- Actuator

Banco:

- PostgreSQL 16

Frontend:

- React 18
- TypeScript 5
- Vite 5
- React Router DOM 6
- TanStack React Query 5
- Axios
- React Hook Form + Zod
- Zustand
- TailwindCSS + PostCSS

## Validacao

Backend:

```bash
mvn test
```

Frontend:

```bash
npm run build
```

Endpoints basicos:

- `GET /api/actuator/health`
- `POST /api/auth/login`
- `GET /api/dashboard/admin-resumo`
- `GET /api/consultas/relatorio-academico`

## Modelo de Dominio

- `Pessoa` e base para `Aluno` e `Professor`.
- `Curso` possui varias `Disciplina`.
- `Disciplina` possui varias `Turma`.
- `Professor` ministra `Turma`.
- `Aluno` se relaciona com `Turma` via `MatriculaEmTurma`.
- `Turma` possui `Prova`.
- `Prova` possui `ResultadoProva`.
- `ResultadoProva` se liga a `MatriculaEmTurma`.
- `Disciplina` pode ter pre-requisito.
- `Professor` pode coordenar `Curso`.
