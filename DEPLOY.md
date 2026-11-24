# O sistema da TI no Kratos

O sistema roda em **Docker**, no servidor **Kratos** (`172.20.8.13`). São dois
containers: a aplicação — que serve a tela e a API na mesma porta — e o MySQL.

A equipe abre:

```
http://172.20.8.13:8090
```

## Por que 8090 e não 8080

O Kratos já hospeda o **uniquiz**, no mesmo Docker, e ele ocupa a 80, a 443 e a
8080 (esta última na 127.0.0.1, do ambiente de desenvolvimento dele). A 8090
estava livre e continua separada: os dois sistemas não se enxergam, cada um tem
sua rede e seu volume.

Vale pedir à rede um apelido de DNS — `http://sistemati:8090`, ou um nome na 80
num proxy compartilhado — para ninguém precisar decorar IP e porta. Nada no
sistema muda para isso funcionar: o endereço da API é relativo (`/api`), então
ele acompanha qualquer nome novo. Só é preciso acrescentar o endereço em
`CORS_ALLOWED_ORIGINS`.

## Onde tudo mora

O Docker do Kratos vive **dentro do WSL** (Ubuntu), não no Windows. Por isso
`docker` não existe no PowerShell: todo comando daqui para baixo roda dentro do
WSL.

```bash
ssh kratos
wsl -d Ubuntu -u root
cd /opt/systemti/deploy
```

| Caminho | O que é |
|---|---|
| `/opt/systemti` | O código, igual ao repositório |
| `/opt/systemti/deploy/docker-compose.yml` | Como os dois containers sobem |
| `/opt/systemti/deploy/.env` | **As senhas.** Permissão 600, só root lê. Não vai para o git |
| volume `systemti_dados-mysql` | O banco |
| volume `systemti_uploads` | Os PDFs das notas anexadas |

## O primeiro acesso

Numa instalação nova as migrations criam os perfis e as permissões, mas nenhum
usuário — e o cadastro de usuário exige estar logado. Para não deixar o sistema
inacessível, `ADMIN_LOGIN` e `ADMIN_SENHA` no `.env` criam o primeiro
administrador na primeira subida com o banco vazio.

O usuário é `admin`. Para ver a senha gerada:

```bash
ssh kratos "wsl -d Ubuntu -u root grep ADMIN_SENHA /opt/systemti/deploy/.env"
```

**Troque essa senha depois de entrar** e cadastre as pessoas pela tela. Assim
que existir um usuário no banco, essas duas variáveis param de ter efeito —
elas não repõem a senha de ninguém.

## Atualizar para uma versão nova

```bash
cd /opt/systemti/deploy
docker compose up -d --build
```

O build refaz a tela, refaz o JAR e troca o container. As migrations pendentes
rodam sozinhas na subida. O `.env` e os volumes não são tocados.

Antes de subir uma versão nova, faça o backup do banco (abaixo). É o que
permite voltar atrás.

## Ver o que está acontecendo

```bash
docker compose ps
```

```bash
docker compose logs -f app
```

```bash
curl -s http://localhost:8090/actuator/health
```

`{"status":"UP"}` quer dizer que a aplicação responde **e** o banco está de pé.
O Docker consulta esse mesmo endereço a cada 30 segundos.

## Backup

O banco:

```bash
docker compose exec -T db sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --databases SystemTI' > ~/systemti-$(date +%F).sql
```

Os anexos:

```bash
docker run --rm -v systemti_uploads:/dados -v ~:/saida alpine tar -czf /saida/uploads-$(date +%F).tar.gz -C /dados .
```

Os dois arquivos precisam sair do Kratos e entrar na rotina de backup da casa.
Backup que mora só no servidor que ele protege não é backup.

## Quando algo não subir

| Sintoma | Causa provável |
|---|---|
| `port is already allocated` | Alguém pegou a 8090. Veja com `ss -tlnp` dentro do WSL e troque `PORTA_PUBLICA` no `.env`. |
| Container reiniciando em laço | `docker compose logs app`. Quase sempre é o banco: veja se `systemti-db-1` está `healthy`. |
| Tela abre e nada carrega | `CORS_ALLOWED_ORIGINS` não bate com o endereço da barra do navegador. |
| Página em branco | A tela não entrou na imagem. Rebuild sem cache: `docker compose build --no-cache app`. |
| `Migration checksum mismatch` | Alguém editou uma migration já aplicada. Migration aplicada não se altera: crie uma nova. |
| Health `DOWN` com a tela no ar | O banco caiu. O health responde pelo MySQL também. |

## O que NÃO fazer

`docker compose down -v` apaga os volumes — o banco e os anexos vão junto. É o
único comando daqui que destrói dado. Para parar sem destruir nada:

```bash
docker compose stop
```

## Se precisar de HTTPS

Hoje é HTTP dentro da rede interna. Para TLS, o caminho mais curto é um nginx na
frente, como o uniquiz já faz em `/opt/uniquiz/deploy/nginx.conf` — ele termina
o TLS e repassa para a aplicação. Como a 443 já é do uniquiz, ou os dois passam
a dividir o mesmo proxy por nome de host, ou este sobe numa porta própria.
