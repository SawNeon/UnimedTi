import { useCallback, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react';
import { DashboardService } from '../services/DashboardService';
import { BarChart, LineChart } from '../components/Charts';
import { Bloco, PanelToolbar, StatTiles, inteiro, mesLongo, money } from '../components/Panel';
import type { ContractsDashboardDTO } from '../../../shared/types/Dashboard';
import styles from '../../Users/pages/UserList.module.css';

/**
 * Painel dos contratos — o custo do TI.
 *
 * Vem da planilha Controle de Notas Fiscais. O contrato das impressoras entra
 * aqui como qualquer outro, pela nota que a Printec emite. O que não entra é o
 * rateio por centro de custo: ele é a cobrança que o TI repassa aos outros
 * setores, não o gasto do TI, e vive no painel de impressoras.
 */
export function ContractsDashboard() {
  const [competence, setCompetence] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<ContractsDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabela, setTabela] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await DashboardService.contracts(`${competence}-01`));
      setError(null);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao carregar o painel de contratos.');
    } finally {
      setLoading(false);
    }
  }, [competence]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={`${styles.pageContainer} viz-root`}>
      <div className={styles.card} style={{ padding: '0 0 20px' }}>
        <PanelToolbar
          titulo="Custo dos contratos"
          competence={competence}
          onCompetence={setCompetence}
          tabela={tabela}
          onTabela={() => setTabela(v => !v)}
        />

        {error && <div className={styles.feedback}>{error}</div>}
        {loading && <p style={{ padding: 20 }}>Carregando...</p>}

        {data && !loading && (
          <div style={{ padding: '0 24px' }}>
            <Kpis data={data} />

            {tabela ? <Tabelas data={data} /> : (
              <>
                <Bloco titulo={`Custo mensal — últimos ${data.series.length} meses`}
                       nota="Soma das notas lançadas em cada competência.">
                  <LineChart
                    labels={data.series.map(p => p.competence)}
                    series={[{
                      label: 'Contratos',
                      color: 'var(--viz-series-1)',
                      points: data.series.map(p => p.value)
                    }]}
                  />
                </Bloco>

                <Bloco titulo={`Gasto por categoria de serviço em ${data.kpis.year}`}
                       nota="O ano inteiro, pela categoria de cada contrato — a coluna TIPO da planilha.">
                  <BarChart items={data.byServiceType.map(s => ({ name: s.name, value: s.value }))} />
                </Bloco>

                <Bloco titulo={`Custo por empresa em ${mesLongo(data.competence)}`}
                       nota="Cada CNPJ recebe as notas dos contratos dele.">
                  <BarChart items={data.byEnterprise.map(e => ({ name: e.name, value: e.value }))} />
                </Bloco>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpis({ data }: { data: ContractsDashboardDTO }) {
  const k = data.kpis;
  const subiu = k.difference != null && k.difference > 0;
  const desceu = k.difference != null && k.difference < 0;

  return (
    <StatTiles tiles={[
      {
        label: `Custo do ano ${k.year}`,
        value: money(k.yearTotal),
        detalhe: 'contratos acumulados no ano'
      },
      {
        label: 'Custo do mês',
        value: money(k.total),
        detalhe: k.previousTotal == null
          ? 'sem mês anterior para comparar'
          : `mês anterior ${money(k.previousTotal)}`
      },
      {
        label: 'Variação',
        value: k.difference == null ? '—' : `${subiu ? '+' : ''}${money(k.difference)}`,
        detalhe: k.differencePercent == null
          ? ''
          : `${subiu ? '+' : ''}${k.differencePercent}% sobre o mês anterior`,
        icone: subiu ? <ArrowUp size={16} weight="bold" />
          : desceu ? <ArrowDown size={16} weight="bold" />
          : <Minus size={16} />,
        cor: subiu ? '#b3261e' : desceu ? '#2e7d32' : 'var(--color-text-muted)'
      },
      {
        label: 'Notas do mês',
        value: inteiro(k.contractsWithInvoice),
        detalhe: k.pendingInvoices > 0
          ? `${k.pendingInvoices} contrato(s) ainda sem nota`
          : 'todos os contratos lançados'
      }
    ]} />
  );
}

/** Os mesmos números em tabela: nenhum valor fica preso dentro do gráfico. */
function Tabelas({ data }: { data: ContractsDashboardDTO }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Custo mensal</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mês</th>
              <th style={{ textAlign: 'right' }}>Custo</th>
            </tr>
          </thead>
          <tbody>
            {data.series.map(p => (
              <tr key={p.competence}>
                <td>{p.competence.slice(0, 7)}</td>
                <td style={{ textAlign: 'right' }}><strong>{money(p.value)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: 15, margin: '24px 0 12px' }}>
        Gasto por categoria de serviço em {data.kpis.year}
      </h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Categoria</th>
              <th style={{ textAlign: 'right' }}>Gasto no ano</th>
            </tr>
          </thead>
          <tbody>
            {data.byServiceType.map(s => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td style={{ textAlign: 'right' }}><strong>{money(s.value)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
