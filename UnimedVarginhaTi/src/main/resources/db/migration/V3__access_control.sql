-- Controle de acesso por modulo e unidade.
--
-- Ate aqui o SecurityConfig usava anyRequest().authenticated(): dos 30 endpoints,
-- 3 eram publicos, 1 exigia ADMIN e os outros 26 aceitavam qualquer usuario
-- logado. Na pratica um usuario comum podia apagar produto, criar contrato e ler
-- qualquer anexo.
--
-- A permissao tem duas dimensoes, porque "opera o Estoque" nao basta: precisa ser
-- "opera o Estoque DO HOSPITAL". Por isso modulo x unidade x nivel.
--
-- A permissao mora no perfil, nao no usuario: mudar o que a equipe do hospital
-- pode fazer e uma edicao so, e nao um ajuste repetido em cada pessoa.

CREATE TABLE access_profiles (
    id          binary(16)   NOT NULL,
    name        varchar(255) NOT NULL,
    description varchar(255),
    created_at  datetime(6),
    updated_at  datetime(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_access_profiles_name UNIQUE (name)
) ENGINE=InnoDB;

-- unit_id nulo = vale para todas as unidades.
CREATE TABLE access_profile_permissions (
    id         binary(16) NOT NULL,
    profile_id binary(16) NOT NULL,
    module     enum ('STOCK','ASSET','ORDER','FINANCIAL','PRINTER','USER_MANAGEMENT') NOT NULL,
    unit_id    binary(16),
    level      enum ('NONE','READ','OPERATE') NOT NULL,
    created_at datetime(6),
    updated_at datetime(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO access_profiles (id, name, description, created_at) VALUES
    (UUID_TO_BIN('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'Administrador',
     'Acesso total a todos os modulos e unidades, incluindo gestao de usuarios.', NOW(6)),
    (UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 'TI Operadora',
     'Equipe da operadora: opera estoque, ativos, pedidos e impressoras da Operadora.', NOW(6)),
    (UUID_TO_BIN('cccccccc-cccc-cccc-cccc-cccccccccccc'), 'TI Hospital',
     'Equipe do hospital: opera estoque, ativos, pedidos e impressoras do Hospital.', NOW(6));

-- Administrador: tudo, em todas as unidades.
INSERT INTO access_profile_permissions (id, profile_id, module, unit_id, level, created_at)
SELECT UUID_TO_BIN(UUID()), UUID_TO_BIN('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
       m.module, NULL, 'OPERATE', NOW(6)
FROM (SELECT 'STOCK' AS module UNION ALL SELECT 'ASSET' UNION ALL SELECT 'ORDER'
      UNION ALL SELECT 'FINANCIAL' UNION ALL SELECT 'PRINTER'
      UNION ALL SELECT 'USER_MANAGEMENT') m;

-- TI Operadora: opera o que e da Operadora; enxerga o financeiro sem mexer.
INSERT INTO access_profile_permissions (id, profile_id, module, unit_id, level, created_at)
SELECT UUID_TO_BIN(UUID()), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
       m.module, UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 'OPERATE', NOW(6)
FROM (SELECT 'STOCK' AS module UNION ALL SELECT 'ASSET' UNION ALL SELECT 'ORDER'
      UNION ALL SELECT 'PRINTER') m;

INSERT INTO access_profile_permissions (id, profile_id, module, unit_id, level, created_at)
VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
        'FINANCIAL', NULL, 'READ', NOW(6));

-- TI Hospital: opera o que e do Hospital.
INSERT INTO access_profile_permissions (id, profile_id, module, unit_id, level, created_at)
SELECT UUID_TO_BIN(UUID()), UUID_TO_BIN('cccccccc-cccc-cccc-cccc-cccccccccccc'),
       m.module, UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), 'OPERATE', NOW(6)
FROM (SELECT 'STOCK' AS module UNION ALL SELECT 'ASSET' UNION ALL SELECT 'ORDER'
      UNION ALL SELECT 'PRINTER') m;

-- users ganha perfil, flag de ativo e auditoria.
ALTER TABLE users ADD COLUMN profile_id binary(16);
ALTER TABLE users ADD COLUMN active     bit(1) NOT NULL DEFAULT b'1';
ALTER TABLE users ADD COLUMN created_at datetime(6);
ALTER TABLE users ADD COLUMN updated_at datetime(6);

UPDATE users SET created_at = NOW(6) WHERE created_at IS NULL;

-- Quem ja era ADMIN vira Administrador, para nao perder o acesso na migracao.
-- Os demais ficam SEM perfil de proposito: negar por padrao e o comportamento
-- seguro: um administrador atribui o perfil certo depois.
UPDATE users SET profile_id = UUID_TO_BIN('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
 WHERE role = 'ADMIN';

-- O antigo role sai: a autorizacao passa a ser inteiramente do perfil, e manter os
-- dois criaria duas fontes de verdade para a mesma pergunta.
ALTER TABLE users DROP COLUMN role;

ALTER TABLE access_profile_permissions
    ADD CONSTRAINT fk_access_profile_permissions_profile FOREIGN KEY (profile_id) REFERENCES access_profiles (id);

ALTER TABLE access_profile_permissions
    ADD CONSTRAINT fk_access_profile_permissions_unit FOREIGN KEY (unit_id) REFERENCES operational_units (id);

ALTER TABLE users
    ADD CONSTRAINT fk_users_profile FOREIGN KEY (profile_id) REFERENCES access_profiles (id);
