# Easy Remote Desktop / Easywall — backend

## Estado consolidado em 23/09/2026

Comece pelo [handoff do backend e do fork](HANDOFF-BACKEND.md): origem, customizações, reprodução, migração, atualização e instruções para o próximo agente LLM.

Este repositório público (`master`) contém o backend MeshCentral. O Control Room tem repositório privado separado (`main`), em `.easywall/product`, ignorado neste Git. Versões de referência: produto **0.11.0**, fontes do cliente Windows **0.3.0**, instalador piloto existente **0.2.0**, que não foi regenerado com o Overlay Host.

O fluxo abaixo é histórico do bootstrap do laboratório: não reproduz sozinho o produto. Para uma instalação nova é necessário obter também o repositório do Control Room e provisionar seus dados conforme o handoff. Em ambiente existente, preserve dados e certificados; não execute setup novamente.

`.easywall/client` contém o agente antigo vinculado ao laboratório. O cliente atual está em `.easywall/product/client-windows`; consulte seu README e `docs/INSTALADOR-PILOTO.md` antes de distribuir. Não instale um segundo agente sobre uma estação já vinculada para testar o pacote.

`prepare-clients.cjs` cria/garante o grupo e baixa um agente vinculado; não é uma verificação somente de leitura. O script de firewall também altera o ambiente. Execute-os apenas no provisionamento deliberado.

## Guia original do laboratório

**Entrada oficial: http://127.0.0.1:4070/ — Easywall Control Room.** Inicie com `./Start-Easywall.ps1` na raiz. Código do produto: `.easywall/product`. Consulte [PAINEL-OFICIAL.md](PAINEL-OFICIAL.md). As instruções de laboratório abaixo tratam do backend; sua interface antiga foi desativada por redirecionamento.

Base funcional: MeshCentral. Consulte [a comparação e o plano](PLANO.md).

## Usar este laboratório

1. Abra http://127.0.0.1:4070/ no servidor e use sua conta do Control Room. `.easywall/ACESSO-LOCAL.txt` contém credenciais técnicas do backend, não o acesso ao painel oficial.
2. Execute `easywall/Enable-LabFirewall.ps1` em PowerShell **como Administrador** no servidor caso a regra ainda não exista. Ela permite somente a sub-rede local.
3. Copie `.easywall/client/Easywall-Windows-x64.exe` para cada um dos dois clientes Windows 11 x64. Execute como Administrador e escolha **Install**. Para Windows ARM64 gere o agente correspondente pelo painel.
4. No painel, abra o grupo **Easywall - Laboratorio**, selecione o cliente e use **Desktop**, **Files** ou **Terminal**. O grupo notifica o usuário sobre essas sessões.
5. Em Desktop, use o seletor de monitores. Abra outra sessão/aba para acompanhar o segundo PC. Teste o comando Wake-up com NIC/BIOS configuradas e outro agente online na LAN.

O instalador contém o vínculo ao servidor/grupo. Distribua somente aos PCs autorizados; não publique no GitHub. Preserve o IPv4 do servidor por reserva DHCP antes de depender dele diariamente. O navegador pode apresentar aviso de certificado local; avalie o certificado no seu navegador. Para uso contínuo, adote DNS/TLS confiáveis.

## Reproduzir em um servidor novo

Requisitos: Windows, Node.js 24 LTS e Git. Na raiz do clone:

```powershell
npm ci
node easywall/setup.cjs <IPv4-do-servidor>
.\easywall\Start-Lab.ps1
node easywall/prepare-clients.cjs
```

A primeira inicialização gera certificados e assina binários; pode levar alguns minutos. Execute a preparação de clientes quando o log indicar `HTTPS server running`. O setup recusa sobrescrever configuração existente. `--resume` é somente para recuperar bootstrap interrompido antes de existir banco de dados.

```powershell
.\easywall\Stop-Lab.ps1
.\easywall\Start-Lab.ps1
```

Logs: `.easywall/server.log` e `.easywall/server-error.log`. Não há serviço de boot instalado nesta etapa. Mantenha o servidor ligado e sem suspensão.

## Verificação

`node easywall/prepare-clients.cjs` valida o endpoint de saúde HTTPS do backend com a CA deste servidor, autentica por WebSocket, garante o grupo do laboratório, baixa e verifica o cabeçalho PE do agente x64 e informa a quantidade de dispositivos cadastrados. Não comprova uma sessão remota ponta a ponta.

`npm audit` verifica as dependências. Faça backup protegido de `meshcentral-data/` com o servidor parado, incluindo os certificados; a perda dessas chaves afeta a reconexão dos agentes. Nunca versione esse diretório.

Alterações Easywall estão documentadas em PLANO.md. A licença Apache-2.0 do upstream permanece em vigor.
