-- Indice da consulta mais repetida do sistema.
--
-- O painel de impressoras busca por competencia dezenas de vezes numa carga so:
-- treze meses do grafico, doze do acumulado do ano e mais uma do rateio. A unica
-- chave que existia era (printer_id, competence), e por competencia sozinha ela
-- nao serve -- o MySQL so usa o indice a partir da primeira coluna. Cada uma
-- daquelas buscas varria a tabela inteira.

CREATE INDEX ix_printer_readings_competence
    ON printer_readings (competence);
