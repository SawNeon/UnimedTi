-- Unidade operacional: o "lado" responsavel pelo dado.
--
-- O setor de TI opera em duas equipes separadas por distancia: Operadora (matriz,
-- Getulio Vargas e seccionais) e Hospital (hospital, APS e servicos proprios). A
-- divisao segue geografia, nao CNPJ -- a APS pertence a operadora mas quem a
-- atende e a equipe do hospital. Por isso a unidade e uma dimensao propria, e nao
-- um derivado de enterprises (CNPJ) nem de sectors (local de consumo).
--
-- Os UUID do seed sao fixos de proposito: o codigo e as proximas migrations
-- precisam de um identificador estavel para as duas unidades.

CREATE TABLE operational_units (
    id         binary(16)   NOT NULL,
    name       varchar(255) NOT NULL,
    slug       varchar(255) NOT NULL,
    created_at datetime(6),
    updated_at datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_operational_units_name UNIQUE (name),
    CONSTRAINT uk_operational_units_slug UNIQUE (slug)
) ENGINE=InnoDB;

INSERT INTO operational_units (id, name, slug, created_at) VALUES
    (UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 'Operadora', 'operadora', NOW(6)),
    (UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), 'Hospital',  'hospital',  NOW(6));

-- Saldo por unidade. O catalogo de produtos continua unico: "Mouse USB" e um
-- cadastro so, com saldo e ponto de pedido proprios em cada estoque.
CREATE TABLE product_stock_balances (
    id              binary(16) NOT NULL,
    product_id      binary(16) NOT NULL,
    unit_id         binary(16) NOT NULL,
    current_stock   integer    NOT NULL,
    min_stock_level integer    NOT NULL,
    created_at      datetime(6),
    updated_at      datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_product_stock_balances_product_unit UNIQUE (product_id, unit_id)
) ENGINE=InnoDB;

-- Backfill: o saldo que existia em products vira saldo da Operadora, e cada
-- produto ganha uma linha zerada no Hospital. Sem isso, um banco que ja tivesse
-- produtos perderia o estoque ao dropar as colunas abaixo.
INSERT INTO product_stock_balances (id, product_id, unit_id, current_stock, min_stock_level, created_at)
SELECT UUID_TO_BIN(UUID()), p.id, UUID_TO_BIN('11111111-1111-1111-1111-111111111111'),
       p.current_stock, p.min_stock_level, NOW(6)
FROM products p;

INSERT INTO product_stock_balances (id, product_id, unit_id, current_stock, min_stock_level, created_at)
SELECT UUID_TO_BIN(UUID()), p.id, UUID_TO_BIN('22222222-2222-2222-2222-222222222222'),
       0, p.min_stock_level, NOW(6)
FROM products p;

-- O saldo passa a viver so no balance. Manter o total tambem em products criaria
-- duas verdades para o mesmo numero.
ALTER TABLE products DROP COLUMN current_stock;
ALTER TABLE products DROP COLUMN min_stock_level;

-- Toda movimentacao passa a dizer de qual estoque saiu ou entrou. As linhas que ja
-- existiam sao atribuidas a Operadora, que era o unico estoque ate aqui.
ALTER TABLE inventory_movements ADD COLUMN unit_id binary(16);
UPDATE inventory_movements
   SET unit_id = UUID_TO_BIN('11111111-1111-1111-1111-111111111111')
 WHERE unit_id IS NULL;
ALTER TABLE inventory_movements MODIFY COLUMN unit_id binary(16) NOT NULL;

-- As duas pernas de uma transferencia entre estoques compartilham este valor,
-- o que permite reconstruir o par saida/entrada sem uma tabela a parte.
ALTER TABLE inventory_movements ADD COLUMN transfer_group_id binary(16);

ALTER TABLE product_stock_balances
    ADD CONSTRAINT fk_product_stock_balances_product FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE product_stock_balances
    ADD CONSTRAINT fk_product_stock_balances_unit FOREIGN KEY (unit_id) REFERENCES operational_units (id);

ALTER TABLE inventory_movements
    ADD CONSTRAINT fk_inventory_movements_unit FOREIGN KEY (unit_id) REFERENCES operational_units (id);
