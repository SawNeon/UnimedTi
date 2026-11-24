-- Modulo de impressoras: cadastro, rateio percentual e leitura mensal.
--
-- Substitui a planilha "ContagemPaginasPrintec", onde cada mes era uma aba
-- copiada da anterior. O consumo e a diferenca entre o contador do inicio e o do
-- fim do periodo, exatamente como la.
--
-- Tres coisas que a planilha nao conseguia garantir e o schema garante:
--   1. o percentual do rateio de uma impressora somar 100 (validado no service);
--   2. uma leitura por impressora por competencia (unique abaixo);
--   3. a origem de cada numero -- PrintWay ou digitado -- ficar registrada.

CREATE TABLE printers (
    id            binary(16)   NOT NULL,
    serial_number varchar(80)  NOT NULL,
    asset_tag     varchar(40),
    model         varchar(120),
    ip_address    varchar(45),
    enterprise_id binary(16)   NOT NULL,
    -- Falso para as impressoras que o PrintWay nao le e alguem digita todo mes.
    -- Na planilha isto era a coluna PRINTWAY, com OK ou PEDENTE.
    auto_read     bit(1)       NOT NULL DEFAULT b'1',
    -- Impressora reserva: circula entre setores, e o rateio dela costuma ser
    -- definido so quando ha uso no mes.
    backup        bit(1)       NOT NULL DEFAULT b'0',
    active        bit(1)       NOT NULL DEFAULT b'1',
    created_at    datetime(6),
    updated_at    datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_printers_serial UNIQUE (serial_number)
) ENGINE=InnoDB;

-- Rateio PADRAO da impressora entre setores, em percentual. Uma impressora
-- compartilhada por dois setores divide o custo conforme o combinado, e nao meio a
-- meio por suposicao. Sem linhas aqui, a impressora fica sem rateio definido -- o
-- caso da reserva antes de ser usada.
--
-- Este e o padrao, nao o que foi cobrado: o rateio aplicado em cada mes fica em
-- printer_reading_shares. Mudar o padrao vale dos proximos fechamentos em diante e
-- nunca reescreve um mes ja fechado.
CREATE TABLE printer_sector_shares (
    id         binary(16)    NOT NULL,
    printer_id binary(16)    NOT NULL,
    sector_id  binary(16)    NOT NULL,
    percentage decimal(7,4)  NOT NULL,
    created_at datetime(6),
    updated_at datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_printer_sector_shares UNIQUE (printer_id, sector_id)
) ENGINE=InnoDB;

-- Leitura do contador em uma competencia. O inicial vem do fechamento anterior;
-- o final e importado do PrintWay ou digitado.
CREATE TABLE printer_readings (
    id            binary(16) NOT NULL,
    printer_id    binary(16) NOT NULL,
    competence    date       NOT NULL,
    black_start   integer    NOT NULL DEFAULT 0,
    black_end     integer    NOT NULL DEFAULT 0,
    color_start   integer    NOT NULL DEFAULT 0,
    color_end     integer    NOT NULL DEFAULT 0,
    -- A3 tem o mesmo preco da A4 e entra no total da respectiva cor. Fica em
    -- coluna propria para o volume nao desaparecer dentro da soma.
    a3_black      integer    NOT NULL DEFAULT 0,
    a3_color      integer    NOT NULL DEFAULT 0,
    source        enum ('PRINTWAY','MANUAL') NOT NULL,
    -- Verdadeiro quando alguem ajustou a mao um numero que veio do PrintWay.
    -- Guardar isso preserva a origem em vez de apagar de onde o dado veio.
    corrected     bit(1)     NOT NULL DEFAULT b'0',
    notes         varchar(255),
    created_at    datetime(6),
    updated_at    datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_printer_readings_printer_competence UNIQUE (printer_id, competence)
) ENGINE=InnoDB;

-- Rateio EFETIVAMENTE aplicado naquele mes.
--
-- O rateio tende a ser o mesmo todo mes, mas pode mudar -- abrir um setor novo,
-- por exemplo. Guardar a divisao junto da leitura e o que permite alterar o mes
-- corrente sem reescrever o que ja foi cobrado nos meses anteriores.
--
-- Nasce como copia do padrao da impressora quando a leitura e criada.
CREATE TABLE printer_reading_shares (
    id         binary(16)   NOT NULL,
    reading_id binary(16)   NOT NULL,
    sector_id  binary(16)   NOT NULL,
    percentage decimal(7,4) NOT NULL,
    created_at datetime(6),
    updated_at datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_printer_reading_shares UNIQUE (reading_id, sector_id)
) ENGINE=InnoDB;

ALTER TABLE printers
    ADD CONSTRAINT fk_printers_enterprise FOREIGN KEY (enterprise_id) REFERENCES enterprises (id);

ALTER TABLE printer_reading_shares
    ADD CONSTRAINT fk_printer_reading_shares_reading FOREIGN KEY (reading_id) REFERENCES printer_readings (id);

ALTER TABLE printer_reading_shares
    ADD CONSTRAINT fk_printer_reading_shares_sector FOREIGN KEY (sector_id) REFERENCES sectors (id);

ALTER TABLE printer_sector_shares
    ADD CONSTRAINT fk_printer_sector_shares_printer FOREIGN KEY (printer_id) REFERENCES printers (id);

ALTER TABLE printer_sector_shares
    ADD CONSTRAINT fk_printer_sector_shares_sector FOREIGN KEY (sector_id) REFERENCES sectors (id);

ALTER TABLE printer_readings
    ADD CONSTRAINT fk_printer_readings_printer FOREIGN KEY (printer_id) REFERENCES printers (id);
