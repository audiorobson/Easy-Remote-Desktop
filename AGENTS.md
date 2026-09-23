# Painel oficial do projeto

O produto oficial é **Easywall Control Room**, em `.easywall/product`, repositório Git independente `audiorobson/Easywall-Control-Room`, branch `main`.

- Desenvolver UI e funcionalidades do produto nessa pasta. Consultar seu README e VALIDACAO.md.
- Iniciar o projeto com `./Start-Easywall.ps1`, que inicia/verifica o backend e o painel. URL oficial local: `http://127.0.0.1:4070/`.
- A raiz é o fork MeshCentral, backend de agentes e transporte, não o painel de trabalho. Não confundir seus commits/versões com os do produto.
- `.easywall` é ignorada pelo Git da raiz; buscas comuns com rg não mostram o produto. Inspecionar explicitamente `.easywall/product` e seu histórico Git.
- O acesso web antigo em 4430 é redirecionado pelo módulo `easywall/official-panel.cjs`, ativado por `settings.easywallControlRoomUrl`. Preservar WebSockets, certificados, agentes e credenciais técnicas.
- Configurações/credenciais/bancos em `meshcentral-data`, `.easywall` e `product/runtime` são locais. Não publicar segredos.
- Para alterações, conferir o status Git dos dois repositórios. Não desligar o backend para esconder o painel antigo.
- Direção de produto: cobrir as principais funções do MeshCentral no Control Room e então ampliar funções proprietárias Easywall. Consultar `.easywall/product/docs/COMPARATIVO-MESHCENTRAL-CONTROL-ROOM.md`; o comparativo é planejamento, não autorização para ativar todas as operações remotas.
- Cliente Windows: projeto em `.easywall/product/client-windows`, no Git do produto. Fontes 0.3.0 incluem bandeja, aplicador de políticas e Overlay Host, separados do agente nativo. Instalador piloto existente 0.2.0 não foi regenerado com overlay. Consultar README, plano 24x7 e limitações de homologação. `.easywall/client` contém o agente antigo de laboratório.
- Continuidade do fork: ler `easywall/HANDOFF-BACKEND.md`. Preservar correções `0e7b436b` e `7deeff42`, incluindo módulos ZIP e capacidade `ew-files-2`; não substituir o fork por MeshCentral upstream/npm sem portar e validar as alterações.
- Preparação de distribuição: `.easywall/product/deployment/README.md`; diagnóstico de licença/confidencialidade em `.easywall/product/docs/DISTRIBUICAO-INTERNA.md`. Manter notas de engenharia fora da GUI e fora da lista de distribuição.
- Em 21/09/2026 o usuário retomou explicitamente o instalador autônomo do cliente e escolheu o servidor atual de laboratório. Geração do piloto NSIS/EXE autorizada. Não confundir compilação com implantação/homologação; não instalar serviço na máquina de desenvolvimento para validar o pacote. Consultar client-windows/docs/INSTALADOR-PILOTO.md para limitações e teste em estação dedicada.
