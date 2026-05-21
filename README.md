# GHFlusão - Sistema Acadêmico

Este repositório contém o sistema acadêmico GHFlusão com backend em Spring Boot + Oracle e frontend em React + TypeScript.
===============================
## 1) Como rodar o programa

### Pré-requisitos

- Docker Desktop (para Oracle local)
- Node.js 20+
- Java 21
- Maven 3.9+ (ou executar Maven via container)

### Banco Oracle local

Suba o container Oracle (exemplo já usado no projeto):

```bash
docker run -d --name ghflusao-oracle -p 1521:1521 gvenzl/oracle-free:23-slim-faststart
```

As credenciais locais padrão do projeto estão em `backend/.env.local`.

### Backend

No diretório `backend`:

```bash
mvn spring-boot:run
```

API sobe em:

- `http://localhost:8080/api`
- Swagger: `http://localhost:8080/api/swagger-ui.html`

### Frontend

No diretório `frontend`:

```bash
npm install
npm run dev
```

Aplicação web:

- `http://localhost:5173`

### Dockerfiles

O projeto possui Dockerfile para os três serviços principais:

- `database/Dockerfile` -> Oracle Free local com usuário `GHFLUSAO`
- `backend/Dockerfile` -> Spring Boot Java 21 com build Maven multi-stage
- `frontend/Dockerfile` -> React/Vite compilado e servido por Nginx

Build das imagens:

```bash
docker build -t ghflusao-database ./database
docker build -t ghflusao-backend ./backend
docker build --build-arg VITE_API_URL=http://localhost:8080/api -t ghflusao-frontend ./frontend
```

Execução manual em rede Docker:

```bash
docker network create ghflusao-net

docker run -d --name ghflusao-oracle --network ghflusao-net -p 1521:1521 \
  -e ORACLE_PASSWORD=oracle \
  -e APP_USER=GHFLUSAO \
  -e APP_USER_PASSWORD=ghflusao123 \
  ghflusao-database

docker run -d --name ghflusao-backend --network ghflusao-net -p 8080:8080 \
  -e ORACLE_JDBC_URL=jdbc:oracle:thin:@//ghflusao-oracle:1521/FREEPDB1 \
  -e ORACLE_USER=GHFLUSAO \
  -e ORACLE_PASSWORD=ghflusao123 \
  -e ORACLE_SCHEMA=GHFLUSAO \
  -e JWT_SECRET=ZGV2bG9jYWxzZWNyZXRibGFua3NwYWNlMzJjaGFyc21pbmFhYWFhYWFhYWFhYWFhYWFhYWE= \
  -e JWT_EXPIRATION=86400000 \
  -e CORS_ORIGINS=http://localhost:5173 \
  -e SWAGGER_ENABLED=true \
  ghflusao-backend

docker run -d --name ghflusao-frontend -p 5173:80 ghflusao-frontend
```

### Build de validação

```bash
# backend
mvn verify

# frontend
npm run build
```

---

## 2) Onde estão as classes Java

As classes Java ficam em:

- `backend/src/main/java/br/edu/ghflusao`

Estrutura principal:

- `domain/` -> entidades JPA (`Pessoa`, `Aluno`, `Professor`, `Curso`, `Disciplina`, `Turma`, `MatriculaEmTurma`, `Prova`, `ResultadoProva`, `UsuarioSistema`)
- `enums/` -> enums de domínio (`Turno`, `Modalidade`, `Situacao`, `Perfil`, `StatusTurma`)
- `repository/` -> repositórios Spring Data JPA
- `service/` -> regras de negócio
- `controller/` -> endpoints REST
- `security/` -> JWT/filter/user details
- `config/` -> configuração de segurança, CORS, OpenAPI
- `exception/` -> tratamento global de erros
- `dto/` -> contratos de entrada/saída

Migrations SQL:

- `backend/src/main/resources/db`

---

## 3) Specs do sistema (stack e tecnologias)

### Backend

- Java 21
- Spring Boot 3.3.4
- Spring Web, Validation, Security, Data JPA
- JWT (`jjwt 0.12.5`)
- Flyway 10.15 (com `flyway-database-oracle`)
- Oracle JDBC `ojdbc11` + UCP
- Hibernate 6 com `OracleDialect`
- OpenAPI/Swagger (`springdoc`)
- Actuator

### Banco de dados

- Oracle Database (Oracle Free / Oracle Cloud ATP)

### Frontend

- React 18 + TypeScript 5
- Vite 5
- React Router DOM 6
- TanStack React Query 5
- Axios
- React Hook Form + Zod
- Zustand
- TailwindCSS + PostCSS

---

## Verificação do diagrama UML enviado (classes e cardinalidades)

Foi feita a checagem entre o diagrama e o código atual (`domain/` + migrations SQL):

### Relacionamentos alinhados ao diagrama

- `Pessoa` <- herança de `Aluno` e `Professor`
- `Professor (1)` -> `Turma (*)` (leciona)
- `Curso (1)` -> `Disciplina (*)`
- `Disciplina (1)` -> `Turma (*)`
- `Aluno (*)` <-> `Turma (*)` via `MatriculaEmTurma`
- `Turma (1)` -> `Prova (*)`
- `Prova (1)` -> `ResultadoProva (*)`
- `MatriculaEmTurma (1)` -> `ResultadoProva (*)`
- `Disciplina` -> `Disciplina` (pré-requisito)
- `Professor (1)` -> `Curso (0..1 por curso)` como coordenador

### Equivalências de modelagem adotadas

- O diagrama mostra uma classe separada `Matricula`; no código atual a matrícula institucional do aluno está em `Aluno.matriculaId` e a matrícula em turma está em `MatriculaEmTurma`.
- O diagrama usa tipos textuais para datas (`String`), enquanto o código usa `LocalDate`/`DATE`, que é tecnicamente mais adequado.

### Observação importante

No diagrama, `Curso` possui `codigo`; no modelo atual de produção, `Curso` não possui esse campo persistido (somente `id`, `nome`, `chTotal`, `prevTerminoAnos`, `limiteConclusao`, `coordenador`).  
Para alinhar 100% também nesse ponto, o próximo passo é incluir `codigo` em `Curso` (entidade + migration SQL).

