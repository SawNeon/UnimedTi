-- Rateio PADRAO do contrato, em percentual.
--
-- O rateio efetivamente cobrado ja e por mes: cada nota tem os seus
-- apportionments, e alterar um mes nao mexe nos outros. O que faltava era o
-- padrao.
--
-- Sem ele, o rateio so era sugerido a partir da SEGUNDA nota, porque a sugestao
-- copiava o mes anterior -- na primeira nota de um contrato nao havia de onde
-- copiar, e alguem montava a divisao inteira a mao.
--
-- Mesmo desenho do modulo de impressoras: o padrao vale dos proximos lancamentos
-- em diante e nunca reescreve uma nota ja emitida.

CREATE TABLE contract_sector_shares (
    id          binary(16)   NOT NULL,
    contract_id binary(16)   NOT NULL,
    sector_id   binary(16)   NOT NULL,
    percentage  decimal(7,4) NOT NULL,
    created_at  datetime(6),
    updated_at  datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_contract_sector_shares UNIQUE (contract_id, sector_id)
) ENGINE=InnoDB;

ALTER TABLE contract_sector_shares
    ADD CONSTRAINT fk_contract_sector_shares_contract FOREIGN KEY (contract_id) REFERENCES contracts (id);

ALTER TABLE contract_sector_shares
    ADD CONSTRAINT fk_contract_sector_shares_sector FOREIGN KEY (sector_id) REFERENCES sectors (id);
