-- Baseline do schema do SystemTI.
--
-- Gerado a partir do DDL que o Hibernate espera para as entidades atuais
-- (ver SchemaExportTool em src/test), com os nomes de constraint trocados por
-- nomes legíveis. A partir daqui o schema é versionado: toda alteração de
-- entidade exige uma nova migration V2, V3... e nunca a edição deste arquivo.
--
-- IDs são UUID gravados como binary(16). Para ler no cliente SQL use
-- BIN_TO_UUID(id); para filtrar use UUID_TO_BIN('...').

CREATE TABLE enterprises (
    id         binary(16)   NOT NULL,
    name       varchar(255) NOT NULL,
    locale     varchar(255) NOT NULL,
    created_at datetime(6),
    updated_at datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_enterprises_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE sectors (
    id               binary(16)   NOT NULL,
    name             varchar(255) NOT NULL,
    group_name       varchar(255) NOT NULL,
    cost_center_code integer      NOT NULL,
    enterprise_id    binary(16),
    created_at       datetime(6),
    updated_at       datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_sectors_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE users (
    id        binary(16) NOT NULL,
    name      varchar(255),
    email     varchar(255),
    login     varchar(255),
    password  varchar(255),
    role      enum ('ADMIN','USER'),
    sector_id binary(16),
    PRIMARY KEY (id),
    -- Não vem do mapeamento da entidade: barra dois usuários com o mesmo login,
    -- que quebraria a autenticação. O MySQL aceita múltiplos NULL aqui.
    CONSTRAINT uk_users_login UNIQUE (login)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
    id          binary(16)   NOT NULL,
    token       varchar(255) NOT NULL,
    user_id     binary(16)   NOT NULL,
    expiry_date datetime(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_password_reset_tokens_token UNIQUE (token),
    CONSTRAINT uk_password_reset_tokens_user UNIQUE (user_id)
) ENGINE=InnoDB;

CREATE TABLE products (
    id              binary(16)   NOT NULL,
    name            varchar(255) NOT NULL,
    description     varchar(255),
    current_stock   integer      NOT NULL,
    min_stock_level integer      NOT NULL,
    created_at      datetime(6),
    updated_at      datetime(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE inventory_movements (
    id          binary(16)   NOT NULL,
    product_id  binary(16)   NOT NULL,
    sector_id   binary(16),
    quantity    integer      NOT NULL,
    reason      varchar(255) NOT NULL,
    responsible varchar(255) NOT NULL,
    type        varchar(255) NOT NULL,
    created_at  datetime(6),
    updated_at  datetime(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE assets (
    id          binary(16)   NOT NULL,
    name        varchar(255) NOT NULL,
    asset_tag   varchar(255) NOT NULL,
    description varchar(255),
    status      enum ('AVAILABLE','INACTIVE','UNAVAILABLE') NOT NULL,
    created_at  datetime(6),
    updated_at  datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_assets_asset_tag UNIQUE (asset_tag)
) ENGINE=InnoDB;

CREATE TABLE asset_movements (
    id                   binary(16)   NOT NULL,
    asset_id             binary(16)   NOT NULL,
    responsible_manager  binary(16)   NOT NULL,
    sector_id            binary(16),
    reason               varchar(255) NOT NULL,
    responsible          varchar(255) NOT NULL,
    type                 varchar(255) NOT NULL,
    expected_return_date date,
    actual_return_date   datetime(6),
    created_at           datetime(6),
    updated_at           datetime(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE purchase_orders (
    id                    binary(16) NOT NULL,
    sector_id             binary(16),
    type                  varchar(255),
    description           TEXT,
    status                enum ('CANCELLED','DELIVERED','ORDERED','RECEIVED'),
    number_request        integer,
    request               varchar(500),
    invoice               varchar(500),
    order_date            datetime(6),
    expected_delivery_date date,
    received_date         datetime(6),
    created_at            datetime(6),
    updated_at            datetime(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE contracts (
    id                  binary(16)   NOT NULL,
    enterprise_id       binary(16)   NOT NULL,
    service_type        varchar(255) NOT NULL,
    service_description varchar(255) NOT NULL,
    start_date          date         NOT NULL,
    end_date            date,
    status              enum ('ACTIVE','INACTIVE') NOT NULL,
    created_at          datetime(6),
    updated_at          datetime(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE invoices (
    id          binary(16)     NOT NULL,
    contract_id binary(16)     NOT NULL,
    number      integer        NOT NULL,
    amount      decimal(10,2)  NOT NULL,
    issue_date  date           NOT NULL,
    due_date    date           NOT NULL,
    status      enum ('CANCELLED','DELIVERED','ISSUED') NOT NULL,
    created_at  datetime(6),
    updated_at  datetime(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE apportionments (
    id         binary(16)    NOT NULL,
    invoice_id binary(16)    NOT NULL,
    sector_id  binary(16)    NOT NULL,
    allocation decimal(10,2) NOT NULL,
    created_at datetime(6),
    updated_at datetime(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Chaves estrangeiras (o InnoDB cria o índice de cada FK automaticamente).

ALTER TABLE sectors
    ADD CONSTRAINT fk_sectors_enterprise FOREIGN KEY (enterprise_id) REFERENCES enterprises (id);

ALTER TABLE users
    ADD CONSTRAINT fk_users_sector FOREIGN KEY (sector_id) REFERENCES sectors (id);

ALTER TABLE password_reset_tokens
    ADD CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE inventory_movements
    ADD CONSTRAINT fk_inventory_movements_product FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE inventory_movements
    ADD CONSTRAINT fk_inventory_movements_sector FOREIGN KEY (sector_id) REFERENCES sectors (id);

ALTER TABLE asset_movements
    ADD CONSTRAINT fk_asset_movements_asset FOREIGN KEY (asset_id) REFERENCES assets (id);

ALTER TABLE asset_movements
    ADD CONSTRAINT fk_asset_movements_manager FOREIGN KEY (responsible_manager) REFERENCES users (id);

ALTER TABLE asset_movements
    ADD CONSTRAINT fk_asset_movements_sector FOREIGN KEY (sector_id) REFERENCES sectors (id);

ALTER TABLE purchase_orders
    ADD CONSTRAINT fk_purchase_orders_sector FOREIGN KEY (sector_id) REFERENCES sectors (id);

ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_enterprise FOREIGN KEY (enterprise_id) REFERENCES enterprises (id);

ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_contract FOREIGN KEY (contract_id) REFERENCES contracts (id);

ALTER TABLE apportionments
    ADD CONSTRAINT fk_apportionments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id);

ALTER TABLE apportionments
    ADD CONSTRAINT fk_apportionments_sector FOREIGN KEY (sector_id) REFERENCES sectors (id);
