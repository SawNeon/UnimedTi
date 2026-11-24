export interface ShareRow {
  sectorId: string;
  percentage: number;
  /** Travada: mantém o valor quando outra linha muda. */
  locked?: boolean;
}

const CEM = 100;
const arredonda = (v: number) => Math.round(v * 100) / 100;

/**
 * Redistribui os percentuais para a soma fechar exatamente 100.
 *
 * Não existe mais de 100%: subir uma linha desce as outras. A linha recém-editada
 * e as travadas mantêm o valor; as livres absorvem a sobra em proporção ao peso
 * que já tinham, para uma divisão 70/20/10 continuar com essa forma depois do
 * ajuste, em vez de virar partes iguais.
 *
 * Se o que foi fixado já passa de 100, a própria linha editada é reduzida — é o
 * único jeito de honrar o limite sem mexer no que o operador travou.
 *
 * O resto do arredondamento cai na maior linha livre, para a soma bater 100 na
 * casa dos centavos. Sem isso, três linhas de 33,33 somariam 99,99 e o backend
 * recusaria o lançamento.
 */
export function rebalance(rows: ShareRow[], editedIndex: number): ShareRow[] {
  if (rows.length === 0) return rows;

  if (rows.length === 1) {
    return [{ ...rows[0], percentage: CEM }];
  }

  const fixo = (i: number) => i === editedIndex || rows[i].locked === true;

  let somaFixa = rows.reduce((total, row, i) => total + (fixo(i) ? Number(row.percentage || 0) : 0), 0);
  const livres = rows.map((_, i) => i).filter(i => !fixo(i));

  const saida = rows.map(row => ({ ...row, percentage: Number(row.percentage || 0) }));

  // Nada livre para absorver: a linha editada cede até caber em 100.
  if (livres.length === 0) {
    if (somaFixa > CEM) {
      const outras = somaFixa - Number(saida[editedIndex].percentage);
      saida[editedIndex].percentage = arredonda(Math.max(0, CEM - outras));
    }
    return saida;
  }

  if (somaFixa > CEM) {
    const outrasFixas = somaFixa - Number(saida[editedIndex].percentage);
    saida[editedIndex].percentage = arredonda(Math.max(0, CEM - outrasFixas));
    somaFixa = outrasFixas + saida[editedIndex].percentage;
  }

  const sobra = Math.max(0, arredonda(CEM - somaFixa));
  const pesoTotal = livres.reduce((total, i) => total + Number(rows[i].percentage || 0), 0);

  livres.forEach(i => {
    const fatia = pesoTotal > 0
      ? sobra * (Number(rows[i].percentage || 0) / pesoTotal)
      : sobra / livres.length;
    saida[i].percentage = arredonda(fatia);
  });

  const somaAtual = saida.reduce((total, row) => total + row.percentage, 0);
  const residuo = arredonda(CEM - somaAtual);

  if (residuo !== 0) {
    const maiorLivre = livres.reduce((a, b) => (saida[a].percentage >= saida[b].percentage ? a : b));
    saida[maiorLivre].percentage = arredonda(Math.max(0, saida[maiorLivre].percentage + residuo));
  }

  return saida;
}

/**
 * Distribui do zero entre todas as linhas, em partes iguais. Usado ao adicionar
 * o primeiro setor ou ao pedir a divisão igualitária.
 */
export function distribuirIgualmente(rows: ShareRow[]): ShareRow[] {
  if (rows.length === 0) return rows;

  const fatia = arredonda(CEM / rows.length);
  const saida = rows.map(row => ({ ...row, percentage: fatia }));

  const residuo = arredonda(CEM - fatia * rows.length);
  if (residuo !== 0) {
    saida[0].percentage = arredonda(saida[0].percentage + residuo);
  }

  return saida;
}

export const somaRateio = (rows: ShareRow[]) =>
  arredonda(rows.reduce((total, row) => total + Number(row.percentage || 0), 0));
