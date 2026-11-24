import { useCallback, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Minus, FilePdf } from '@phosphor-icons/react';
import { DashboardService } from '../services/DashboardService';
import { LineChart } from '../components/Charts';
import { Bloco, PanelToolbar, StatTiles, inteiro, mesLongo, money } from '../components/Panel';
import { PrinterService } from '../../Printers/services/PrinterService';
import type { PrintersDashboardDTO } from '../../../shared/types/Dashboard';
import styles from '../../Users/pages/UserList.module.css';

const CORES = ['var(--viz-series-1)', 'var(--viz-series-2)', 'var(--viz-series-3)'];

/**
 * Painel das impressoras — volume e repasse.
 *
 * Vem da planilha de contagem de páginas e reproduz a aba de gráficos dela, que
 * compara empresa por empresa e cor por cor. O rateio por centro de custo mora
 * aqui, com o PDF que vai anexado à nota.
 */
export function PrintersDashboard() {
  const [competence, setCompetence] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<PrintersDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabela, setTabela] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await DashboardService.printers(`${competence}-01`));
      setError(null);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao carregar o painel de impressoras.');
    } finally {
      setLoading(false);
    }
  }, [competence]);

  useEffect(() => { load(); }, [load]);

  const meses = data?.pages.map(p => p.competence) ?? [];

  return (
    <div className={`${styles.pageContainer} viz-root`}>
      <div className={styles.card} style={{ padding: '0 0 20px' }}>
        <PanelToolbar
          titulo="Impressão por setor"
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
                {/* Preto e cor em gráficos separados de propósito: o volume em
                    preto é cerca de cem vezes o colorido, e um eixo compartilhado
                    achataria a linha colorida até ela parecer constante. Dois
                    eixos no mesmo gráfico seria pior ainda. */}
                <Bloco titulo="Páginas em preto por empresa"
                       nota="Uma linha por empresa, mês a mês.">
                  <LineChart
                    labels={meses}
                    series={data.byEnterprise.map((e, i) => ({
                      label: e.enterpriseName,
                      color: CORES[i % CORES.length],
                      points: e.blackPages
                    }))}
                    format={inteiro}
                  />
                </Bloco>

                <Bloco titulo="Páginas coloridas por empresa"
                       nota="Mesmo eixo de meses, escala própria — o volume colorido é muito menor.">
                  <LineChart
                    labels={meses}
                    series={data.byEnterprise.map((e, i) => ({
                      label: e.enterpriseName,
                      color: CORES[i % CORES.length],
                      points: e.colorPages
                    }))}
                    format={inteiro}
                  />
                </Bloco>

                <Bloco titulo="Custo mensal da impressão"
                       nota="Pelo fechamento de cada competência, com a franquia já aplicada.">
                  <LineChart
                    labels={data.cost.map(p => p.competence)}
                    series={[{
                      label: 'Impressão',
                      color: 'var(--viz-series-1)',
                      points: data.cost.map(p => p.value)
                    }]}
                  />
                </Bloco>

                <Rateio data={data} competence={competence} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpis({ data }: { data: PrintersDashboardDTO }) {
  const k = data.kpis;
  const subiu = k.difference != null && k.difference > 0;
  const desceu = k.difference != null && k.difference < 0;

  return (
    <StatTiles tiles={[
      {
        label: `Custo do ano ${k.year}`,
        value: money(k.yearCost),
        detalhe: `${inteiro(k.yearBlackPages + k.yearColorPages)} páginas no ano`
      },
      {
        label: 'Custo do mês',
        value: money(k.monthCost),
        detalhe: k.previousCost == null
          ? 'sem mês anterior para comparar'
          : `mês anterior ${money(k.previousCost)}`
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
        label: 'Páginas do mês',
        value: inteiro(k.blackPages + k.colorPages),
        detalhe: `${inteiro(k.blackPages)} pretas · ${inteiro(k.colorPages)} coloridas`
      },
      {
        label: 'Contagens pendentes',
        value: inteiro(k.pendingReadings),
        detalhe: k.pendingReadings > 0
          ? 'impressora(s) sem contagem informada'
          : 'todas as impressoras informadas'
      }
    ]} />
  );
}

/**
 * Rateio do mês, uma tabela por empresa, cada uma com o seu PDF.
 *
 * O código do centro de custo só é único dentro do CNPJ, então uma lista única
 * faria dois setores diferentes com o mesmo código parecerem o mesmo setor.
 */
function Rateio({ data, competence }: { data: PrintersDashboardDTO; competence: string }) {
  const baixar = async (enterpriseId: string, enterpriseName: string) => {
    try {
      await PrinterService.closingPdf(`${competence}-01`, enterpriseId);
    } catch {
      alert(`Não foi possível gerar o PDF de ${enterpriseName}.`);
    }
  };

  if (data.costCenters.length === 0) {
    return (
      <Bloco titulo={`Rateio por centro de custo em ${mesLongo(data.competence)}`}>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Nenhum rateio neste mês. Abra a competência no fechamento de impressoras.
        </p>
      </Bloco>
    );
  }

  return (
    <Bloco titulo={`Rateio por centro de custo em ${mesLongo(data.competence)}`}
           nota="Uma tabela por empresa. O PDF de cada uma é o que vai anexado à nota, no formato que o Financeiro já recebe.">
      {data.costCenters.map(empresa => (
        <div key={empresa.enterpriseId} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h4 style={{ fontSize: 14, margin: 0 }}>
              {empresa.enterpriseName}
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                {empresa.costCenters.length} centro(s) de custo · {money(empresa.total)}
              </span>
            </h4>
            <button className={styles.pageButton}
                    onClick={() => baixar(empresa.enterpriseId, empresa.enterpriseName)}
                    title="Baixa a tabela desta empresa em PDF, para anexar à nota">
              <FilePdf size={16} /> PDF
            </button>
          </div>

          <div className={styles.tableContainer} style={{ maxHeight: 340 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Centro de custo</th>
                  <th style={{ textAlign: 'right' }}>Código</th>
                  <th style={{ textAlign: 'right' }}>Pirâmide</th>
                  <th style={{ textAlign: 'right' }}>Pretas</th>
                  <th style={{ textAlign: 'right' }}>Coloridas</th>
                  <th style={{ textAlign: 'right' }}>Custo</th>
                </tr>
              </thead>
              <tbody>
                {empresa.costCenters.map(cc => (
                  <tr key={cc.sectorId}>
                    <td>{cc.sectorName}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={styles.profileTag}>{cc.costCenterCode}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>
                      {cc.pyramidCode ?? '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>{inteiro(cc.blackPages)}</td>
                    <td style={{ textAlign: 'right' }}>{inteiro(cc.colorPages)}</td>
                    <td style={{ textAlign: 'right' }}><strong>{money(cc.cost)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </Bloco>
  );
}

/** Os mesmos números em tabela: nenhum valor fica preso dentro do gráfico. */
function Tabelas({ data }: { data: PrintersDashboardDTO }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Páginas e custo por mês</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mês</th>
              <th style={{ textAlign: 'right' }}>Pretas</th>
              <th style={{ textAlign: 'right' }}>Coloridas</th>
              <th style={{ textAlign: 'right' }}>Custo</th>
            </tr>
          </thead>
          <tbody>
            {data.pages.map((p, i) => (
              <tr key={p.competence}>
                <td>{p.competence.slice(0, 7)}</td>
                <td style={{ textAlign: 'right' }}>{inteiro(p.blackPages)}</td>
                <td style={{ textAlign: 'right' }}>{inteiro(p.colorPages)}</td>
                <td style={{ textAlign: 'right' }}>
                  <strong>{money(data.cost[i]?.value ?? 0)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: 15, margin: '24px 0 12px' }}>
        Páginas por empresa em {mesLongo(data.competence)}
      </h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Empresa</th>
              <th style={{ textAlign: 'right' }}>Pretas</th>
              <th style={{ textAlign: 'right' }}>Coloridas</th>
            </tr>
          </thead>
          <tbody>
            {data.byEnterprise.map(e => (
              <tr key={e.enterpriseId}>
                <td>{e.enterpriseName}</td>
                <td style={{ textAlign: 'right' }}>
                  {inteiro(e.blackPages[e.blackPages.length - 1] ?? 0)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {inteiro(e.colorPages[e.colorPages.length - 1] ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
