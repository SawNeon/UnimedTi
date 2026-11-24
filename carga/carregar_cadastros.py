# -*- coding: utf-8 -*-
"""Carrega empresas e setores de uma planilha para o sistema, pela API.

Por que pela API e nao por INSERT no banco: as regras que recusam um setor
(nome repetido, empresa inexistente, campo longo demais) moram no servico, nao
no schema. Gravando direto no MySQL, uma linha torta entra calada e so aparece
semanas depois, no rateio.

Roda em simulacao por padrao -- le tudo, confere tudo, mostra o que faria e nao
grava nada. Para gravar de verdade e preciso passar --aplicar.

Rodar de novo e seguro: o que ja existe no sistema e pulado, nunca reescrito.
Entao uma carga interrompida no meio se resolve rodando outra vez.

Uso:

    set SYSTEMTI_SENHA=...
    python carga/carregar_cadastros.py planilha.xlsx                 # simula
    python carga/carregar_cadastros.py planilha.xlsx --aplicar       # grava

A senha vem da variavel de ambiente SYSTEMTI_SENHA, e nao de um argumento, para
nao ficar no historico do terminal.
"""

import argparse
import json
import os
import sys
import unicodedata
import urllib.error
import urllib.request

try:
    from openpyxl import load_workbook
except ImportError:
    sys.exit("Falta a biblioteca openpyxl. Instale com: pip install openpyxl")


API_PADRAO = "http://172.20.8.13:8090"
USUARIO_PADRAO = "admin"

ABA_EMPRESAS = "Empresas"
ABA_SETORES = "Setores"

# Os mesmos limites dos DTOs do servidor. Conferidos aqui para que um nome longo
# demais apareca como uma linha do relatorio, e nao como um 400 solto no meio da
# gravacao, com metade da carga ja feita.
LIMITE_NOME_EMPRESA = 120
LIMITE_LOCALIDADE = 120
LIMITE_NOME_SETOR = 120
LIMITE_GRUPO = 60
LIMITE_CENTRO_CUSTO = 20
LIMITE_PIRAMIDE = 20


def chave(texto):
    """Forma comparavel de um nome: sem acento, sem caixa, sem espaco sobrando.

    O sistema trata "Compras" e "COMPRAS " como o mesmo nome na hora de recusar
    duplicata. Se a comparacao daqui fosse literal, o script tentaria criar um
    setor que ja existe e levaria um 409 que ele nao soube prever.
    """
    if texto is None:
        return ""
    limpo = unicodedata.normalize("NFKD", str(texto).strip())
    limpo = "".join(c for c in limpo if not unicodedata.combining(c))
    return " ".join(limpo.split()).upper()


def texto(valor):
    """Valor da celula como texto limpo. Celula vazia vira string vazia."""
    if valor is None:
        return ""
    if isinstance(valor, float) and valor.is_integer():
        # 293.0 veio de celula numerica; o centro de custo e texto.
        return str(int(valor))
    return str(valor).strip()


class Api:
    """Conversa com a API do sistema. Erro vira excecao com a mensagem de la."""

    def __init__(self, base):
        self.base = base.rstrip("/")
        self.token = None

    def _chamar(self, metodo, caminho, corpo=None):
        url = self.base + caminho
        dados = None
        cabecalhos = {"Accept": "application/json"}
        if corpo is not None:
            dados = json.dumps(corpo).encode("utf-8")
            cabecalhos["Content-Type"] = "application/json"
        if self.token:
            cabecalhos["Authorization"] = "Bearer " + self.token

        requisicao = urllib.request.Request(url, data=dados, headers=cabecalhos, method=metodo)
        try:
            with urllib.request.urlopen(requisicao, timeout=30) as resposta:
                bruto = resposta.read().decode("utf-8")
                return json.loads(bruto) if bruto else None
        except urllib.error.HTTPError as erro:
            raise ErroDaApi(erro) from None
        except urllib.error.URLError as erro:
            raise RuntimeError(
                "Nao consegui falar com {}: {}".format(url, erro.reason)) from None

    def entrar(self, login, senha):
        resposta = self._chamar("POST", "/api/auth/login",
                                {"login": login, "password": senha})
        self.token = resposta["token"]

    def empresas(self):
        return self._chamar("GET", "/api/enterprises") or []

    def setores(self):
        return self._chamar("GET", "/api/sectors") or []

    def criar_empresa(self, nome, localidade):
        return self._chamar("POST", "/api/enterprises",
                            {"name": nome, "locale": localidade})

    def criar_setor(self, nome, empresa_id, grupo, centro_custo, piramide):
        return self._chamar("POST", "/api/sectors", {
            "name": nome,
            "enterpriseId": empresa_id,
            "groupName": grupo,
            "costCenterCode": centro_custo,
            "pyramidCode": piramide or None,
        })


class ErroDaApi(Exception):
    """Erro devolvido pelo servidor, com a mensagem que ele mesmo escreveu."""

    def __init__(self, erro_http):
        self.status = erro_http.code
        self.mensagem = "HTTP {}".format(erro_http.code)
        try:
            corpo = json.loads(erro_http.read().decode("utf-8"))
        except Exception:
            corpo = None
        if isinstance(corpo, dict):
            partes = []
            if corpo.get("message"):
                partes.append(corpo["message"])
            for campo in corpo.get("fieldErrors") or []:
                partes.append("{}: {}".format(campo.get("field"), campo.get("message")))
            if partes:
                self.mensagem = " | ".join(partes)
        super().__init__(self.mensagem)


def ler_planilha(caminho):
    """Devolve (empresas, setores) com o numero da linha de cada uma."""
    wb = load_workbook(caminho, data_only=True)

    for aba in (ABA_EMPRESAS, ABA_SETORES):
        if aba not in wb.sheetnames:
            sys.exit("A planilha nao tem a aba '{}'. Abas encontradas: {}".format(
                aba, ", ".join(wb.sheetnames)))

    empresas = []
    for numero, linha in enumerate(
            wb[ABA_EMPRESAS].iter_rows(min_row=2, values_only=True), start=2):
        nome, localidade = texto(linha[0]), texto(linha[1] if len(linha) > 1 else "")
        if not nome and not localidade:
            continue
        empresas.append({"linha": numero, "nome": nome, "localidade": localidade})

    setores = []
    for numero, linha in enumerate(
            wb[ABA_SETORES].iter_rows(min_row=2, values_only=True), start=2):
        valores = [texto(linha[i]) if len(linha) > i else "" for i in range(5)]
        if not any(valores):
            continue
        setores.append({
            "linha": numero,
            "nome": valores[0],
            "empresa": valores[1],
            "grupo": valores[2],
            "centro_custo": valores[3],
            "piramide": valores[4],
        })

    return empresas, setores


def conferir(empresas, setores):
    """Tudo o que da para recusar sem falar com o servidor. Devolve a lista."""
    problemas = []

    vistas = {}
    for empresa in empresas:
        local = "Empresas linha {}".format(empresa["linha"])
        if not empresa["nome"]:
            problemas.append((local, "sem nome"))
            continue
        if not empresa["localidade"]:
            problemas.append((local, "sem localidade (o sistema exige)"))
        if len(empresa["nome"]) > LIMITE_NOME_EMPRESA:
            problemas.append((local, "nome com mais de {} caracteres".format(
                LIMITE_NOME_EMPRESA)))
        if len(empresa["localidade"]) > LIMITE_LOCALIDADE:
            problemas.append((local, "localidade com mais de {} caracteres".format(
                LIMITE_LOCALIDADE)))
        k = chave(empresa["nome"])
        if k in vistas:
            problemas.append((local, "empresa repetida na planilha (linha {})".format(
                vistas[k])))
        else:
            vistas[k] = empresa["linha"]

    empresas_da_planilha = {chave(e["nome"]) for e in empresas if e["nome"]}

    nomes_vistos = {}
    for setor in setores:
        local = "Setores linha {}".format(setor["linha"])
        if not setor["nome"]:
            problemas.append((local, "sem nome do setor"))
            continue

        k = chave(setor["nome"])
        if k in nomes_vistos:
            problemas.append((local, "setor '{}' repetido na planilha (linha {}); "
                                     "o sistema exige nome unico".format(
                                         setor["nome"], nomes_vistos[k])))
        else:
            nomes_vistos[k] = setor["linha"]

        if len(setor["nome"]) > LIMITE_NOME_SETOR:
            problemas.append((local, "nome com mais de {} caracteres".format(
                LIMITE_NOME_SETOR)))
        if not setor["empresa"]:
            problemas.append((local, "sem empresa"))
        elif chave(setor["empresa"]) not in empresas_da_planilha:
            problemas.append((local, "empresa '{}' nao esta na aba Empresas".format(
                setor["empresa"])))
        if not setor["grupo"]:
            problemas.append((local, "sem grupo"))
        elif len(setor["grupo"]) > LIMITE_GRUPO:
            problemas.append((local, "grupo com mais de {} caracteres".format(LIMITE_GRUPO)))
        if not setor["centro_custo"]:
            problemas.append((local, "sem centro de custo"))
        elif len(setor["centro_custo"]) > LIMITE_CENTRO_CUSTO:
            problemas.append((local, "centro de custo com mais de {} caracteres".format(
                LIMITE_CENTRO_CUSTO)))
        if len(setor["piramide"]) > LIMITE_PIRAMIDE:
            problemas.append((local, "codigo do Piramide com mais de {} caracteres".format(
                LIMITE_PIRAMIDE)))

    return problemas


def titulo(texto_do_titulo):
    print()
    print(texto_do_titulo)
    print("-" * len(texto_do_titulo))


def main():
    parser = argparse.ArgumentParser(
        description="Carrega empresas e setores de uma planilha para o sistema da TI.")
    parser.add_argument("planilha", help="arquivo .xlsx com as abas Empresas e Setores")
    parser.add_argument("--api", default=API_PADRAO,
                        help="endereco do sistema (padrao: {})".format(API_PADRAO))
    parser.add_argument("--usuario", default=USUARIO_PADRAO,
                        help="login usado na carga (padrao: {})".format(USUARIO_PADRAO))
    parser.add_argument("--aplicar", action="store_true",
                        help="grava de verdade; sem isto, apenas simula")
    args = parser.parse_args()

    senha = os.environ.get("SYSTEMTI_SENHA")
    if not senha:
        sys.exit("Defina a senha na variavel SYSTEMTI_SENHA antes de rodar.\n"
                 "  PowerShell:  $env:SYSTEMTI_SENHA = 'a-senha'\n"
                 "  bash:        export SYSTEMTI_SENHA='a-senha'")

    if not os.path.isfile(args.planilha):
        sys.exit("Nao encontrei a planilha: {}".format(args.planilha))

    titulo("1. Lendo a planilha")
    empresas, setores = ler_planilha(args.planilha)
    print("Empresas: {} linhas | Setores: {} linhas".format(len(empresas), len(setores)))

    titulo("2. Conferindo antes de falar com o sistema")
    problemas = conferir(empresas, setores)
    if problemas:
        for local, motivo in problemas:
            print("  {:<22} {}".format(local, motivo))
        print()
        print("{} problema(s). Nada foi enviado. Corrija a planilha e rode de novo.".format(
            len(problemas)))
        return 1
    print("Nenhum problema na planilha.")

    titulo("3. Entrando no sistema")
    api = Api(args.api)
    try:
        api.entrar(args.usuario, senha)
    except ErroDaApi as erro:
        sys.exit("Login recusado ({}): {}".format(erro.status, erro.mensagem))
    except RuntimeError as erro:
        sys.exit(str(erro))
    print("Conectado em {} como {}".format(args.api, args.usuario))

    titulo("4. O que ja existe la")
    empresas_existentes = {chave(e["name"]): e for e in api.empresas()}
    setores_existentes = {chave(s["name"]) for s in api.setores()}
    print("Empresas: {} | Setores: {}".format(
        len(empresas_existentes), len(setores_existentes)))

    empresas_a_criar = [e for e in empresas if chave(e["nome"]) not in empresas_existentes]
    setores_a_criar = [s for s in setores if chave(s["nome"]) not in setores_existentes]

    titulo("5. O que a carga faria")
    print("Empresas a criar: {}".format(len(empresas_a_criar)))
    for empresa in empresas_a_criar:
        print("   linha {:<4} {}".format(empresa["linha"], empresa["nome"]))
    print("Empresas que ja existem (nao mexo): {}".format(
        len(empresas) - len(empresas_a_criar)))
    print("Setores a criar: {}".format(len(setores_a_criar)))
    print("Setores que ja existem (nao mexo): {}".format(
        len(setores) - len(setores_a_criar)))

    if not args.aplicar:
        titulo("SIMULACAO -- nada foi gravado")
        print("Para gravar de verdade, repita o comando com --aplicar")
        return 0

    titulo("6. Gravando as empresas")
    falhas = []
    for empresa in empresas_a_criar:
        try:
            criada = api.criar_empresa(empresa["nome"], empresa["localidade"])
            empresas_existentes[chave(empresa["nome"])] = criada
            print("  criada    {}".format(empresa["nome"]))
        except ErroDaApi as erro:
            falhas.append(("Empresas linha {}".format(empresa["linha"]),
                           empresa["nome"], erro.mensagem))
            print("  RECUSADA  {} -- {}".format(empresa["nome"], erro.mensagem))

    titulo("7. Gravando os setores")
    criados = 0
    for setor in setores_a_criar:
        empresa = empresas_existentes.get(chave(setor["empresa"]))
        if not empresa:
            falhas.append(("Setores linha {}".format(setor["linha"]), setor["nome"],
                           "a empresa '{}' nao foi criada".format(setor["empresa"])))
            print("  RECUSADO  {} -- empresa ausente".format(setor["nome"]))
            continue
        try:
            api.criar_setor(setor["nome"], empresa["id"], setor["grupo"],
                            setor["centro_custo"], setor["piramide"])
            criados += 1
        except ErroDaApi as erro:
            falhas.append(("Setores linha {}".format(setor["linha"]),
                           setor["nome"], erro.mensagem))
            print("  RECUSADO  {} -- {}".format(setor["nome"], erro.mensagem))
    print("  {} setor(es) criado(s)".format(criados))

    titulo("Resultado")
    if falhas:
        print("{} linha(s) recusada(s):".format(len(falhas)))
        for local, nome, motivo in falhas:
            print("  {:<22} {:<40} {}".format(local, nome[:40], motivo))
        print()
        print("O que passou ficou gravado. Corrija as linhas acima e rode de novo:")
        print("o que ja entrou sera pulado.")
        return 1

    print("Tudo gravado, sem recusas.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
