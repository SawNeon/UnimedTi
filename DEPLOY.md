# Instalar o sistema num servidor da rede

O sistema vira **um arquivo só** — um JAR que já traz a tela dentro dele. Quem usa
abre `http://nome-do-servidor:8080` no navegador. Não precisa de nginx, de IIS,
nem de porta 80 liberada para fora: tudo acontece dentro da rede.

## O que o servidor precisa ter

| Item | Versão | Observação |
|---|---|---|
| Java | 21 | O sistema não roda no Java 8. Nesta estação o `java` do PATH é o 8 — no servidor confira com `java -version`. |
| MySQL | 8.0 | Pode ser o mesmo servidor ou outro da rede. |
| Porta | 8080 | Liberada no firewall para a faixa da rede interna. |

## Passo 1 — Gerar o arquivo

Na máquina de desenvolvimento, com o código atualizado:

```bash
cd front/frontSystemTI && npm ci && npm run build
```

```bash
cp -r front/frontSystemTI/dist/* UnimedVarginhaTi/src/main/resources/static/
```

```bash
cd UnimedVarginhaTi && ./mvnw -DskipTests package
```

Sai `UnimedVarginhaTi/target/UnimedVarginhaTi-0.0.1-SNAPSHOT.jar`. É esse arquivo
que vai para o servidor. Ele tem cerca de 88 MB porque carrega o Java web embutido
e a tela junto.

> O passo do `cp` precisa acontecer **antes** do `package`. Se a pasta `static`
> estiver vazia, o JAR sobe só com a API e o navegador mostra página em branco.

## Passo 2 — Preparar o banco

No MySQL do servidor:

```sql
CREATE DATABASE SystemTI CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'systemti'@'%' IDENTIFIED BY 'uma-senha-forte';
GRANT ALL PRIVILEGES ON SystemTI.* TO 'systemti'@'%';
FLUSH PRIVILEGES;
```

Não precisa criar tabela nenhuma. Na primeira subida o Flyway cria o schema inteiro
e, a cada atualização, aplica só as migrations novas.

Para levar os dados que já estão nesta estação, gere um dump aqui e restaure lá:

```bash
mysqldump -u root -p --databases SystemTI > systemti.sql
```

## Passo 3 — Configurar

Copie o JAR para o servidor, por exemplo em `C:\SystemTI\`, e crie ao lado um
`iniciar.bat`:

```bat
@echo off
set DB_URL=jdbc:mysql://localhost:3306/SystemTI?serverTimezone=UTC
set DB_USERNAME=systemti
set DB_PASSWORD=uma-senha-forte
set JWT_SECRET=troque-por-uma-frase-longa-e-unica
set CORS_ALLOWED_ORIGINS=http://srv-ti:8080
set FILE_UPLOAD_DIR=C:\SystemTI\uploads
set JPA_SHOW_SQL=false
java -jar C:\SystemTI\UnimedVarginhaTi-0.0.1-SNAPSHOT.jar
```

O que cada uma faz:

- **DB_PASSWORD** — sem ela o sistema usa a senha de desenvolvimento, que está no
  código e todo mundo enxerga.
- **JWT_SECRET** — assina o token de quem está logado. Com o valor padrão
  (`change-me-in-production`), qualquer um que conheça o projeto consegue forjar um
  token e entrar como administrador. **Esta é a variável mais importante.**
- **CORS_ALLOWED_ORIGINS** — o endereço pelo qual as pessoas abrem o sistema. Como
  a tela e a API ficam na mesma porta, é só esse endereço. Se as pessoas usarem o
  IP em vez do nome, coloque os dois separados por vírgula.
- **FILE_UPLOAD_DIR** — onde ficam os PDFs das notas anexadas. Aponte para uma
  pasta que entre no backup; ela **não** está dentro do JAR.

## Passo 4 — Subir como serviço do Windows

Rodar pelo `.bat` funciona, mas o sistema cai junto quando alguém desloga do
servidor. Para ficar de pé sozinho, use o [NSSM](https://nssm.cc):

```bat
nssm install SystemTI "C:\SystemTI\iniciar.bat"
nssm set SystemTI Start SERVICE_AUTO_START
nssm set SystemTI AppStdout C:\SystemTI\logs\saida.log
nssm set SystemTI AppStderr C:\SystemTI\logs\erro.log
nssm start SystemTI
```

Assim ele volta sozinho depois de um reinício do servidor.

## Passo 5 — Liberar no firewall e avisar a equipe

```powershell
New-NetFirewallRule -DisplayName "SystemTI" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

O endereço para a equipe é `http://srv-ti:8080` (troque pelo nome real do
servidor). Vale pedir para o pessoal de rede criar um apelido de DNS, tipo
`http://sistemati`, para ninguém precisar decorar porta.

## Como atualizar depois

1. Pare o serviço: `nssm stop SystemTI`
2. Troque o JAR pelo novo
3. Suba de novo: `nssm start SystemTI`

As migrations pendentes rodam sozinhas na subida. Antes de trocar o JAR, faça o
dump do banco — é o que permite voltar atrás se a versão nova tiver problema.

## Se quiser HTTPS

Só faz sentido se a política de segurança exigir. O caminho mais curto é gerar um
certificado interno, converter para `.p12` e apontar no `iniciar.bat`:

```bat
set SERVER_SSL_KEY_STORE=C:\SystemTI\certificado.p12
set SERVER_SSL_KEY_STORE_PASSWORD=senha-do-certificado
set SERVER_SSL_KEY_STORE_TYPE=PKCS12
set SERVER_PORT=8443
```

Lembre de trocar `CORS_ALLOWED_ORIGINS` para `https://` e a porta nova.

## Quando algo não subir

| Sintoma | Causa provável |
|---|---|
| `UnsupportedClassVersionError` | Java 8 no PATH. Instale o 21 e aponte o `java` do `.bat` para ele. |
| Página em branco, API responde | A pasta `static` estava vazia na hora do `package`. Refaça o passo 1. |
| `Migration checksum mismatch` | Alguém editou uma migration já aplicada. Migration aplicada não se altera: crie uma nova. |
| Tela carrega mas nada aparece | `CORS_ALLOWED_ORIGINS` não bate com o endereço da barra do navegador. |
| Erro de validação de schema na subida | O banco está atrás das migrations. Confira o log do Flyway no início. |
