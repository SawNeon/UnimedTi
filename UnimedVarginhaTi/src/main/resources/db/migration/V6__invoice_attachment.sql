-- Anexo da nota fiscal.
--
-- A nota chega em PDF por e-mail. Sem guardar o arquivo, reencontra-la depois
-- depende da caixa de entrada de quem recebeu -- que foi exatamente a limitacao
-- da planilha.
--
-- Guarda-se o caminho relativo a pasta de uploads, no mesmo padrao que o modulo
-- de pedidos ja usa. Nulo enquanto ninguem anexou.

ALTER TABLE invoices ADD COLUMN attachment_path varchar(500);
