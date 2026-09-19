# Registro de validação — 19/09/2026

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
