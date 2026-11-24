import { useCallback, useEffect, useRef, useState } from 'react';
import { PencilSimple, Warning, UploadSimple, CalendarPlus, FilePdf } from '@phosphor-icons/react';
import { PrinterService } from '../services/PrinterService';
import type { ClosingDTO, ImportResultDTO, ReadingDTO } from '../../../shared/types/Printer';
import styles from '../../Users/pages/UserList.module.css';

interface PrinterClosingProps {
  canOperate: boolean;
  onEditReading: (reading: ReadingDTO) => void;
  /** Muda quando uma leitura é salva, para a tela recarregar. */
  reloadToken?: number;
}

function apiMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })
    .response?.data?.message ?? fallback;
}

const money = (v: number) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const number = (v: number) => Number(v).toLocaleString('pt-BR');

export function PrinterClosing({ canOperate, onEditReading, reloadToken }: PrinterClosingProps) {
  const [competence, setCompetence] = useState(() => new Date().toISOString().slice(0, 7));
  const [readings, setReadings] = useState<ReadingDTO[]>([]);
  const [closing, setClosing] = useState<ClosingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResultDTO | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await PrinterService.readings(`${competence}-01`);
      setReadings(lista);
      setError(null);

      // O fechamento só existe quando há leitura; sem isso o backend responde
      // que falta preço, e a mensagem confundiria mais que ajudar.
      if (lista.length > 0) {
        setClosing(await PrinterService.closing(`${competence}-01`));
      } else {
        setClosing(null);
      }
    } catch (err) {
      setError(apiMessage(err, 'Erro ao carregar o fechamento.'));
    } finally {
      setLoading(false);
    }
  }, [competence]);

  useEffect(() => { load(); }, [load, reloadToken]);

  const handleOpen = async () => {
    try {
      await PrinterService.openCompetence(`${competence}-01`);
      setImportResult(null);
      await load();
    } catch (err) {
      setError(apiMessage(err, 'Erro ao abrir a competência.'));
    }
  };

  const handleImport = async (file: File) => {
    try {
      setImportResult(await PrinterService.importPrintWay(`${competence}-01`, file));
      setError(null);
      await load();
    } catch (err) {
      setError(apiMessage(err, 'Erro ao importar o arquivo.'));
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const marcadores = (r: ReadingDTO) => {
    const marcas: { texto: string; classe: string }[] = [];
    if (r.pending) marcas.push({ texto: 'NÃO INFORMADA', classe: styles.inactiveBadge });
    if (r.inconsistent) marcas.push({ texto: 'CONTADOR INVERTIDO', classe: styles.lowStock });
    if (r.withoutShares) marcas.push({ texto: 'SEM RATEIO', classe: styles.lowStock });
    if (r.corrected) marcas.push({ texto: 'CORRIGIDA', classe: styles.profileTag });
    return marcas;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Fechamento de impressoras</h2>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="month"
              className={styles.searchInput}
              style={{ minWidth: 0, maxWidth: 170 }}
              value={competence}
              onChange={(e) => setCompetence(e.target.value)}
            />

            {canOperate && (
              <>
                <button className={styles.pageButton} onClick={handleOpen} title="Cria as leituras do mês com o contador inicial do fechamento anterior">
                  <CalendarPlus size={16} /> Abrir mês
                </button>

                <button className={styles.pageButton} onClick={() => fileInput.current?.click()}>
                  <UploadSimple size={16} /> Importar PrintWay
                </button>

                <input
                  ref={fileInput}
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                  }}
                />
              </>
            )}
          </div>
        </div>

        {error && <div className={styles.feedback}>{error}</div>}

        {importResult && (
          <div className={styles.feedback} style={{ background: '#eef7f2', color: '#14532d', borderColor: '#bfe3d0' }}>
            <strong>{importResult.atualizadas} leitura(s) atualizada(s)</strong> de {importResult.linhasLidas} linha(s) no arquivo.
            {importResult.seriesDesconhecidas.length > 0 && (
              <div>Séries fora do cadastro ({importResult.seriesDesconhecidas.length}): {importResult.seriesDesconhecidas.slice(0, 8).join(', ')}
                {importResult.seriesDesconhecidas.length > 8 && ' ...'}</div>
            )}
            {importResult.semLeituraNoArquivo.length > 0 && (
              <div>Sem leitura no arquivo, preencha à mão: {importResult.semLeituraNoArquivo.join(', ')}</div>
            )}
            {importResult.inconsistentes.length > 0 && (
              <div>Contador invertido: {importResult.inconsistentes.join(', ')}</div>
            )}
          </div>
        )}

        {closing && <ClosingSummary closing={closing} />}

        {loading ? (
          <p style={{ padding: 20 }}>Carregando...</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Série</th>
                  <th>Modelo</th>
                  <th>Empresa</th>
                  <th style={{ textAlign: 'right' }}>Inicial</th>
                  <th style={{ textAlign: 'right' }}>Final</th>
                  <th style={{ textAlign: 'right' }}>Preto</th>
                  <th style={{ textAlign: 'right' }}>Cor</th>
                  <th>Rateio</th>
                  <th>Situação</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {readings.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 20 }}>
                      Nenhuma leitura neste mês. Use <strong>Abrir mês</strong> para criar as leituras a partir do fechamento anterior.
                    </td>
                  </tr>
                ) : (
                  readings.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.serialNumber}</strong></td>
                      <td style={{ color: '#666' }}>
                        <div className={styles.ellipsis} title={r.model ?? ''}>{r.model ?? '—'}</div>
                      </td>
                      <td style={{ color: '#666' }}>{r.enterpriseName ?? '—'}</td>
                      <td style={{ textAlign: 'right', color: '#666' }}>{number(r.blackStart)}</td>
                      <td style={{ textAlign: 'right' }}>{number(r.blackEnd)}</td>
                      <td style={{ textAlign: 'right' }}><strong>{number(r.blackConsumption)}</strong></td>
                      <td style={{ textAlign: 'right' }}>{number(r.colorConsumption)}</td>
                      <td style={{ fontSize: 12, color: '#666' }}>
                        {r.shares.length === 0
                          ? '—'
                          : r.shares.map(s => `${s.sectorName} ${s.percentage}%`).join(' · ')}
                      </td>
                      <td>
                        {marcadores(r).map(m => (
                          <span key={m.texto} className={m.classe} style={{ marginRight: 4 }}>{m.texto}</span>
                        ))}
                        {marcadores(r).length === 0 && <span className={styles.activeBadge}>OK</span>}
                      </td>
                      <td className={styles.actionsCell} style={{ textAlign: 'center' }}>
                        {canOperate && (
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => onEditReading(r)}
                            title="Lançar ou corrigir"
                            aria-label={`Lançar ou corrigir ${r.serialNumber}`}
                          >
                            <PencilSimple size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

type SectorRow = ClosingDTO['sectors'][number];

/** Baixa o PDF de uma empresa. O erro vira alerta: o download não tem onde falhar em silêncio. */
async function baixarPdf(competence: string, enterpriseId: string, enterpriseName: string) {
  try {
    await PrinterService.closingPdf(competence, enterpriseId);
  } catch (err) {
    alert(apiMessage(err, `Não foi possível gerar o PDF de ${enterpriseName}.`));
  }
}

/**
 * Agrupa os centros de custo pela empresa dona, preservando a ordem que veio do
 * backend (já ordenada por empresa e depois por setor).
 */
function porEmpresa(closing: ClosingDTO) {
  const grupos = new Map<string, {
    enterpriseId: string | null;
    enterpriseName: string;
    linhas: SectorRow[];
    total: number;
  }>();

  for (const linha of closing.sectors) {
    const chave = linha.enterpriseName;
    const grupo = grupos.get(chave)
      ?? { enterpriseId: linha.enterpriseId, enterpriseName: chave, linhas: [] as SectorRow[], total: 0 };
    grupo.linhas.push(linha);
    grupo.total += Number(linha.cost);
    grupos.set(chave, grupo);
  }

  return [...grupos.values()];
}

/** Custo por empresa, rateio por centro de custo e o que impede fechar. */
function ClosingSummary({ closing }: { closing: ClosingDTO }) {
  const p = closing.pendencies;
  const temPendencia = p.naoInformadas.length > 0 || p.contadorInvertido.length > 0 || p.semRateio.length > 0;

  return (
    <div style={{ padding: '0 24px 8px' }}>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 10 }}>
        Página preta {money(closing.blackPageCost)} · colorida {money(closing.colorPageCost)}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        {closing.enterprises.map(e => (
          <div key={e.enterpriseId} style={{
            flex: '1 1 240px', border: '1px solid var(--color-border)',
            borderRadius: 8, padding: 12, background: 'var(--color-surface)'
          }}>
            <strong>{e.enterpriseName}</strong>
            {!e.includedInTotal && (
              <span className={styles.inactiveBadge} style={{ marginLeft: 6 }}>FORA DO TOTAL</span>
            )}
            <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
              <div>{number(e.blackPages)} pretas · {money(e.blackCost)}</div>
              <div>
                {number(e.colorPages)} coloridas · {money(e.colorCost)}
                {e.franchiseApplied && <span className={styles.profileTag} style={{ marginLeft: 6 }}>FRANQUIA</span>}
              </div>
              {Number(e.fixedCharge) > 0 && <div>Acréscimo fixo · {money(e.fixedCharge)}</div>}
            </div>
            <div style={{ marginTop: 8, fontWeight: 750, color: 'var(--color-brand-700)' }}>
              {money(e.total)}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontWeight: 750, marginBottom: 10 }}>
        Total do mês: <span style={{ color: 'var(--color-brand-700)' }}>{money(closing.total)}</span>
      </p>

      {temPendencia && (
        <div className={styles.feedback} style={{ margin: '0 0 12px' }}>
          <Warning size={16} weight="bold" style={{ verticalAlign: 'middle', marginRight: 6 }} />
          <strong>Pendências antes de fechar:</strong>
          {p.naoInformadas.length > 0 && <div>Sem contagem informada: {p.naoInformadas.join(', ')}</div>}
          {p.contadorInvertido.length > 0 && <div>Contador invertido: {p.contadorInvertido.join(', ')}</div>}
          {p.semRateio.length > 0 && (
            <div>Sem rateio ({number(p.paginasSemRateio)} páginas fora do centro de custo): {p.semRateio.join(', ')}</div>
          )}
        </div>
      )}

      {closing.sectors.length > 0 && (
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 700, marginBottom: 8 }}>
            Rateio por centro de custo ({closing.sectors.length})
          </summary>

          {/* Uma tabela por empresa. O código de centro de custo só é único dentro
              do CNPJ, então uma lista única faria dois setores diferentes com o
              mesmo código parecerem o mesmo setor. */}
          {porEmpresa(closing).map(grupo => (
            <div key={grupo.enterpriseName} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '10px 0 6px' }}>
                <h4 style={{ fontSize: 14, margin: 0 }}>
                  {grupo.enterpriseName}
                  <span style={{ fontWeight: 400, color: '#666', marginLeft: 8 }}>
                    {grupo.linhas.length} centro(s) de custo · {money(grupo.total)}
                  </span>
                </h4>
                {grupo.enterpriseId && (
                  <button
                    className={styles.pageButton}
                    onClick={() => baixarPdf(closing.competence, grupo.enterpriseId!, grupo.enterpriseName)}
                    title="Baixa a tabela desta empresa em PDF, para anexar à nota"
                  >
                    <FilePdf size={16} /> PDF
                  </button>
                )}
              </div>
              <div className={styles.tableContainer} style={{ maxHeight: 300 }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Setor</th>
                      <th style={{ textAlign: 'right' }}>Centro de custo</th>
                      <th style={{ textAlign: 'right' }}>Pirâmide</th>
                      <th style={{ textAlign: 'right' }}>Pretas</th>
                      <th style={{ textAlign: 'right' }}>Coloridas</th>
                      <th style={{ textAlign: 'right' }}>Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.linhas.map(s => (
                      <tr key={s.sectorId}>
                        <td>{s.sectorName}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={styles.profileTag}>{s.costCenterCode}</span>
                        </td>
                        <td style={{ textAlign: 'right', color: '#666' }}>{s.pyramidCode ?? '—'}</td>
                        <td style={{ textAlign: 'right' }}>{number(s.blackPages)}</td>
                        <td style={{ textAlign: 'right' }}>{number(s.colorPages)}</td>
                        <td style={{ textAlign: 'right' }}><strong>{money(s.cost)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
            O custo por setor usa só o preço por página. Franquia e acréscimo fixo são do
            contrato da empresa, não de um centro específico — por isso esta soma não
            fecha com o total quando há franquia.
          </p>
        </details>
      )}
    </div>
  );
}
