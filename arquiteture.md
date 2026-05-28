# Arquitetura do Projeto

## Visao geral

O projeto e um sistema de controle academico para administracao de alunos, cursos, disciplinas, professores, turmas, matriculas, provas, lancamento de notas, consultas avancadas, relatorios e indicadores de dashboard.

O desenvolvimento considerado neste documento cobre o periodo de marco de 2026 ate 20 de maio de 2026.

## Stacks utilizadas

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- TanStack React Query
- Axios
- React Hook Form
- Zod
- Zustand

### Backend

- Java 21
- Spring Boot 3.3.4
- Spring Web MVC
- Spring Data JPA
- Hibernate ORM
- Spring Security
- JWT com JJWT
- Bean Validation
- Spring Boot Actuator
- Springdoc OpenAPI / Swagger
- Maven
- Lombok

### Banco de dados

- PostgreSQL 16 como banco operacional atual
- PostgreSQL JDBC
- Flyway PostgreSQL para versionamento de schema e migrations
- PostgreSQL 16 como unico banco operacional

### Execucao e infraestrutura local

- Docker para execucao dos servicos principais
- Backend PostgreSQL local exposto em `http://localhost:8081/api`
- Frontend exposto em `http://localhost:5173`
- Banco PostgreSQL exposto em `localhost:5432`

## Arquitetura do projeto

O sistema segue uma arquitetura em camadas, separando interface, API, regras de negocio, persistencia e banco de dados.

### Camada de apresentacao

O frontend e uma SPA em React com TypeScript. As telas sao organizadas por perfil e por modulo funcional, como administracao, aluno e professor.

As chamadas HTTP ficam isoladas em arquivos da pasta `src/api`, enquanto os tipos compartilhados ficam em `src/types`. O estado de servidor e cache de requisicoes sao controlados pelo React Query, reduzindo chamadas repetidas e mantendo as telas sincronizadas apos operacoes de criacao, edicao e exclusao.

### Camada de API

O backend expoe endpoints REST usando Spring Web MVC. Os controllers recebem as requisicoes, validam acesso por perfil e delegam as regras para os services.

As respostas usam DTOs para evitar expor diretamente as entidades JPA e para manter contratos mais previsiveis para o frontend.

### Camada de negocio

As regras principais ficam nos services. Essa camada concentra validacoes academicas, regras de matricula, alocacao automatica, fluxo de provas, lancamento de notas, auditoria e consultas consolidadas.

Exemplos de regras tratadas nessa camada:

- Elegibilidade de matricula por aluno, curso, disciplina, vagas, status da turma e pre-requisitos.
- Alocacao automatica de materias de acordo com disponibilidade e curso do aluno.
- Geracao e consulta de provas por identificador.
- Lancamento de notas e historico/auditoria de alteracoes.
- Montagem de dados para dashboard, relatorios e consulta master-detail.

### Camada de persistencia

A persistencia usa Spring Data JPA com repositories especificos por entidade. Consultas mais simples usam metodos derivados do JPA, enquanto relatorios, filtros e consultas de relacionamento usam queries dedicadas.

Foram aplicadas estrategias como DTOs de resposta e `EntityGraph` em pontos sensiveis para reduzir problemas de carregamento tardio e evitar respostas pesadas ou circulares.

### Banco de dados

O banco operacional atual e PostgreSQL 16, com schema versionado via Flyway. As migrations PostgreSQL ficam em `backend/src/main/resources/db/postgres`. O seed local de demonstracao fica separado em `backend/src/main/resources/db/postgres-demo`, ativado apenas por profile de laboratorio. A trilha Oracle foi removida da aplicacao.

Por padrao, o backend usa `PostgreSQLDialect`, driver `org.postgresql.Driver` e Flyway em `classpath:db/postgres`. Para laboratorio com 10 registros por entidade principal, usa-se tambem o profile `postgres-demo`.

O modelo de dados gira em torno de entidades academicas como:

- Aluno
- Professor
- Curso
- Disciplina
- Turma
- Matricula em turma
- Prova
- Resultado de prova
- Auditoria de resultado
- Usuario do sistema

## Modulos principais

- Autenticacao e autorizacao por perfil.
- Cadastro e manutencao de alunos.
- Cadastro e manutencao de professores.
- Cadastro e manutencao de cursos.
- Cadastro e manutencao de disciplinas.
- Cadastro e manutencao de turmas.
- Matriculas com workflow, elegibilidade e alocacao automatica.
- Provas com criacao, importacao, historico e lancamento por identificador.
- Lancamento de notas com validacao e auditoria.
- Dashboard administrativo com indicadores e graficos.
- Consulta avancada com filtros e exploracao master-detail.
- Relatorios academicos.

## Seguranca

A seguranca usa Spring Security com JWT. O backend valida o token nas requisicoes protegidas e aplica permissoes por perfil usando configuracao de rotas e anotacoes de autorizacao.

Os perfis considerados no sistema incluem administracao, secretaria, coordenacao, professor, aluno e diretoria, com acesso separado conforme a responsabilidade de cada modulo.

## Tempo de desenvolvimento

O tempo considerado para o projeto foi de 3 de marco de 2026 até 20 de maio de 2026.

Nesse periodo, o sistema passou por estruturacao de backend, frontend, banco de dados, regras academicas, fluxos de matricula, provas, notas, dashboard, relatorios e melhorias de experiencia de uso.
