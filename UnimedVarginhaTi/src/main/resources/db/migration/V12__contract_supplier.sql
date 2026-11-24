-- Empresa fornecedora do contrato.
--
-- A tabela `enterprises` guarda os CNPJs da Unimed -- quem PAGA a conta, e a quem
-- pertencem os centros de custo, as impressoras e os estoques. O fornecedor e o
-- outro lado: quem EMITE a nota. Sao papeis diferentes, e junta-los numa tabela so
-- faria a Printec aparecer na lista de empresas de um centro de custo.

CREATE TABLE suppliers (
    id          binary(16)   NOT NULL PRIMARY KEY,
    name        varchar(160) NOT NULL,
    -- Sem mascara e sem validacao de digito: o cadastro serve para conferir a nota,
    -- e recusar um CNPJ mal digitado impediria de cadastrar antes de conferir.
    document    varchar(20)  NULL,
    notes       varchar(255) NULL,
    active      bit(1)       NOT NULL DEFAULT b'1',
    created_at  datetime(6)  NULL,
    updated_at  datetime(6)  NULL,
    CONSTRAINT uk_suppliers_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nulo porque contrato antigo ainda nao tem fornecedor informado. A tela pede,
-- mas o banco nao pode recusar o historico que ja esta la.
ALTER TABLE contracts
    ADD COLUMN supplier_id binary(16) NULL AFTER enterprise_id,
    ADD CONSTRAINT fk_contracts_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id);
