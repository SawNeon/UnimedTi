# Gestao Setor TI API

Backend Spring Boot da aplicacao de gestao do setor de TI.

## Banco local com MySQL

A aplicacao usa MySQL por padrao. Antes de iniciar a API, confirme que o MySQL esta rodando na porta `3306`.

Configuracao padrao de desenvolvimento:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/SystemTI?createDatabaseIfNotExist=true&serverTimezone=UTC"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = ""
$env:JWT_SECRET = "troque-este-segredo-local"
```

Se o seu usuario `root` tiver senha, preencha `DB_PASSWORD` com a senha local:

```powershell
$env:DB_PASSWORD = "sua-senha-do-mysql"
```

Depois execute:

```powershell
.\mvnw.cmd spring-boot:run
```

## Variaveis principais

| Variavel | Uso | Padrao local |
| --- | --- | --- |
| `DB_URL` | URL JDBC do MySQL | `jdbc:mysql://localhost:3306/SystemTI?createDatabaseIfNotExist=true&serverTimezone=UTC` |
| `DB_USERNAME` | Usuario do banco | `root` |
| `DB_PASSWORD` | Senha do banco | vazio |
| `JWT_SECRET` | Segredo para assinar tokens JWT | `change-me-in-production` |
| `FILE_UPLOAD_DIR` | Pasta de uploads | `./uploads` |
| `MAIL_HOST` | Servidor SMTP | `smtp-mail.outlook.com` |
| `MAIL_PORT` | Porta SMTP | `587` |

Em producao, configure essas variaveis no ambiente do servidor e use um usuario MySQL proprio da aplicacao, com senha forte e permissoes restritas ao banco `SystemTI`.
