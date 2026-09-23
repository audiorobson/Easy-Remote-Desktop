# Easy Remote Desktop — Easywall

Decisão técnica e plano do laboratório, 19/09/2026.

Registro histórico da seleção inicial. Para arquitetura e continuidade atuais, consultar [HANDOFF-BACKEND.md](HANDOFF-BACKEND.md) e o repositório separado do Control Room.

## Seleção

| Candidato | Licença consultada | Adequação | Decisão |
| --- | --- | --- | --- |
| [MeshCentral](https://github.com/Ylianst/MeshCentral) | Apache-2.0 | Servidor Node.js, agentes, navegador, desktop/teclado/mouse, monitores, arquivos, terminal e WoL | Escolhido: menor esforço para o laboratório e licença permissiva |
| [RustDesk](https://github.com/rustdesk/rustdesk) | AGPL-3.0 | Excelente base de desktop remoto com cliente nativo | Não priorizado: copyleft demanda outra estratégia para produto fechado |
| [Remotely](https://github.com/immense/Remotely) | GPL-3.0 | Controle e scripts; exige stack .NET | Não priorizado: licença e implantação menos adequadas ao objetivo imediato |
| [Guacamole](https://github.com/apache/guacamole-client) | Apache-2.0 | Gateway web RDP/VNC/SSH | Alternativa para acesso sem agente próprio, com mais integração e serviços nos destinos |

Fontes: READMEs e licenças dos repositórios; [recursos MeshCentral](https://meshcentral.com/docs/managementfeatures.pdf); [configuração Guacamole](https://guacamole.apache.org/doc/gug/configuring-guacamole.html).
Seleção e comparação representam avaliação técnica; capacidades completas ainda precisam de homologação nos PCs do laboratório.

## Arquitetura inicial

Navegador do operador → HTTPS/WebSocket → servidor Easywall → conexão de saída dos agentes Windows 11.
Este PC hospeda o servidor. Dois PCs Windows 11 serão clientes. Não é necessário habilitar RDP nos clientes.
O modo WANonly do MeshCentral fixa o endereço de conexão dos agentes; não publica o servidor na Internet. A escuta fica no IPv4 local configurado.

Base: MeshCentral 1.2.5, commit upstream ed76eba1 (master obtido em 19/09/2026, não checkout imutável da release).
Remote origin: fork audiorobson/Easy-Remote-Desktop. Remote upstream: Ylianst/MeshCentral.
Manter histórico upstream e customizações concentradas em easywall/; evitar reescrever o protocolo/agente neste primeiro ciclo.

## Fases e critérios de aceite

1. Laboratório: servidor, conta administrativa, HTTPS, grupo e instalador. Aceite: dois agentes online; controlar mouse/teclado; alternar e visualizar todos os monitores; duas sessões de máquinas distintas; transferir arquivo e comparar SHA-256; reconectar após reinício; testar UAC; WoL com outro agente ligado na mesma LAN.
2. Identidade Easywall: logo/cores/tradução, nome do serviço e instalador, assinatura de código, instalador reproduzível e desinstalação. Preservar notices/licenças de terceiros.
3. Operações confiáveis: catálogo explícito de aplicações e scripts aprovados, hashes/assinaturas, permissões por operador e grupo, logs de execução, retorno e rollback. O terminal existente não substitui um catálogo de confiança.
4. Piloto comercial: DNS e TLS confiáveis, serviço com recuperação automática, MFA obrigatório, papéis mínimos, auditoria e retenção, backup/restauração ensaiados, política de atualização, teste de isolamento de clientes e revisão de dependências/SBOM.
5. Produto: definir implantação por cliente ou multitenancy, contratos/suporte/licenciamento, telemetria consentida, atualizações assinadas e teste de desempenho/carga. Só então considerar acesso externo.

## Licenças e comercialização

Apache-2.0 permite uso comercial e derivações sob condições de preservação de licença, avisos e identificação das alterações. Não transforma o código upstream em propriedade exclusiva da Easywall. Revisar também MeshAgent e cada dependência distribuída antes de empacotar. Este fork GitHub é público: futuras partes proprietárias devem ficar em repositório privado separado, com separação e licenças definidas.

## Alterações desta implementação

- Bootstrap com senha aleatória, cadastro público desativado, escuta em IPv4 específico e atualização automática desativada.
- Scripts de início/parada, firewall restrito à sub-rede e preparação do agente com TLS validado pela CA local.
- Express 4.22.3 e node-windows 1.0.0-beta.8, sincronizados com o carregador de dependências de meshcentral.js; dependências transitivas corrigidas no lockfile. Auditoria npm retornou zero vulnerabilidades conhecidas em 19/09/2026.
- Segredos, bancos, certificados, instaladores vinculados ao servidor e logs excluídos do Git.

## Limites atuais

Servidor iniciado como processo em segundo plano, sem serviço de inicialização automática. Os clientes precisam da instalação administrativa do agente; estar na rede não concede controle automaticamente. Certificado local não é confiável por padrão nos navegadores. WoL depende de BIOS/UEFI, NIC, energia e caminho de broadcast; não garante ligar qualquer PC. Sem clientes cadastrados, os testes de desktop/transferência/monitores/WoL permanecem pendentes.
