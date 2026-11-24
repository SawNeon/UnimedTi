-- Marca se a contagem do mes ja foi informada.
--
-- Antes isso era inferido da contagem estar zerada, o que confunde duas coisas
-- diferentes: impressora que ninguem preencheu e impressora que nao imprimiu
-- nada no mes. Fechar o mes com uma delas esquecida e justamente o erro que a
-- planilha nao pegava, entao o sinal precisa ser explicito.
--
-- Passa a verdadeiro quando a leitura vem do import do PrintWay ou quando alguem
-- lanca o numero a mao.

ALTER TABLE printer_readings ADD COLUMN informed bit(1) NOT NULL DEFAULT b'0';

-- O que ja existe e anterior a esta coluna: se tem contagem, foi informado.
UPDATE printer_readings SET informed = b'1' WHERE black_end > 0 OR color_end > 0;
