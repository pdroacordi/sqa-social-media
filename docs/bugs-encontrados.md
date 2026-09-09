# Como os bugs foram encontrados

Este documento registra o processo de identificação dos problemas do SQA Social Media antes da escrita dos testes automatizados. Para cada bug, descreve-se o que foi testado, o comportamento esperado, o comportamento observado e o trecho de código responsável pela divergência.

O processo combinou duas etapas. A primeira foi uma rodada de testes manuais, com o backend e o frontend rodando localmente, usando o navegador e, em alguns pontos, o Insomnia para requisições diretas à API, sem passar pelas telas. A segunda etapa foi a leitura do código fonte, necessária porque parte dos problemas não é visível apenas pelo uso da aplicação, exigindo inspeção da lógica de validação e das camadas de serviço e controller.

## Cadastro e login (backend)

### Login rejeitando senha incorreta com o motivo errado

Um usuário de teste foi cadastrado (`teste@teste.com`, senha `Teste123!`) e, em uma sessão nova, foi feita uma tentativa de login com uma senha incorreta e fraca (`123`), com o objetivo de verificar a mensagem de erro exibida. O comportamento esperado, segundo o enunciado, era a mensagem "Credenciais inválidas". A mensagem exibida foi "Senha inválida".

À primeira vista a mensagem parecia coerente, já que a senha digitada realmente não era válida. No entanto, essa mesma mensagem também é usada no fluxo de cadastro para indicar que uma senha não cumpre os critérios de força (maiúscula, número, caractere especial), o que não deveria se aplicar ao login. A inspeção do `AuthController.signin` confirmou a causa: o método chama `service.isPasswordValid(...)` antes de comparar a senha informada com a senha armazenada. Como consequência, uma senha fraca em uma tentativa de login retorna "Senha inválida" em vez de "Credenciais inválidas", revelando ainda para o cliente qual é a política de senha do sistema.

O comportamento foi documentado no teste `dadoSenhaCorretaMasForaDoPadraoDeForca_quandoSignin_entaoDeveriaRetornar401`, em `AuthControllerMockMvcTest`.

### Cadastro aceitando e-mails sem domínio

Durante o teste do formulário de cadastro, foram inseridos valores de e-mail propositalmente inválidos no campo correspondente: `a@`, `@@@`, `usuario@`. A maioria foi rejeitada, mas `usuario@` (sem domínio e sem extensão) foi aceito sem qualquer mensagem de erro. A inspeção do método `isEmailValid`, em `UserService`, mostrou que a validação se limita a verificar a presença do caractere `@` na string, sem exigir domínio ou extensão.

O comportamento foi documentado no teste `dadoEmailSemDominio_quandoValidarEmail_entaoDeveriaRetornarFalse`, que não exige contexto Spring por testar um método isolado.

### Requisição sem o campo de senha retornando erro 500

Ao testar o endpoint de cadastro diretamente pelo Insomnia, uma requisição foi enviada com o campo `email` preenchido e o campo `password` ausente do corpo da requisição. O esperado era um erro 422 com a mensagem "Senha inválida". O retorno foi um erro 500 sem mensagem específica.

A causa está em `UserService.isPasswordValid`, que chama `Pattern.matches(regex, password)` sem verificar previamente se `password` é nulo. Isso resulta em uma `NullPointerException` não tratada em nenhuma camada acima. O comportamento foi documentado no teste `dadoSenhaNula_quandoValidarSenha_entaoDeveriaRetornarFalseSemLancarExcecao`, que reproduz a exceção chamando o método diretamente, sem necessidade de requisição HTTP.

### Caractere especial não reconhecido como especial

No formulário de cadastro, foi testada a senha `Senha123#`, presumindo que o caractere `#` atenderia ao requisito de caractere especial. O sistema retornou erro informando a ausência de um caractere especial. A regex usada em `isPasswordValid`, no backend, aceita apenas o conjunto `@$!%*?&`; qualquer outro símbolo, incluindo `#` e `.`, não é reconhecido como especial.

O comportamento foi documentado no teste `dadoSenhaComCaractereEspecialForaDoConjuntoPermitido_quandoValidarSenha_entaoDeveriaAceitar`.

### Paginação negativa causando erro 500

Ao inspecionar a requisição feita pela tela de posts curtidos na aba de rede do navegador, os parâmetros de paginação (`skip` e `limit`) foram alterados manualmente, testando o valor `skip=-1`. O retorno foi um erro 500.

A causa está em `PostService.getLikedPosts`, que calcula os índices de paginação e os passa diretamente para `List.subList(fromIndex, toIndex)` sem validar se `skip` é negativo. Um índice negativo em `subList` lança `IndexOutOfBoundsException`, que é capturada de forma genérica e reaparece como erro 500. O comportamento foi reproduzido isolando o serviço com Mockito, sem necessidade da API externa de posts, no teste `dadoSkipNegativo_quandoGetLikedPosts_entaoDeveriaTratarComoInvalidoEmVezDeLancarExcecao`.

### Validação de parâmetro obrigatório que nunca é executada

Este problema foi identificado na leitura do código de `PostController`, durante a preparação dos testes de MockMvc. O método `getLikedPosts` contém a verificação `if (userId == null)`, retornando um erro 400 com corpo customizado. Entretanto, o parâmetro está declarado como `@RequestParam Long userId`, sem `required = false`, o que faz o Spring rejeitar a requisição antes mesmo de o corpo do método ser executado, caso o parâmetro esteja ausente. A rejeição do Spring usa seu próprio formato de erro, diferente do padrão `ErrorResponse` adotado no restante da API. Na prática, a verificação manual nunca é alcançada da forma como foi escrita.

O comportamento foi confirmado enviando uma requisição a `/posts/liked` sem o parâmetro `userId` e inspecionando o formato da resposta, resultando no teste `dadoUserIdAusente_quandoGetLikedPosts_entaoDeveriaRetornarErroConsistenteDoDominio`.

### Senha retornada em texto puro na resposta da API

Ao inspecionar a resposta das requisições de cadastro e login pelo Insomnia, verificou-se que o corpo de resposta de `/auth/signup` e `/auth/signin` inclui o objeto `User` completo, com o campo `password` em texto puro, exatamente como enviado pelo cliente. Não foi escrito um teste automatizado para esse ponto, por não haver um requisito explícito de hashing de senha no enunciado, mas o achado é registrado por representar um risco relevante em um cenário de auditoria de segurança.

### Ausência de restrição de unicidade para e-mail

A leitura da classe `User` mostrou que a coluna de e-mail não possui nenhuma restrição de unicidade, nem via anotação `@Column` nem via constraint de banco. A verificação de e-mail duplicado existe apenas na camada de serviço, por meio de uma consulta prévia antes da gravação. Isso abre uma janela para condição de corrida: duas requisições de cadastro com o mesmo e-mail, enviadas em um intervalo curto, podem passar pela verificação antes que qualquer uma delas tenha sido persistida, permitindo que ambas sejam salvas.

O comportamento foi verificado com um teste de `@DataJpaTest` que tenta persistir dois usuários com o mesmo e-mail: `dadoEmailDuplicado_quandoSalvarDoisUsuarios_entaoDeveriaFalharPorConstraintUnica`.

### Redefinição de senha que não altera nenhuma senha

Ao testar o fluxo de "esqueci minha senha", a mensagem de sucesso foi exibida normalmente. Uma nova tentativa de login com a senha antiga revelou que nenhuma senha nova havia sido definida, pois o formulário de redefinição solicita apenas o e-mail, sem nenhum campo para uma nova senha. A leitura de `AuthController.resetPassword` confirmou que o endpoint apenas valida a existência do e-mail e retorna uma mensagem de sucesso identificada no próprio código como "(fake)", ou seja, uma simulação assumida.

Esse ponto não é tratado como bug, já que o código já sinaliza sua natureza de stub, mas foi documentado explicitamente no teste `dadoEmailCadastrado_quandoResetPassword_entaoRetorna200ComMensagemFake`, para que futuras manutenções não presumam que se trata de uma funcionalidade completa.

## Frontend

### Sessão perdida ao recarregar a página

Após efetuar login na aplicação e navegar por algumas telas, um recarregamento da página (F5) resultou no retorno ao estado deslogado, com o cabeçalho voltando a exibir "Entrar" e "Criar conta".

A inspeção da aba Application do DevTools mostrou uma chave `user` armazenada no localStorage, contendo os dados do usuário autenticado. No entanto, a função responsável por ler esses dados de volta, `getUser`, em `lib/localStorage.ts`, procura por uma chave diferente, `sqa_social_user`. A função de gravação e a função de leitura usam nomes de chave distintos, de modo que a leitura nunca encontra o valor salvo e a sessão nunca sobrevive a um recarregamento de página. O padrão sugere um erro introduzido em uma refatoração da constante de chave, sem atualização de todos os pontos de uso.

O comportamento foi documentado em um teste de integração que utiliza o `AuthProvider` real, sem mocks para a camada de sessão: login é executado, o provider é desmontado e remontado para simular o recarregamento, e o estado de autenticação é verificado. Teste: `dadoLoginRealizado_quandoSimularReloadDaPagina_entaoDeveriaContinuarAutenticado`, em `auth-persistence.test.tsx`.

### Senha de 8 caracteres rejeitada apesar do requisito informado

O enunciado, assim como a lista de requisitos exibida abaixo do campo de senha na tela de cadastro, especifica "mínimo de 8 caracteres". Uma senha com exatamente 8 caracteres, cumprindo os demais critérios (maiúscula, minúscula, número, especial), como `Abcdef1@`, foi rejeitada pelo formulário.

A causa está em `utils/password.ts`, onde a condição `password.length <= 8` rejeita qualquer senha com 8 caracteres ou menos. O mínimo efetivo é, portanto, 9 caracteres, não 8 como informado na interface. O erro corresponde ao uso de um operador de comparação incorreto (`<=` em vez de `<`). Documentado no teste "dado senha com exatamente 8 caracteres..." em `password.test.ts`.

### Divergência entre a validação de senha e a mensagem de erro correspondente

Durante a análise do arquivo de validação de senha, identificou-se a existência de duas funções relacionadas: `isPasswordValid`, que retorna um booleano, e `getPasswordValidationMessage`, responsável pelo texto exibido na interface. As duas funções verificam a presença de caractere especial usando regexes distintas: uma delas inclui o ponto final (`.`) no conjunto de caracteres especiais aceitos, a outra não. Como resultado, uma senha cujo único caractere especial é um ponto final é considerada válida por uma função (mensagem de erro vazia) e inválida pela outra, gerando um comportamento inconsistente na validação do formulário. A causa provável é a atualização de uma das duas regexes sem a correspondente atualização da segunda.

### Caractere `!` não reconhecido como especial no frontend

Esse achado surgiu durante a escrita do teste de "senha forte", que originalmente usava `Password123!` como exemplo, mesmo valor utilizado nos testes do backend. O teste falhou de forma inesperada. A inspeção da regex confirmou que o caractere `!` não está presente em nenhum dos dois conjuntos de caracteres especiais usados no frontend, apesar de ser um dos símbolos mais comumente associados a "caractere especial" por qualquer usuário. O backend, por outro lado, aceita `!` sem problema (conjunto `@$!%*?&`). A divergência entre frontend e backend quanto ao que constitui uma senha "forte o suficiente" depende, portanto, de qual das duas validações é aplicada primeiro.

### Mensagem de sucesso da redefinição de senha divergente do requisito

O enunciado especifica um toast de sucesso com a mensagem exata "E-mail enviado com sucesso". Na implementação, a mensagem exibida é "Email enviado com sucesso para alterar a senha! Redirecionando...", apresentada em uma caixa fixa na tela, no mesmo padrão visual das mensagens de erro, e não como um toast. A funcionalidade em si funciona (o fluxo simulado de envio ocorre normalmente), mas o texto e o formato não correspondem ao especificado no requisito. Esse achado foi documentado em um teste que verifica o texto exato exigido, evidenciando a diferença ao falhar.

### Comportamento inconsistente do botão de curtir entre telas

A comparação do comportamento do botão de curtir na home com o mesmo botão na tela de posts curtidos revelou uma inconsistência. Na home, um clique em curtir por um usuário não autenticado exibe um alerta nativo do navegador informando a necessidade de autenticação. Na tela de posts curtidos, embora o acesso já seja restrito a usuários autenticados por meio de um redirecionamento prévio, a função responsável pelo clique não exibe nenhum alerta caso o usuário não esteja disponível, apenas interrompe a execução silenciosamente. O impacto prático é reduzido pela proteção de rota já existente, mas o achado evidencia três implementações levemente diferentes para a mesma ação (curtir/descurtir) em pontos distintos do código, o que representa risco de inconsistência em manutenções futuras que alterem uma das telas sem replicar a mudança nas demais.

## Nota sobre o ambiente de teste

Antes da execução dos testes de frontend, foi identificado que o projeto possuía as bibliotecas de teste instaladas (Jest, Testing Library), mas não possuía `setupFilesAfterEnv` configurado em `jest.config.ts`, de modo que os matchers como `toBeInTheDocument()` não estavam disponíveis. Após essa correção, foi identificado um segundo problema: o alias `@/`, usado na maior parte dos imports do projeto, estava mapeado apenas para o TypeScript e para o Next.js, não para o Jest, que não conseguia resolver caminhos como `@/contexts/AuthContext`. Nenhum dos dois pontos é um defeito da aplicação, mas ambos precisaram ser corrigidos antes que qualquer teste pudesse ser executado.
