# Carga de cadastros por planilha

`carregar_cadastros.py` lê uma planilha com as abas **Empresas** e **Setores** e
cria o que falta no sistema, pela API.

## Por que pela API, e não por SQL

As regras que recusam um setor — nome repetido, empresa que não existe, campo
longo demais — moram no serviço, não no schema do banco. Um `INSERT` direto
passa por cima delas: a linha torta entra calada e só aparece semanas depois,
errando o rateio. Pela API, ela é recusada na hora, com a mensagem que o próprio
sistema escreveu.

## Rodar

A senha vem de variável de ambiente, e não de argumento, para não ficar no
histórico do terminal.

```powershell
$env:SYSTEMTI_SENHA = "a-senha-do-usuario"
```

Simula — lê tudo, confere tudo, mostra o que faria e **não grava nada**:

```bash
python carga/carregar_cadastros.py planilha.xlsx
```

Grava de verdade:

```bash
python carga/carregar_cadastros.py planilha.xlsx --aplicar
```

Outro servidor ou outro usuário:

```bash
python carga/carregar_cadastros.py planilha.xlsx --api http://172.20.8.13:8090 --usuario admin
```

## O que ele garante

**Nada entra pela metade por culpa da planilha.** A conferência local roda antes
do login: se houver um só problema, o script lista todos com o número da linha e
encerra sem enviar nada.

**Rodar de novo é seguro.** Empresa e setor que já existem são pulados, nunca
reescritos — a comparação ignora acento, caixa e espaço sobrando, igual ao
sistema. Uma carga interrompida no meio se resolve rodando outra vez.

**Ele não apaga nem altera nada.** Só cria o que falta. Tirar um setor que não
existe mais é trabalho da tela, não daqui.

## As colunas

Aba **Empresas**:

| Coluna | Obrigatória | Limite |
|---|---|---|
| EMPRESA | sim | 120 |
| LOCALIDADE | sim | 120 |

Aba **Setores**:

| Coluna | Obrigatória | Limite |
|---|---|---|
| SETOR | sim, e único no sistema inteiro | 120 |
| EMPRESA | sim, tem que estar na aba Empresas | — |
| GRUPO | sim | 60 |
| CENTRO DE CUSTO | sim | 20 |
| CÓDIGO PIRÂMIDE | não (só a operadora tem) | 20 |

Qualquer coluna à direita dessas é ignorada, então dá para manter anotações na
planilha sem atrapalhar a carga.

## Cuidado com o Excel

O centro de custo e o código do Pirâmide são **texto**, não número. Se o Excel
converter, `005891` perde o zero da frente e `5.09` vira um decimal. A planilha
que o script consome já traz essas colunas formatadas como texto — se você criar
uma do zero, formate antes de digitar.

## Histórico

A primeira carga rodou em 13/11/2026 contra `http://172.20.8.13:8090`: criou a
empresa RESSOAR e 141 setores (93 do Hospital, 47 da Operadora, 1 da RESSOAR),
sem nenhuma recusa. As duas empresas que já estavam cadastradas foram puladas.
