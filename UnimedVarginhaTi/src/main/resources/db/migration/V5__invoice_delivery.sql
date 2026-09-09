-- Fluxo de entrega da nota, conforme o Calendario de Nota Fiscal do Financeiro.
--
-- Dois limites se encadeiam:
--
--  1. REGRA DO CONTRATO: nota fixa negociada por contrato deve ser enviada ao
--     Suporte Adm com no minimo 7 dias de antecedencia do vencimento previsto.
--
--  2. CICLO DE PAGAMENTO: o Suporte Adm recebe as sextas ate 15h e leva 2 a 3 dias
--     para repassar; o Financeiro recebe as segundas ate 15h e paga na segunda
--     SEGUINTE. Para o pagamento cair antes do vencimento, a sexta do TI precisa
--     estar pelo menos 10 dias antes dele.
--
-- O segundo limite e mais restritivo, entao e ele que manda -- e por consequencia
-- os 7 dias do contrato ficam sempre satisfeitos.
--
-- Feriados NAO sao tratados: o calendario manda antecipar quando cai feriado no dia
-- de envio, mas isso exigiria uma tabela de feriados. Por isso o prazo e gravado e
-- editavel, e nao imposto.

ALTER TABLE invoices ADD COLUMN delivery_target enum ('SUPORTE_ADM','FINANCEIRO');
ALTER TABLE invoices ADD COLUMN delivery_deadline date;
ALTER TABLE invoices ADD COLUMN delivered_at date;

-- Notas ja lancadas seguem o caminho padrao do setor.
UPDATE invoices SET delivery_target = 'SUPORTE_ADM' WHERE delivery_target IS NULL;

-- Mesmo calculo do InvoiceDeliveryScheduler, em SQL:
--   segunda_financeiro = (vencimento - 7 dias) recuado ate a segunda da semana
--   prazo_ti           = segunda_financeiro - 3 dias  (a sexta anterior)
-- WEEKDAY() devolve 0 para segunda-feira no MySQL.
UPDATE invoices
   SET delivery_deadline = DATE_SUB(
           DATE_SUB(
               DATE_SUB(due_date, INTERVAL 7 DAY),
               INTERVAL WEEKDAY(DATE_SUB(due_date, INTERVAL 7 DAY)) DAY
           ),
           INTERVAL 3 DAY)
 WHERE delivery_deadline IS NULL;

ALTER TABLE invoices MODIFY COLUMN delivery_target enum ('SUPORTE_ADM','FINANCEIRO') NOT NULL;
ALTER TABLE invoices MODIFY COLUMN delivery_deadline date NOT NULL;

-- Nota ja marcada como entregue mas sem data registrada: assume a emissao, que e a
-- unica data confiavel que existe para ela.
UPDATE invoices SET delivered_at = issue_date
 WHERE status = 'DELIVERED' AND delivered_at IS NULL;
