import { useCallback, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Minus, Table as TableIcon, ChartLine } from '@phosphor-icons/react';
import { DashboardService } from '../services/DashboardService';
import { BarChart, LineChart } from '../components/Charts';
import type { DashboardDTO } from '../../../shared/types/Dashboard';
import styles from '../../Users/pages/UserList.module.css';

const money = (v: number) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const inteiro = (v: number) => Number(v).toLocaleString('pt-BR');

const mesLongo = (iso: string) => {
  const [ano, mes] = iso.split('-');
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${nomes[Number(mes) - 1]} de ${ano}`;
};

/**
 * Painel de gestão.
 *
 * Os números de cabeçalho são stat tiles, não gráficos: um valor único com sua
 * variação não vira barra. Os gráficos ficam abaixo, e o filtro de mês numa
 * linha só acima de tudo.
 */
export function Dashboard() {
  const [competence, setCompetence] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabela, setTabela] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await DashboardService.get(`${competence}-01`));
      setError(null);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao carregar o painel.');
    } finally {
      setLoading(false);
    }
  }, [competence]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={`${styles.pageContainer} viz-root`}>
      <div className={styles.card} style={{ padding: '0 0 20px' }}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Painel de custos</h2>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="month"
              className={styles.searchInput}
              style={{ minWidth: 0, maxWidth: 170 }}
              value={competence}
              onChange={(e) => setCompetence(e.target.value)}
            />
            <button className={styles.pageButton} onClick={() => setTabela(v => !v)}>
              {tabela ? <ChartLine size={16} /> : <TableIcon size={16} />}
              {tabela ? 'Ver gráficos' : 'Ver tabela'}
            </button>
          </div>
        </div>

        {error && <div className={styles.feedback}>{error}</div>}

        {loading && <p style={{ padding: 20 }}>Carregando...</p>}

        {data && !loading && (
          <div style={{ padding: '0 24px' }}>
            <KpiRow data={data} />

            {tabela ? <TableView data={data} /> : (
              <>
                <Bloco titulo={`Custo mensal — últimos ${data.series.length} meses`}
                       nota="Contratos e impressoras somados mês a mês.">
                  <LineChart
                    labels={data.series.map(p => p.competence)}
                    series={[
                      { label: 'Contratos', color: 'var(--viz-series-1)', points: data.series.map(p => p.contracts) },
                      { label: 'Impressoras', color: 'var(--viz-series-2)', points: data.series.map(p => p.printers) }
                    ]}
                  />
                </Bloco>

                <Bloco titulo={`Custo por empresa em ${mesLongo(data.competence)}`}>
                  <BarChart items={data.byEnterprise.map(e => ({ name: e.name, value: e.value }))} />
                </Bloco>

                <Bloco titulo={`Custo por centro de custo em ${mesLongo(data.competence)}`}
                       nota="Rateio das notas somado ao rateio das impressoras.">
                  <BarChart items={data.bySector.map(s => ({
                    name: s.name,
                    value: s.value,
                    hint: s.code == null ? undefined : `cc ${s.code}`
                  }))} />
                </Bloco>

                {/* Páginas pretas e coloridas vivem em escalas muito diferentes.
                    Dois eixos no mesmo gráfico seria enganoso, então são dois. */}
                <Bloco titulo="Páginas impressas por mês">
                  <LineChart
                    labels={data.pages.map(p => p.competence)}
                    series={[{ label: 'Preto e branco', color: 'var(--viz-series-1)', points: data.pages.map(p => p.blackPages) }]}
                    format={inteiro}
                    height={180}
                  />
                  <div style={{ marginTop: 20 }}>
                    <LineChart
                      labels={data.pages.map(p => p.competence)}
                      series={[{ label: 'Coloridas', color: 'var(--viz-series-2)', points: data.pages.map(p => p.colorPages) }]}
                      format={inteiro}
                      height={180}
                    />
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 8 }}>
                    Em gráficos separados de propósito: o volume em preto é cerca de cem
                    vezes o colorido, e um eixo compartilhado achataria a linha colorida
                    até ela parecer constante.
                  </p>
                </Bloco>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Bloco({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h3 style={{ fontSize: 15, marginBottom: nota ? 2 : 12 }}>{titulo}</h3>
      {nota && <p style={{ color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 12 }}>{nota}</p>}
      {children}
    </section>
  );
}

/** Números de cabeçalho. Valor único com variação é stat tile, não gráfico. */
function KpiRow({ data }: { data: DashboardDTO }) {
  const k = data.kpis;
  const subiu = k.difference != null && k.difference > 0;
  const desceu = k.difference != null && k.difference < 0;

  const tiles = [
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
      detalhe: k.differencePercent == null ? '' : `${subiu ? '+' : ''}${k.differencePercent}% sobre o mês anterior`,
      icone: subiu ? <ArrowUp size={16} weight="bold" /> : desceu ? <ArrowDown size={16} weight="bold" /> : <Minus size={16} />,
      cor: subiu ? '#b3261e' : desceu ? '#2e7d32' : 'var(--color-text-muted)'
    },
    {
      label: 'Notas do mês',
      value: inteiro(k.contractsWithInvoice),
      detalhe: k.pendingInvoices > 0
        ? `${k.pendingInvoices} contrato(s) ainda sem nota`
        : 'todos os contratos lançados'
    },
    {
      label: 'Páginas impressas',
      value: inteiro(k.blackPages + k.colorPages),
      detalhe: `${inteiro(k.blackPages)} pretas · ${inteiro(k.colorPages)} coloridas`
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16 }}>
      {tiles.map(t => (
        <div key={t.label} style={{
          border: '1px solid var(--color-border)', borderRadius: 8,
          padding: 14, background: 'var(--color-surface)'
        }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {t.icone && <span style={{ color: t.cor, display: 'flex' }}>{t.icone}</span>}
            <strong style={{ fontSize: 24, letterSpacing: '-0.02em' }}>{t.value}</strong>
          </div>
          {t.detalhe && (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.detalhe}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Os mesmos números em tabela: nenhum valor fica preso dentro do gráfico. */
function TableView({ data }: { data: DashboardDTO }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Custo mensal</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mês</th>
              <th style={{ textAlign: 'right' }}>Contratos</th>
              <th style={{ textAlign: 'right' }}>Impressoras</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th style={{ textAlign: 'right' }}>Pretas</th>
              <th style={{ textAlign: 'right' }}>Coloridas</th>
            </tr>
          </thead>
          <tbody>
            {data.series.map((p, i) => (
              <tr key={p.competence}>
                <td>{p.competence.slice(0, 7)}</td>
                <td style={{ textAlign: 'right' }}>{money(p.contracts)}</td>
                <td style={{ textAlign: 'right' }}>{money(p.printers)}</td>
                <td style={{ textAlign: 'right' }}><strong>{money(p.total)}</strong></td>
                <td style={{ textAlign: 'right' }}>{inteiro(data.pages[i]?.blackPages ?? 0)}</td>
                <td style={{ textAlign: 'right' }}>{inteiro(data.pages[i]?.colorPages ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: 15, margin: '24px 0 12px' }}>Centros de custo do mês</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Setor</th>
              <th style={{ textAlign: 'right' }}>Centro de custo</th>
              <th style={{ textAlign: 'right' }}>Custo</th>
            </tr>
          </thead>
          <tbody>
            {data.bySector.map(s => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td style={{ textAlign: 'right' }}>{s.code ?? '—'}</td>
                <td style={{ textAlign: 'right' }}><strong>{money(s.value)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
