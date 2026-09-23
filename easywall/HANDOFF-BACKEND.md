# Handoff do fork MeshCentral para o Easywall

Referência: 23/09/2026. Este documento descreve o backend; o contrato de integração do produto está em `docs/INTEGRACAO-EASYWALL.md` e `docs/AGENTE-LLM-INTEGRACAO-EASYWALL.md` no repositório privado do Control Room.

## Repositórios e arquitetura

| Componente | Fonte | Responsabilidade |
|---|---|---|
| Backend | [Easy-Remote-Desktop](https://github.com/audiorobson/Easy-Remote-Desktop), `master`, público | Fork MeshCentral, agentes, transporte e correções do core |
| Produto | [Easywall-Control-Room](https://github.com/audiorobson/Easywall-Control-Room), `main`, privado | UI, gateway, identidade/autorização, auditoria, captura e anotação |
| Cliente Windows | `client-windows` no produto | Bandeja, aplicador de políticas e Overlay Host separados do MeshAgent |
| Easywall principal | Repositório a identificar no destino | Autoridade de usuários, tenants, estações e licenciamento |

Fluxo: Easywall principal → Control Room → `control.ashx`/relays MeshCentral → MeshAgent. O Overlay Host tem canal autenticado próprio `/overlay-agent` no Control Room. Não redesenhar o transporte nem mover credenciais técnicas para o navegador.

Baseline upstream do laboratório: MeshCentral 1.2.5, commit `ed76eba1`, obtido em 19/09/2026. O remote `upstream` aponta para Ylianst/MeshCentral. Versões em 23/09: Control Room 0.11.0; fontes do cliente Windows 0.3.0; piloto EXE existente 0.2.0. Compilar fontes não atualiza esse instalador.

## Alterações que devem acompanhar o fork

| Arquivos | Motivo e contrato |
|---|---|
| `agents/meshcore.js` | `0e7b436b`: fechamento de descritores em cancelamento/fim de túnel; `7deeff42`: recursão e ZIP protegidos |
| `agents/modules_meshcore/easywall-zip-reader.js`, `easywall-zip-writer.js` | Leitura/escrita ZIP com validação de caminhos, CRC e limites; preservar junto com o core |
| `easywall/download-lifecycle.test.cjs`, `DOWNLOAD-LIFECYCLE.md` | Regressões automatizadas e evidência real datada |
| `webserver.js`, `meshcentral-config-schema.json`, `easywall/official-panel.cjs` | Opção `settings.easywallControlRoomUrl`; redireciona entradas da UI antiga, preservando rotas técnicas |
| `easywall/official-panel.test.cjs` | Contrato de redirecionamento sem encaminhar credenciais/query e preservação de rotas técnicas |
| `Start-Easywall.ps1`, `easywall/Start-Lab.ps1`, `Stop-Lab.ps1` | Operação local, identificação dos processos, logs e saúde |
| `easywall/setup.cjs`, `prepare-clients.cjs`, `Enable-LabFirewall.ps1` | Bootstrap e ferramentas do laboratório, com efeitos no ambiente |
| `package.json`, `package-lock.json`, guias Easywall | Dependências fixadas e operação; manter os avisos e licenças existentes |

Core Windows compatível anuncia **`;ew-files-2`**; o provider do produto deriva `safeArchive`. Não remover essa verificação para liberar recursão/ZIP em core antigo. Limites incluem 20 mil entradas, profundidade 64 e ZIP clássico abaixo de 4 GiB, sem ZIP64; consultar implementação e testes antes de alterar.

## Obter e fixar fontes

Em diretório novo, com acesso autorizado ao produto privado:

```powershell
git clone --branch master https://github.com/audiorobson/Easy-Remote-Desktop.git EasywallBackend
Set-Location EasywallBackend
git clone --branch main https://github.com/audiorobson/Easywall-Control-Room.git .easywall/product
git rev-parse HEAD
git -C .easywall/product rev-parse HEAD
git merge-base --is-ancestor 0e7b436b HEAD
git merge-base --is-ancestor 7deeff42 HEAD
npm.cmd ci
npm.cmd ci --prefix .easywall/product
```

Registrar os dois SHAs consumidos no manifesto de integração. Os comandos `merge-base` devem terminar com código zero. O handoff do produto registra o commit publicado do backend que contém este documento. Não misturar históricos: `.easywall` é ignorada pelo Git da raiz.

**Entrega atual por checkout de fontes.** A lista `files` do `package.json` herdado não inclui `easywall/` nem `Start-Easywall.ps1`: `npm pack` sozinho não é um pacote Easywall completo e pode omitir o módulo requerido pelo redirecionamento. Um empacotamento próprio precisa incluir e testar essas dependências. Não substituir pelo pacote npm MeshCentral puro.

## Reutilizar o backend existente — caminho preferido

Preservar configuração, certificados, bancos, IDs de grupos e agentes. Configurar no produto `provider.url` como `wss://HOST:PORTA/control.ashx`, `credentialsFile` com conta técnica e `caFile` com CA confiável conforme `deployment/config.example.json` do produto. Caminhos relativos são resolvidos no diretório de dados. A conta técnica deve ter os direitos necessários; contas dos operadores Easywall não são credenciais upstream.

O Easywall principal implementa juntos `identityProvider` e `accessStore` e liga os hooks de revogação, conforme os testes de autoridade do produto. Não copiar a base local de usuários para simular SSO. Mapear IDs persistentes e negar estações sem mapeamento.

## Instalação nova de laboratório

Windows, Node.js 24 e Git; .NET 10 para compilar o cliente. Em um ambiente novo, `node easywall/setup.cjs <IPv4-do-servidor>` provisiona o backend e `./easywall/Start-Lab.ps1` o inicia. Setup recusa dados existentes; `--resume` só recupera bootstrap anterior à criação do banco. Não executar no backend operacional.

`prepare-clients.cjs` autentica, garante o grupo do laboratório e baixa um agente vinculado; não é teste sem efeitos. O script de firewall altera regras. `.easywall/client` é saída antiga do laboratório e não substitui `client-windows` do produto. Não instalar serviço nem duplicar agentes na máquina de desenvolvimento para validar.

Provisionar o Control Room separadamente pelo contrato de `scripts/initialize.cjs`/`src/provision.cjs` e guia `deployment/README.md`: JSON via stdin, diretório de dados absoluto novo, administrador inicial, provider, CA, portas e permissões dos arquivos. Não passar segredos pela linha de comando nem reutilizar credenciais de exemplo/laboratório.

`./Start-Easywall.ps1` espera a configuração do produto em `.easywall/product/runtime/config.json`; não é orquestrador genérico de `EASYWALL_DATA_DIR` externo. Para diretório externo, usar o mecanismo documentado do produto e adaptar deliberadamente a operação do destino. O script inicia/verifica processos, não instala serviços de boot.

## Rotas e operação

Painel local: `http://127.0.0.1:4070/`; porta 4060 reservada ao Easywall principal neste laboratório. Backend de laboratório usa 4430. `settings.easywallControlRoomUrl` é opcional e não é ativado automaticamente pelo setup. Quando configurado, `/`, `/login`, `/tokenlogin` e `/logout` redirecionam com HTTP 303 sem propagar query/credenciais. Preservar WebSockets, `control.ashx`, relays, certificados e downloads de agentes. Não desligar o backend para esconder a UI antiga.

Loopback é local a cada computador. Publicar o painel exige adaptar e testar origem HTTP/WS, cookies Secure e proxy conforme o handoff privado; não basta trocar a URL. O canal `/overlay-agent` tem autenticação própria de dispositivo. Saúde do backend (`/health.ashx`) e do produto são verificações distintas; resposta saudável não comprova desktop remoto nem overlay físico.

Logs locais: `.easywall/server.log`, `.easywall/server-error.log` e logs no runtime do produto. Configuração, credenciais, certificados privados, bancos e agentes vinculados ficam fora do Git. Preservar avisos de terceiros; não publicar fontes privadas do produto neste fork público.

## Migração, atualização e recuperação

1. Registrar os dois SHAs, configuração, DNS/TLS, IDs e versões efetivas dos cores. Fazer backup protegido e consistente: para banco local, parar em janela de manutenção; banco externo exige procedimento consistente próprio. Incluir certificados e `meshcentral-data`, `meshcentral-files` se usado, e armazenamento do produto (SQLite/WAL com procedimento próprio).
2. Ensaiar restauração isolada preservando identidade. Não rodar dois servidores com a mesma identidade contra o mesmo parque, nem executar bootstrap sobre dados restaurados. Manter caminho de retorno ao serviço original; backup de código não substitui backup de dados.
3. Instalar o checkout fixado, configurar autoridade/provider e testar uma estação dedicada. Troca de DNS/endereço e certificados precisa ser compatível com o vínculo dos agentes.
4. Core no Git não comprova core carregado na estação. Conferir marcador e comportamento. Atualização `uploadagentcore/default` pode interromper sessões e alterar cores padrão usados em futuras reconexões: não aplicar em lote automaticamente. Descritores perdidos por versões antigas podem exigir manutenção do agente.
5. Validar reconexão, permissões, desktop, arquivos e overlay no destino antes de ampliar implantação. O Overlay Host é componente separado, com provisionamento DPAPI na sessão interativa correta; não é incorporado por atualizar apenas o MeshAgent.

Ao atualizar upstream, preservar os patches da tabela, revisar mudanças de protocolo/core e executar regressões. Não prometer compatibilidade automática com todo upstream futuro. Comparar a nova base com os commits fixados e manter rollback testado.

## Validação e critérios de continuidade

```powershell
node --check meshcentral.js
node --check webserver.js
node --check agents/meshcore.js
node --check easywall/official-panel.cjs
node --check easywall/setup.cjs
node --check easywall/prepare-clients.cjs
node --test easywall/download-lifecycle.test.cjs easywall/official-panel.test.cjs
git diff --check
```

Resultados datados em `VALIDACAO.md`, `PAINEL-OFICIAL.md` e `DOWNLOAD-LIFECYCLE.md`. No produto, executar `npm run check` e `npm test` e a matriz do handoff, incluindo revogação/isolamento de tenants, captura, ACK/TTL e desconexão do overlay. Automação local não equivale a homologação física do overlay, distribuição do novo cliente ou operação 24/7.

## Instrução ao próximo agente LLM

Leia este documento e os dois handoffs privados antes de alterar a aplicação principal. Inspecione seus mecanismos reais de autoridade e publicação, fixe os SHAs dos dois repositórios e preserve módulos existentes. Implemente os adaptadores e a configuração de origem/proxy, execute a matriz de aceite e registre evidências. Não reescreva transporte, ZIP ou anotação por desconhecer onde estão. Não execute migração de dados, instalação de serviços, atualização em lote ou publicação de segredos como efeito implícito de integrar a UI. Pendências de homologação são explícitas; não declare distribuição pronta a partir de builds locais.
