# Registro de validação

## Consolidação do fork — 23/09/2026

- `node --test easywall/download-lifecycle.test.cjs easywall/official-panel.test.cjs`: **11 testes passaram**, nove de core/arquivos e dois de redirecionamento.
- Sintaxe Node verificada em `meshcentral.js`, `webserver.js`, `agents/meshcore.js`, `official-panel.cjs`, `setup.cjs` e `prepare-clients.cjs`.
- Schema JSON válido; parser PowerShell sem erros em `Start-Easywall.ps1`, `Start-Lab.ps1` e `Stop-Lab.ps1`; `git diff --check` passou.
- Consolidação documental em [HANDOFF-BACKEND.md](HANDOFF-BACKEND.md), com limites de empacotamento, versões, migração e instruções de integração.
- Nesta conferência não foram executados bootstrap, preparação de agentes, alteração de firewall, reinício de backend ou comandos remotos. Evidências físicas anteriores têm suas próprias datas; estes testes não homologam instalação/overlay em estação nem operação 24/7.

## Registro histórico — 19/09/2026

Executado no servidor Windows do laboratório com Node.js 24.19.0.

| Verificação | Resultado |
| --- | --- |
| Sintaxe meshcentral.js, setup.cjs e prepare-clients.cjs | Passou |
| npm audit após atualização de dependências | 0 vulnerabilidades conhecidas |
| HTTPS usando a CA local, sem desativar validação TLS no teste | HTTP 200; título Easy Remote Desktop presente |
| Login administrativo via WebSocket | Passou |
| Grupo Easywall - Laboratorio | Criado e consultado |
| Agente Windows x64 vinculado ao grupo | Baixado, 3.489.680 bytes, cabeçalho PE MZ verificado |
| Regra Easywall-Lab-4430 | Criada com elevação Windows e confirmada habilitada; IPv4 do servidor e sub-rede local |
| Exclusão de segredos, banco e instalador do Git | Confirmada por git check-ignore |
| Clientes cadastrados | 0 no momento da verificação |
| Desktop, monitores, transferência, UAC e WoL ponta a ponta | Pendente de instalação nos dois clientes |
| Verificação visual no navegador integrado | Não concluída: navegador permaneceu em página de erro de conexão; teste HTTPS/API passou posteriormente |

Este registro comprova o servidor e a preparação dos clientes, não homologação comercial nem controle remoto dos dois Windows 11.
