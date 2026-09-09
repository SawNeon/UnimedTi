-- Codigos do centro de custo: o do plano de contas e o do Piramide.
--
-- A planilha PRINT mostra que os dois codigos existem e nao sao o mesmo numero.
-- No Hospital o centro de custo e um inteiro (167 ALMOXARIFADO). Na Operadora ele
-- e pontuado (5.09 ATENDIMENTO) e ao lado dele a planilha carrega um segundo
-- numero (219), que e o codigo do Piramide -- o que o Financeiro digita para
-- lancar a nota.
--
-- Por isso o campo deixa de ser inteiro: "5.09" nao cabe em integer, e guardar
-- 509 perderia a informacao de onde fica o ponto.

ALTER TABLE sectors
    MODIFY COLUMN cost_center_code varchar(20) NOT NULL;

ALTER TABLE sectors
    ADD COLUMN pyramid_code varchar(20) NULL AFTER cost_center_code;

-- Onde os dois codigos coincidem (o caso do Hospital), o Piramide ja nasce
-- preenchido: e o mesmo numero, e deixar nulo obrigaria a redigitar 30 setores.
UPDATE sectors SET pyramid_code = cost_center_code WHERE pyramid_code IS NULL;
