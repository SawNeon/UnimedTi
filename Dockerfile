# syntax=docker/dockerfile:1

# O sistema vira UMA imagem: o Spring Boot serve a API e a tela na mesma porta.
# Os tres estagios abaixo existem para que a imagem final nao carregue nem o
# Node, nem o Maven, nem o codigo-fonte -- so o JRE e o JAR.

# ---------------------------------------------------------------- 1. a tela
FROM node:22-alpine AS front
WORKDIR /front

# package.json e lock primeiro: enquanto as dependencias nao mudam, o Docker
# reaproveita esta camada e nao roda npm ci de novo.
COPY front/frontSystemTI/package.json front/frontSystemTI/package-lock.json ./
RUN npm ci

COPY front/frontSystemTI/ ./

# O endereco da API, gravado dentro do JS na hora do build -- o Vite nao le isso
# em tempo de execucao. Relativo de proposito: a tela e a API saem da mesma
# origem, entao /api funciona pelo IP, pelo nome do servidor ou por um DNS novo,
# sem rebuildar. Fica aqui, e nao num .env, porque .env nao vai para o git nem
# para o contexto do build: a imagem precisa se bastar.
ENV VITE_API_URL=/api
RUN npm run build

# ---------------------------------------------------------------- 2. o JAR
FROM maven:3.9-eclipse-temurin-21 AS api
WORKDIR /api

COPY UnimedVarginhaTi/pom.xml ./
RUN mvn -B -ntp -DskipTests dependency:go-offline

COPY UnimedVarginhaTi/src ./src

# A tela compilada entra em static/ ANTES do package. Se este COPY sair, o JAR
# sobe so com a API e o navegador mostra pagina em branco.
COPY --from=front /front/dist/ ./src/main/resources/static/

RUN mvn -B -ntp -DskipTests package

# ------------------------------------------------------------ 3. o que roda
FROM eclipse-temurin:21-jre-alpine AS runtime

# curl e o que o healthcheck do compose usa para perguntar /actuator/health.
RUN apk add --no-cache curl

# Rodar como root dentro do container nao protege nada e amplia o estrago de
# qualquer falha na aplicacao.
RUN addgroup -S app && adduser -S -G app app

WORKDIR /app
COPY --from=api /api/target/*.jar app.jar

# Os PDFs das notas anexadas. E um volume no compose: o que fica aqui sobrevive
# a troca de versao da imagem.
RUN mkdir -p /app/uploads && chown -R app:app /app

USER app
EXPOSE 8080

# MaxRAMPercentage: o JVM respeita o limite de memoria do container em vez de
# olhar os 31 GB do host e se achar dono deles.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
