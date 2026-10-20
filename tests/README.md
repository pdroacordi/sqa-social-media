# Testes E2E e de API — SQA Social Media

Projeto de testes **caixa-preta** do SQA Social Media, escrito com [Playwright](https://playwright.dev) e TypeScript.

Diferente dos testes da Atividade 2 (JUnit/MockMvc em `/api` e Jest/Testing Library em `/client`), que olham o código por dentro, aqui o sistema é testado **em execução**, de fora:

- **Testes de API**: requisições HTTP reais contra a API rodando em `http://localhost:8080`, validando status e corpo das respostas.
- **Testes E2E**: um navegador Chromium real abre o frontend em `http://localhost:3000` e simula o usuário clicando e digitando.

---

## Sumário

1. [Como rodar](#como-rodar)
2. [Como o Playwright sobe o sistema](#como-o-playwright-sobe-o-sistema)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Arquitetura e padrões](#arquitetura-e-padrões)
5. [Testes de API](#testes-de-api)
6. [Testes E2E](#testes-e2e)
7. [Bugs conhecidos (`test.fail`)](#bugs-conhecidos-testfail)
8. [Decisões e armadilhas encontradas](#decisões-e-armadilhas-encontradas)
9. [Como o projeto foi criado](#como-o-projeto-foi-criado)

---

## Como rodar

### 1. Pré-requisitos

- Node.js 18+ (testado com Node 24)
- Java 17+
- Acesso à internet (o endpoint `/posts` da API busca os posts em `dummyjson.com`)
- **Não** é necessário MySQL: quando o Playwright sobe a API, ela usa um banco H2 em memória

### 2. Instalar (apenas na primeira vez)

```bash
cd client
npm install
cd ../tests
npm install
npx playwright install chromium
```

### 3. Executar

```bash
cd tests
npm test
```

Só isso. O próprio Playwright sobe a API e o frontend, espera os dois responderem, roda os testes e encerra os servidores no final (veja [Como o Playwright sobe o sistema](#como-o-playwright-sobe-o-sistema)).

Se a API e/ou o frontend **já estiverem rodando** nas portas 8080 e 3000 (por exemplo, a API com MySQL que você subiu à mão), o Playwright **reaproveita** o que já está no ar em vez de subir outro.

A primeira execução é mais lenta (o Maven baixa dependências e o Next.js compila as páginas); as seguintes levam menos de um minuto.

### Scripts disponíveis

| Comando               | O que faz                                                          |
| --------------------- | ------------------------------------------------------------------ |
| `npm test`            | Roda todos os testes (API + E2E)                                   |
| `npm run test:api`    | Roda apenas os testes de API                                       |
| `npm run test:e2e`    | Roda apenas os testes E2E (navegador em modo headless)             |
| `npm run test:headed` | Roda os testes E2E com o navegador visível                         |
| `npm run test:ui`     | Abre o modo interativo do Playwright (ótimo para demonstrar)       |
| `npm run report`      | Abre o relatório HTML da última execução                           |
| `npm run typecheck`   | Verifica os tipos do TypeScript sem executar nada                  |

Para rodar só os testes de bugs conhecidos: `npx playwright test --grep @bug`.

### Variáveis de ambiente (opcional)

Por padrão os testes apontam para `http://localhost:8080` (API) e `http://localhost:3000` (frontend). Para mudar, copie `.env.example` para `.env` e ajuste:

```env
API_URL=http://localhost:8080
CLIENT_URL=http://localhost:3000
```

---

## Como o Playwright sobe o sistema

O `playwright.config.ts` usa a opção [`webServer`](https://playwright.dev/docs/test-webserver), que recebe a lista de servidores que precisam estar no ar antes dos testes. As definições ficam na classe `src/config/LocalServers.ts`:

| Servidor | Comando executado | Pasta | Considerado pronto quando |
| -------- | ----------------- | ----- | ------------------------- |
| API | `mvnw spring-boot:run` com banco H2 em memória | `api/` | `GET http://localhost:8080/posts/liked?userId=0` responde |
| Client | `npm run dev -- --port 3000` | `client/` | `GET http://localhost:3000` responde |

O fluxo de uma execução de `npm test`:

1. O Playwright verifica se as URLs acima já respondem. Se sim, **reaproveita** o servidor existente (`reuseExistingServer`). É assim que a esteira de CI funciona: ela sobe a API (com MySQL) e o build de produção do cliente em passos próprios, e o Playwright apenas os reaproveita (veja [Integração Contínua](../README.md#integração-contínua-github-actions)).
2. Se não respondem, executa os comandos acima e fica consultando as URLs até responderem (limite de 3 minutos para a API e 2 para o client).
3. Roda os testes.
4. Encerra os processos que ele mesmo subiu.

Se algum servidor não subir, o Playwright **interrompe antes de executar qualquer teste**, com a mensagem de erro do processo. Isso evita um falso positivo: sem servidor, os testes de bug marcados com `test.fail` "passariam" por falharem pelo motivo errado (conexão recusada em vez do bug).

**Por que H2 e não MySQL?** A API usa MySQL por padrão, o que exigiria um banco instalado e configurado. O `pom.xml` já tem a dependência do H2 (escopo de teste, usada nos testes da Atividade 2). O Maven roda a API com `-Dspring-boot.run.useTestClasspath=true`, que inclui essa dependência, e as propriedades de conexão são passadas por argumento (`--spring.datasource.url=jdbc:h2:mem:e2e`, etc.). **Nenhum arquivo da API é alterado**, e o banco é criado do zero a cada execução.

**Portas e URLs** vêm do `Environment` (arquivo `.env`). Se `API_URL` mudar, a API sobe na nova porta e o client recebe `NEXT_PUBLIC_BASE_URL` apontando para ela.

---

## Estrutura de pastas

```
tests/
├── playwright.config.ts          Configuração do Playwright (projects "api" e "e2e" e webServer)
├── tsconfig.json                 Configuração do TypeScript (usada pelo typecheck)
├── .env.example                  Modelo das variáveis de ambiente
├── src/                          Código de apoio (nenhum teste aqui)
│   ├── config/
│   │   ├── Environment.ts        Lê o .env e expõe as URLs da API e do frontend
│   │   └── LocalServers.ts       Define como subir a API (H2) e o frontend para os testes
│   ├── models/
│   │   ├── User.ts               Tipos Credentials e RegisteredUser
│   │   └── Post.ts               Tipos Post, PostPage, LikeToggle e PostQuery
│   ├── data/
│   │   └── UserFactory.ts        Gera massa de teste (usuário válido, e-mail inválido, senha fraca...)
│   ├── api/
│   │   ├── AuthApi.ts            Cliente dos endpoints /auth/*
│   │   └── PostsApi.ts           Cliente dos endpoints /posts/*
│   ├── assertions/
│   │   └── apiMatchers.ts        Matcher customizado expect(response).toBeApiError(status, mensagem)
│   ├── support/
│   │   └── PendingRequests.ts    Acompanha requisições em andamento para evitar condição de corrida
│   ├── pages/                    Page Objects (representam as telas do frontend)
│   │   ├── BasePage.ts           Classe base: abrir página, esperar URL, mensagens, alerts
│   │   ├── PostListPage.ts       Classe base das telas que listam posts
│   │   ├── FeedPage.ts           Tela "/" (feed)
│   │   ├── LikedPostsPage.ts     Tela "/auth/liked" (posts curtidos)
│   │   ├── SignInPage.ts         Tela "/signin" (login)
│   │   ├── SignUpPage.ts         Tela "/signup" (cadastro)
│   │   └── components/           Pedaços reutilizáveis de tela
│   │       ├── HeaderComponent.ts    Cabeçalho (Entrar, Criar Conta, Posts Curtidos, Sair)
│   │       ├── PostCardComponent.ts  Card de um post (título e botão de curtir)
│   │       └── FormField.ts          Campo de formulário localizado pelo texto do label
│   └── fixtures/                 Injeção de dependências dos testes
│       ├── api.fixture.ts        Fornece authApi, postsApi e registeredUser
│       ├── pages.fixture.ts      Fornece os Page Objects e signedInUser
│       └── index.ts              Ponto único de import: { test, expect }
└── specs/                        Os testes propriamente ditos
    ├── api/
    │   ├── auth.api.spec.ts       Cadastro, login e reset de senha
    │   ├── posts.api.spec.ts      Listagem, curtidas e posts curtidos
    │   └── known-bugs.api.spec.ts Bugs conhecidos da API
    └── e2e/
        ├── signup.e2e.spec.ts     Fluxo de cadastro
        ├── signin.e2e.spec.ts     Fluxo de login e logout
        ├── like.e2e.spec.ts       Fluxo de curtida com e sem autenticação
        └── known-bugs.e2e.spec.ts Bugs conhecidos do frontend
```

A separação entre os dois tipos de teste é feita pelo **nome do arquivo**: o `playwright.config.ts` define dois *projects*. O `api` pega os arquivos `*.api.spec.ts` e não abre navegador. O `e2e` pega os `*.e2e.spec.ts` e usa o Chromium com `baseURL` apontando para o frontend.

---

## Arquitetura e padrões

### Camadas

```
specs (o QUE testar)
   │  usa
   ▼
fixtures (injeção de dependência)
   │  cria
   ▼
pages / api (COMO interagir com o sistema)
   │  usa
   ▼
models / data / config (tipos, massa de teste e configuração)
```

Os specs ficam curtos e legíveis, no formato **Arrange / Act / Assert** (separados por linha em branco). Os specs não sabem *como* encontrar um botão nem *como* montar uma requisição: isso fica nos Page Objects e nos clientes de API.

### Page Object Model

Cada tela do frontend é uma classe. Se um seletor mudar no frontend, só o Page Object muda, não os testes.

- **Herança**: `BasePage` → `PostListPage` → `FeedPage` / `LikedPostsPage`. As telas de lista herdam a lógica de "pegar o post N", e todas as telas herdam o cabeçalho e a navegação.
- **Composição**: as telas *têm* um `HeaderComponent`, os cards são `PostCardComponent` e os campos são `FormField`.
- **Encapsulamento**: os campos de formulário são `private`. O teste chama `signInPage.signIn(credenciais)` e não sabe que existem inputs.

### Clientes de API

`AuthApi` e `PostsApi` recebem um `APIRequestContext` no construtor (injeção de dependência) e expõem um método por endpoint. Eles retornam a resposta crua (`APIResponse`), porque nos testes caixa-preta o status HTTP também é o que se está validando.

### Fixtures (injeção de dependência)

O Playwright permite estender o `test` com *fixtures*: objetos criados automaticamente para cada teste que pede por eles nos parâmetros.

| Fixture          | O que entrega                                                                    |
| ---------------- | -------------------------------------------------------------------------------- |
| `authApi`        | Cliente dos endpoints `/auth/*`                                                  |
| `postsApi`       | Cliente dos endpoints `/posts/*`                                                 |
| `registeredUser` | Um usuário **novo**, já cadastrado via API, com `id`, `email` e `password`       |
| `feedPage` etc.  | Page Objects prontos para uso                                                    |
| `signedInUser`   | Um usuário novo que já fez login pela interface e está no feed                   |

Exemplo: `test("...", async ({ authApi, registeredUser }) => { ... })` já recebe o cliente e um usuário cadastrado, sem nenhum código de preparação dentro do teste.

### Isolamento dos testes

A API não tem endpoint para apagar usuários ou curtidas. Por isso **cada teste cria seu próprio usuário** com e-mail único (`qa.<timestamp>.<uuid>@teste.com`, gerado pela `UserFactory`). Assim os testes não dependem uns dos outros, podem rodar em paralelo e podem ser executados várias vezes contra o mesmo banco.

### Matcher customizado

A API devolve erros sempre no formato `{ "message": "...", "status": 409 }`. Em vez de repetir três `expect` em cada teste, foi criado um matcher:

```ts
await expect(response).toBeApiError(409, "E-mail já está em uso");
```

Ele valida o status HTTP, o `status` do corpo e a `message` de uma vez, e mostra uma mensagem de erro clara quando falha.

### Princípios aplicados

- **SRP (responsabilidade única)**: cada classe faz uma coisa. A `UserFactory` gera dados, a `AuthApi` fala com `/auth`, a `SignInPage` representa a tela de login e o `Environment` lê a configuração.
- **OCP (aberto/fechado)**: para uma tela nova basta estender `BasePage`, e para listar posts basta estender `PostListPage`, sem alterar as classes existentes.
- **DIP (inversão de dependência)**: os testes recebem as dependências prontas via fixtures, e as classes de API recebem o `APIRequestContext` pelo construtor.
- **DRY**: login de preparação, cadastro de usuário, validação de erro e localização de campos estão em um único lugar cada.
- **KISS**: sem frameworks extras. Só Playwright, TypeScript e as APIs nativas do Node (`process.loadEnvFile` em vez de `dotenv`).

---

## Testes de API

Arquivos `specs/api/auth.api.spec.ts` e `specs/api/posts.api.spec.ts`. São **14 testes**, todos passando.

| Endpoint                    | Cenário                                              | Esperado                           |
| --------------------------- | ---------------------------------------------------- | ---------------------------------- |
| `POST /auth/signup`         | Dados válidos                                        | 200 com `id` e `email`             |
| `POST /auth/signup`         | E-mail já cadastrado                                 | 409 "E-mail já está em uso"        |
| `POST /auth/signup`         | E-mail sem `@`                                       | 422 "E-mail inválido"              |
| `POST /auth/signup`         | Senha fraca (`123`)                                  | 422 "Senha inválida"               |
| `POST /auth/signin`         | Credenciais corretas                                 | 200 com `id` e `email`             |
| `POST /auth/signin`         | Senha incorreta (mas em formato válido)              | 401 "Credenciais inválidas"        |
| `POST /auth/signin`         | E-mail não cadastrado                                | 401 "Credenciais inválidas"        |
| `POST /auth/reset-password` | E-mail cadastrado                                    | 200 "Senha redefinida com sucesso (fake)" |
| `POST /auth/reset-password` | E-mail não cadastrado                                | 404 "Usuário não encontrado"       |
| `GET /posts`                | `limit=5&skip=10` sem usuário                        | 5 posts, nenhum curtido            |
| `GET /posts`                | Com `userId` de quem curtiu o post 1                 | Post 1 com `liked: true`           |
| `POST /posts/{id}/like`     | Chamado duas vezes                                   | `liked: true` e depois `liked: false` |
| `GET /posts/liked`          | Usuário que curtiu o post 1                          | `total: 1` e o post 1 na lista     |
| `GET /posts/liked`          | Usuário sem curtidas                                 | `total: 0` e lista vazia           |

---

## Testes E2E

Arquivos `specs/e2e/*.e2e.spec.ts`. São **6 testes**, todos passando.

| Arquivo   | Fluxo                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| signup    | Visitante preenche o cadastro, é levado ao feed e o cabeçalho mostra "Posts Curtidos" e "Sair"                    |
| signup    | Cadastro com e-mail já usado mostra a mensagem de erro vinda da API e permanece em `/signup`                       |
| signin    | Login com senha errada mostra "Credenciais inválidas" e permanece em `/signin`                                    |
| signin    | Login correto leva ao feed autenticado; ao clicar em "Sair", o cabeçalho volta a mostrar "Entrar" e "Criar Conta" |
| like      | Visitante clica em "Curtir" e recebe o alerta "Você precisa estar autenticado para curtir posts!"                 |
| like      | Usuário logado curte o primeiro post, encontra-o em "Posts Curtidos", descurte e a lista fica vazia               |

---

## Bugs conhecidos (`test.fail`)

Os bugs encontrados na Atividade 2 (veja `docs/bugs-encontrados.md`) também aparecem aqui, agora observados de fora do sistema.

Esses testes descrevem o **comportamento correto** e são marcados com `test.fail(...)`, o que diz ao Playwright: *"este teste deve falhar enquanto o bug existir"*. Na prática:

- A suíte continua **verde**: no relatório, eles aparecem com `x` / "expected to fail".
- Se alguém **corrigir o bug**, o teste passa a passar e o Playwright **acusa erro**. Isso avisa que o `test.fail` deve ser removido, e o teste vira um teste de regressão normal.

Todos têm a tag `@bug`, então dá para rodar só eles com `npx playwright test --grep @bug`.

| Arquivo                  | Comportamento esperado                                         | O que acontece hoje                                         |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------- |
| known-bugs.api           | Login com senha errada e fraca retorna 401 "Credenciais inválidas" | Retorna 422 "Senha inválida" (valida força da senha no login) |
| known-bugs.api           | Cadastro sem o campo `password` retorna 422                    | Retorna 500 (`NullPointerException` em `isPasswordValid`)   |
| known-bugs.api           | Cadastro com e-mail sem domínio (`usuario@`) é recusado        | É aceito (a validação só procura um `@`)                    |
| known-bugs.api           | A resposta do login não expõe a senha                          | O campo `password` volta em texto puro                      |
| known-bugs.e2e           | Após recarregar a página (F5) o usuário continua logado        | Volta a ser visitante (chave do localStorage divergente)    |
| known-bugs.e2e           | Senha com exatamente 8 caracteres é aceita no cadastro         | É recusada (o frontend usa `<= 8` em vez de `< 8`)          |

---

## Decisões e armadilhas encontradas

**Navegação sempre pela interface.** Por causa do bug da sessão (o login é salvo na chave `user` do localStorage, mas lido da chave `sqa_social_user`), qualquer `page.goto()` depois do login desloga o usuário. Por isso os fluxos autenticados navegam clicando nos botões do cabeçalho, como um usuário real faria, e não abrindo URLs diretamente.

**Senha usada nos testes: `Senha@1234`.** O frontend e o backend têm regras diferentes de senha. O frontend exige mais de 8 caracteres e não aceita `!`, e o backend só aceita `@$!%*?&` como caractere especial. A senha escolhida satisfaz os dois.

**Localização dos campos pelo label.** Os inputs do frontend não têm `id`, `name` nem `data-testid`, e os `<label>` não estão ligados aos inputs (`htmlFor`). Por isso `getByLabel` não funciona. O `FormField` usa o seletor `label:text-is("Senha") + input`, que pega o input logo depois do label com aquele texto **exato** e diferencia "Senha" de "Confirmar Senha".

**Botões com o mesmo nome.** "Entrar" e "Criar Conta" aparecem no cabeçalho e no formulário. O `HeaderComponent` procura só dentro de `<header>`, e os Page Objects de formulário procuram só dentro de `<form>`.

**Condição de corrida na tela de posts curtidos.** Em modo de desenvolvimento, o React (Strict Mode) executa o `useEffect` duas vezes, então a tela `/auth/liked` faz **duas** requisições `GET /posts/liked`. Se o teste descurtir o post entre a primeira e a segunda resposta, a segunda chega com dados antigos e o post "volta" para a lista. O teste falhava de forma intermitente por isso. A solução foi o `LikedPostsPage.waitUntilLoaded()`, que usa a classe `PendingRequests` para esperar todas as requisições da listagem terminarem antes de interagir.

**Esperar a API antes de seguir.** O botão de curtir atualiza a tela antes da resposta da API (atualização otimista). O `PostCardComponent.toggleLike()` espera a resposta de `POST /posts/{id}/like` antes de devolver o controle, para o próximo passo não navegar antes da curtida ser gravada.

**Alertas nativos.** O alerta "Você precisa estar autenticado..." é um `window.alert`. O `BasePage.acceptDialogDuring()` registra um ouvinte de diálogo, executa a ação, aceita o alerta e devolve a mensagem para o teste validar.

**Dependência externa.** `GET /posts` e `GET /posts/liked` buscam dados em `dummyjson.com`. Sem internet, esses testes e os fluxos E2E que mostram o feed falham. `POST /posts/{id}/like` e os endpoints de `/auth` não dependem dela.

---

## Como o projeto foi criado

1. Pasta `/tests` criada na raiz do repositório, ao lado de `/api` e `/client`.
2. Projeto inicializado com o instalador oficial do Playwright:
   ```bash
   npm init playwright@latest -- --quiet --lang=ts --browser=chromium
   ```
   O instalador gerou `package.json`, `playwright.config.ts`, `.gitignore` e um teste de exemplo, e baixou o Chromium.
3. O teste de exemplo foi removido e o `playwright.config.ts` foi reescrito com os dois projects (`api` e `e2e`).
4. `typescript` foi adicionado como dependência de desenvolvimento para o script `typecheck`.
5. Toda a estrutura de `src/` e `specs/` foi escrita do zero.
6. O `webServer` foi configurado para que `npm test` suba a API e o frontend automaticamente.
