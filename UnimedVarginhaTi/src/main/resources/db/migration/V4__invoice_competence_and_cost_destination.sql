-- Controle de notas fiscais: competencia, numero como texto e destino do custo.
--
-- Baseado no fluxo real da planilha "Controle Notas Fiscais":
--
-- 1. COMPETENCIA. O mes de controle nao e o mes de emissao. No historico ha nota
--    emitida em 12/04, vencida em 15/05, contabilizada em MAIO. Derivar o mes da
--    emissao a jogaria no mes errado, entao a competencia e um campo proprio.
--
-- 2. NUMERO COMO TEXTO. Existem 15 notas no historico numeradas como "2021/231" e
--    "2023/1141", que nao cabem em um inteiro.
--
-- 3. DESTINO DO CUSTO. Um contrato representa um servico e gera UMA nota por mes.
--    Toda nota tem destino: rateada entre centros de custo, ou integral no CNPJ do
--    contrato. Na planilha isto era a coluna CC (SIM/NAO), mas "NAO" nao dizia
--    onde o custo caia -- ficava sem dono.

ALTER TABLE invoices ADD COLUMN competence date;

-- Backfill: sem outra informacao, a competencia do que ja existe e o mes da
-- emissao. Notas cuja competencia real seja outra precisam de ajuste manual.
UPDATE invoices
   SET competence = DATE_FORMAT(issue_date, '%Y-%m-01')
 WHERE competence IS NULL;

ALTER TABLE invoices MODIFY COLUMN competence date NOT NULL;

ALTER TABLE invoices MODIFY COLUMN number varchar(40) NOT NULL;

ALTER TABLE invoices ADD COLUMN cost_allocation enum ('APPORTIONED','ENTERPRISE');

-- Quem ja tem rateio lancado e APPORTIONED; o resto passa a ser custo do CNPJ do
-- contrato, que e o destino que faltava ser explicito.
UPDATE invoices i
   SET cost_allocation = CASE
        WHEN EXISTS (SELECT 1 FROM apportionments a WHERE a.invoice_id = i.id)
        THEN 'APPORTIONED' ELSE 'ENTERPRISE' END
 WHERE cost_allocation IS NULL;

ALTER TABLE invoices MODIFY COLUMN cost_allocation enum ('APPORTIONED','ENTERPRISE') NOT NULL;

-- Um contrato gera uma nota por mes: a segunda na mesma competencia e lancamento
-- repetido. A planilha nao conseguia impedir isso.
ALTER TABLE invoices
    ADD CONSTRAINT uk_invoices_contract_competence UNIQUE (contract_id, competence);
