# Correção de liberação de download — 22/09/2026

Escopo autorizado pelo usuário: corrigir o bloqueio de arquivo após interromper download. Mudança no core nativo `agents/meshcore.js`, preservando protocolo, permissões e transporte.

`closeFileDownload` fecha o descritor inclusive quando seu valor é zero, remove a referência e tolera chamadas repetidas. Chamado em stop, substituição do download, EOF, erros de leitura/escrita, encerramento do túnel (antes de retornos antecipados), canal WebRTC e end do canal de arquivos. Start sem caminho válido devolve cancel sem acessar estado inexistente. Não foi alterado o binário do agente.

Validação: `node --check agents/meshcore.js` e `node --test easywall/download-lifecycle.test.cjs`: 6 testes cobrindo o código real extraído do handler, com filesystem controlado. Testes não substituem validação em cada plataforma.

Aplicação no laboratório: conta técnica já possuía AGENTCONSOLE (16). Usado comando nativo uploadagentcore/default para o único agente conhecido de sufixo h1CUzKwZX8M1; sem elevação de privilégios e sem reiniciar servidor ou serviço Windows. O comando recompõe os cores padrão em memória no servidor e solicita atualização do alvo; outros agentes poderão receber a versão padrão corrigida em futuras atualizações/reconexões. Recarregar o core pode encerrar sessões desse alvo. Não foi emitida atualização em lote.

Após a atualização, dois arquivos sintéticos de 65.536 bytes: download completo e download cancelado após 16.380 bytes. Ambos permitiram abertura exclusiva e remoção. Antes, o cancelado recusava essa abertura. Resultado confirma o comportamento corrigido no fluxo real de desconexão usado pelo painel.

Descritores antigos, perdidos pelo core anterior, não são recuperados pela nova função: duas origens antigas de 65 MiB ainda recusaram abertura exclusiva. Há também um controle antigo de 64 KiB. Não reiniciado o agente para liberar esses resíduos; limpeza requer janela de manutenção. Caminhos exatos e resultados no registro interno do produto `docs/RECEBIMENTO-ARQUIVOS.md`. Nova pasta 340ea75c4de349f5 ficou vazia após remoção dos controles. Não confundir atualização do core do laboratório com recompilação do instalador ou homologação 24/7.
