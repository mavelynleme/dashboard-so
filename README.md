# Dashboard SO - Nuvem e Sistemas Operacionais

Aplicacao Node.js + Express para monitoramento de informacoes do Sistema Operacional, criada para a atividade **Projeto - Nuvem e Sistemas Operacionais**. O painel usa identidade visual escura com fundo preto, cards dark e detalhes em rosa.

## Links do projeto

- **Aplicação no Render:** https://dashboard-so-hyrk.onrender.com/
- **Aplicação no Railway:** https://dashboard-so-production.up.railway.app/

## Objetivo

Apresentar, em uma interface web simples e responsiva, dados reais do ambiente onde a aplicacao esta executando: maquina local ou Render/cloud.

## Tecnologias utilizadas

- Node.js
- Express
- CORS
- Modulos nativos: `os`, `fs`, `path` e `process`
- HTML, CSS e JavaScript puro

## Como instalar

```bash
npm install
```

## Como executar localmente

```bash
npm start
```

Depois acesse:

```text
http://localhost:3000
```

## Deploy no Render

Configuracao sugerida:

- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Node
- Port: definida automaticamente pelo Render usando `process.env.PORT`

A aplicacao escuta em `process.env.PORT || 3000`, portanto funciona localmente e no Render sem URL local hardcoded.

## Rotas disponiveis

- `GET /` - dashboard visual completo
- `GET /api/system` - informacoes do sistema em JSON
- `GET /health` - health check simples em JSON

## Informacoes exibidas

- Resumo executivo: uso de RAM, uso medio aproximado de CPU, uptime, quantidade de arquivos, IP principal e status da maquina
- Sistema: hostname, tipo do SO, release/kernel, plataforma, arquitetura, endianness e versao do Node.js
- Usuario/processo: usuario atual, diretorio home, temporario, shell, UID e GID quando disponiveis
- RAM: memoria total, usada, livre, memoria do processo Node.js e barra visual
- CPU: nucleos, modelo, load average, uso aproximado por nucleo e barras visuais
- Rede: IP principal, interfaces, enderecos IPv4/IPv6 e tipo interno/externo
- Arquivos: lista de arquivos relevantes do projeto, tipo e tamanho
- Tempo: uptime formatado, timezone UTC e timestamp ISO
- Aplicacao: PID, diretorio atual, caminho do executavel Node.js e memoria do processo
- Ambiente: local ou Render/cloud, `PORT`, `NODE_ENV`, indicio de AWS/cloud e mensagem de status

## Conceitos de Sistemas Operacionais demonstrados

- Gerenciamento de memoria
- Monitoramento de CPU
- Processos e PID
- Usuarios do sistema
- Sistema de arquivos
- Interfaces de rede
- Uptime e tempo do sistema
- Diferencas entre execucao local e em nuvem

## Simulacao avancada de SO

O dashboard inclui uma simulacao simples no navegador para demonstrar:

- Alocacao de memoria
- Liberacao de memoria
- Criacao de processo simulado
- Encerramento de processo simulado
- Fila de processos
- Blocos de memoria livres e ocupados

A simulacao e frontend-only para manter o projeto simples, estavel e facil de explicar em apresentacao.

## Espaco para screenshot local

Insira aqui uma captura de tela da execucao local:

```text
[Screenshot local]
```

## Espaco para screenshot no Render

Insira aqui uma captura de tela da aplicacao publicada no Render:

```text
[Screenshot Render]
```

## Comparacao: execucao local vs Render/cloud

Na execucao local, os dados refletem o computador do desenvolvedor: hostname, usuario, diretorios, memoria e interfaces da maquina local.

No Render/cloud, os dados refletem o container/servidor disponibilizado pela plataforma. Alguns campos podem ser diferentes ou limitados por seguranca, como shell, UID/GID, hostname temporario, IP interno e variaveis de ambiente.

## Comparacao: Render vs Railway

Render e Railway sao plataformas PaaS semelhantes para publicar aplicacoes web. Ambas podem executar projetos Node.js com build e start command. O Render e bastante direto para projetos academicos por detectar o uso de `process.env.PORT` e oferecer deploy a partir de repositorio Git. O Railway tambem e simples, mas costuma organizar recursos por ambientes e servicos com uma experiencia mais voltada a projetos compostos por multiplos servicos.

## Conclusao

O projeto demonstra como uma aplicacao Node.js pode consultar informacoes do Sistema Operacional com modulos nativos e apresentar esses dados em um dashboard web. A mesma base funciona localmente e na nuvem, permitindo comparar os ambientes e relacionar os resultados com conceitos de Sistemas Operacionais.
