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
| `DB_PASSWORD` | Senha do banco | **sem padrao** -- o sistema nao sobe sem ela |
| `JWT_SECRET` | Segredo para assinar tokens JWT | **sem padrao** -- o sistema nao sobe sem ele |
| `FILE_UPLOAD_DIR` | Pasta de uploads | `./uploads` |
| `MAIL_HOST` | Servidor SMTP | `smtp-mail.outlook.com` |
| `MAIL_PORT` | Porta SMTP | `587` |

`DB_PASSWORD` e `JWT_SECRET` nao tem valor padrao de proposito. Um padrao
transforma a senha em codigo: ela entra no git, vai para o repositorio e fica no
historico para sempre. Sem a variavel, o sistema recusa subir dizendo qual
falta.

Para o dia a dia nesta maquina, crie `UnimedVarginhaTi/application-local.yaml`
-- ao lado do `pom.xml`, e **nao** dentro de `src/main/resources`, senao o Maven
o empacota dentro do JAR e a senha viaja com o artefato. Ele e lido
automaticamente e o `.gitignore` ja o cobre:

```yaml
spring:
  datasource:
    password: a-senha-do-seu-mysql

api:
  security:
    token:
      secret: qualquer-frase-longa-para-desenvolvimento
```

Em producao, nada de arquivo: as duas vem por variavel de ambiente. Use um
usuario MySQL proprio da aplicacao, com senha forte e permissoes restritas ao
banco `SystemTI`.
