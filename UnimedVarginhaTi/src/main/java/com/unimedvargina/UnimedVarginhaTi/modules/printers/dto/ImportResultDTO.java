package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import java.util.List;

/**
 * Resultado da importacao do relatorio do PrintWay.
 *
 * <p>O que NAO entrou importa tanto quanto o que entrou: serie desconhecida
 * significa impressora fora do cadastro, e impressora sem leitura significa mes
 * incompleto. Na planilha essas duas coisas passavam despercebidas.
 */
public record ImportResultDTO(
        int linhasLidas,
        int atualizadas,
        /** Series do arquivo que nao existem no cadastro. */
        List<String> seriesDesconhecidas,
        /** Impressoras ativas que o arquivo nao trouxe -- provavelmente manuais. */
        List<String> semLeituraNoArquivo,
        /** Leituras cujo contador final ficou menor que o inicial. */
        List<String> inconsistentes
) {
}
