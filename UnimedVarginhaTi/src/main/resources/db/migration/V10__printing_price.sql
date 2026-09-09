-- Preco da pagina e condicoes por empresa, com VIGENCIA.
--
-- O valor vale a partir de uma competencia e continua valendo ate alguem definir
-- outro. Mudar o preco em outubro nao toca setembro: setembro resolve para a
-- vigencia anterior. E o que permite corrigir o contrato sem reescrever meses ja
-- fechados -- e sem redigitar o preco todo mes.
--
-- O preco da pagina e um so, contratual. A franquia e o valor fixo sao por CNPJ,
-- porque o contrato negocia limites diferentes para cada um: hoje 1.000 paginas
-- coloridas no Hospital e 2.000 na Operadora, ambas por R$ 911,41.

CREATE TABLE printing_prices (
    id              binary(16)     NOT NULL,
    -- Mes a partir do qual este preco vale.
    valid_from      date           NOT NULL,
    black_page_cost decimal(12,6)  NOT NULL,
    color_page_cost decimal(12,6)  NOT NULL,
    created_at      datetime(6),
    updated_at      datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_printing_prices_valid_from UNIQUE (valid_from)
) ENGINE=InnoDB;

CREATE TABLE printing_enterprise_terms (
    id                    binary(16)    NOT NULL,
    valid_from            date          NOT NULL,
    enterprise_id         binary(16)    NOT NULL,
    -- Ate este numero de paginas coloridas cobra-se o valor fixo da franquia;
    -- acima dele, cobra-se por pagina. Zero desliga a franquia.
    color_franchise_limit integer       NOT NULL DEFAULT 0,
    color_franchise_value decimal(12,2) NOT NULL DEFAULT 0,
    -- Acrescimo fixo mensal, como o Plantao do Hospital.
    fixed_charge          decimal(12,2) NOT NULL DEFAULT 0,
    -- Falso para a empresa que e servico proprio e fica fora do total do
    -- fechamento, como a Ressoar. A planilha deixava essa exclusao implicita na
    -- formula do total; aqui ela e uma decisao declarada.
    included_in_total     bit(1)        NOT NULL DEFAULT b'1',
    created_at            datetime(6),
    updated_at            datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_printing_enterprise_terms UNIQUE (valid_from, enterprise_id)
) ENGINE=InnoDB;

ALTER TABLE printing_enterprise_terms
    ADD CONSTRAINT fk_printing_enterprise_terms_enterprise
    FOREIGN KEY (enterprise_id) REFERENCES enterprises (id);

-- Preco praticado hoje, conforme a planilha. A vigencia antiga faz valer para
-- todo o historico ate que se defina outra.
INSERT INTO printing_prices (id, valid_from, black_page_cost, color_page_cost, created_at)
VALUES (UUID_TO_BIN('33333333-3333-3333-3333-333333333333'), '2020-01-01', 0.083800, 0.910400, NOW(6));
