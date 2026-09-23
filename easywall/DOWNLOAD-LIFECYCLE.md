# Correção de liberação de download — 22/09/2026

Referência consolidada: commits `0e7b436b` e `7deeff42`; [handoff do fork](HANDOFF-BACKEND.md). Este registro é cronológico: os seis testes e resíduos citados inicialmente foram sucedidos pela bateria de nove testes e pela limpeza documentada ao final. Preserve as evidências e limitações de cada etapa.

Escopo autorizado pelo usuário: corrigir o bloqueio de arquivo após interromper download. Mudança no core nativo `agents/meshcore.js`, preservando protocolo, permissões e transporte.

`closeFileDownload` fecha o descritor inclusive quando seu valor é zero, remove a referência e tolera chamadas repetidas. Chamado em stop, substituição do download, EOF, erros de leitura/escrita, encerramento do túnel (antes de retornos antecipados), canal WebRTC e end do canal de arquivos. Start sem caminho válido devolve cancel sem acessar estado inexistente. Não foi alterado o binário do agente.

Validação: `node --check agents/meshcore.js` e `node --test easywall/download-lifecycle.test.cjs`: 6 testes cobrindo o código real extraído do handler, com filesystem controlado. Testes não substituem validação em cada plataforma.

Aplicação no laboratório: conta técnica já possuía AGENTCONSOLE (16). Usado comando nativo uploadagentcore/default para o único agente conhecido de sufixo h1CUzKwZX8M1; sem elevação de privilégios e sem reiniciar servidor ou serviço Windows. O comando recompõe os cores padrão em memória no servidor e solicita atualização do alvo; outros agentes poderão receber a versão padrão corrigida em futuras atualizações/reconexões. Recarregar o core pode encerrar sessões desse alvo. Não foi emitida atualização em lote.

Após a atualização, dois arquivos sintéticos de 65.536 bytes: download completo e download cancelado após 16.380 bytes. Ambos permitiram abertura exclusiva e remoção. Antes, o cancelado recusava essa abertura. Resultado confirma o comportamento corrigido no fluxo real de desconexão usado pelo painel.

Descritores antigos, perdidos pelo core anterior, não são recuperados pela nova função: duas origens antigas de 65 MiB ainda recusaram abertura exclusiva. Há também um controle antigo de 64 KiB. Não reiniciado o agente para liberar esses resíduos; limpeza requer janela de manutenção. Caminhos exatos e resultados no registro interno do produto `docs/RECEBIMENTO-ARQUIVOS.md`. Nova pasta 340ea75c4de349f5 ficou vazia após remoção dos controles. Não confundir atualização do core do laboratório com recompilação do instalador ou homologação 24/7.

## Operações recursivas e ZIP protegido

O core Windows agora anuncia `ew-files-2` e protege as novas operações do Control Room. Antes de excluir, copiar, mover ou compactar diretórios, percorre no máximo 20.000 entradas e 64 níveis e recusa reparse points por `GetFileAttributesW`. A listagem marca essas entradas para a GUI não oferecê-las como arquivos ou pastas normais.

Os módulos `agents/modules_meshcore/easywall-zip-reader.js` e `easywall-zip-writer.js` derivam dos módulos oficiais MeshAgent sob Apache-2.0, com aviso preservado. As adaptações incluem entradas vazias, CRC-32, fechamento de descritores, limites de diretório central e validação completa antes da extração. Travessia, caminhos absolutos, colisões, nomes reservados, criptografia, formatos não suportados e metadados fora dos limites são recusados. ZIP64 não é implementado; lote e arquivo precisam permanecer abaixo de 4 GiB.

Validação no alvo de laboratório: criação, cópia/movimentação recursiva, busca, ZIP, extração, conflito, exclusão, entradas vazias e arquivo malicioso com travessia passaram no fluxo real. O teste automatizado do core passou a cobrir CRC, regras de ZIP e recusa de reparse points, além do ciclo de descritores de download. Um ZIP criado durante uma aplicação intermediária do core permaneceu aberto; versões novas não reproduziram o bloqueio. Após manutenção controlada, o agente reconectou e todos os resíduos sintéticos conhecidos foram removidos.
