# Painel oficial — Easywall Control Room

Decisão de 21/09/2026: operação e desenvolvimento passam pelo **Easywall Control Room**.

- Acesso neste servidor: http://127.0.0.1:4070/
- Código: `K:\Easy Remote Desktop\.easywall\product`
- Repositório independente: https://github.com/audiorobson/Easywall-Control-Room (branch `main`).
- Referência em 23/09/2026: Control Room 0.11.0; fontes do cliente Windows 0.3.0; instalador piloto existente 0.2.0. Consulte o [handoff do backend](HANDOFF-BACKEND.md). A validação 0.8.0 abaixo é histórica.

## Iniciar

Na raiz `K:\Easy Remote Desktop`, executar `./Start-Easywall.ps1`. O comando verifica os processos existentes, inicia o backend e o produto quando necessário e valida a saúde do painel. Não instala serviço de boot automático.

O produto continua escutando somente em loopback. Abrir esse endereço no próprio servidor; acesso por outro computador exigirá configuração própria de publicação.

## Interface antiga desativada

Esse comportamento depende de `settings.easywallControlRoomUrl` configurado. O bootstrap `setup.cjs` não ativa essa opção automaticamente em instalações novas.

MeshCentral em `192.168.1.101:4430` permanece como backend dos agentes e do Control Room. Seus caminhos `/`, `/login`, `/tokenlogin` e `/logout`, incluindo POST, redirecionam para o painel oficial com HTTP 303, sem encaminhar parâmetros ou credenciais. Isso também impede reabrir a interface antiga por uma sessão de navegador já autenticada.

O redirecionamento local usa `settings.easywallControlRoomUrl` em `meshcentral-data/config.json`, implementado em `easywall/official-panel.cjs` e registrado em `webserver.js`. Não é um bloqueio dos protocolos/APIs do MeshCentral: `control.ashx`, relays, download de agentes e certificados permanecem necessários.

O destino 127.0.0.1 é adequado ao uso local atual. Em outro PC ele aponta para aquele próprio PC; não representa publicação do Control Room na LAN.

## Manutenção

- UI/API: `.easywall/product/ui` e `.easywall/product/src`.
- Validação do produto: `npm run check --prefix .easywall/product` e `npm test --prefix .easywall/product`.
- Logs do painel: `.easywall/product/runtime/server.log` e `error.log`.
- Logs do backend: `.easywall/server.log` e `server-error.log`.
- Reiniciar só o painel: scripts `Stop-Dev.ps1` e `Start-Dev.ps1` dentro de `.easywall/product/scripts`.
- Reiniciar o backend interrompe temporariamente as conexões; os agentes reconectam.
- Recuperação técnica da UI antiga: remover `settings.easywallControlRoomUrl` da configuração local e reiniciar o backend. Usar apenas em manutenção deliberada.

Não confundir o repositório Git da raiz (`master`, infraestrutura MeshCentral) com o repositório do produto (`main`). O diretório `.easywall` é ignorado pelo Git da raiz; isso não significa ausência do produto.

## Validação em 21/09/2026

- Dois testes automatizados do redirecionamento passaram (`node --test easywall/official-panel.test.cjs`), cobrindo login antigo, POST, sessão anterior, parâmetros não encaminhados e preservação de rotas técnicas.
- Requisições reais GET/POST em `/`, `/login`, `/LOGIN/`, `/tokenlogin` e `/logout`: HTTP 303 para o Control Room, com certificado validado pela CA local.
- Control Room: endpoint de saúde respondeu `running`, versão 0.8.0.
- Autenticação real por WebSocket e inventário: três agentes cadastrados, um online no momento da consulta. Não foram executados comandos remotos nos clientes.
- `Start-Easywall.ps1` iniciou o backend e reconheceu o produto existente; nova execução reconheceu ambos sem criar processos duplicados.
