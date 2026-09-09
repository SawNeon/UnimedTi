import { useState } from 'react';
import { ArrowsLeftRight, Plus, Trash, Lock, LockOpen } from '@phosphor-icons/react';
import { PrinterService } from '../services/PrinterService';
import type { ReadingDTO } from '../../../shared/types/Printer';
import type { SectorDTO } from '../../../shared/types/Registry';
import { distribuirIgualmente, rebalance, somaRateio } from '../../../shared/utils/rateio';
import type { ShareRow } from '../../../shared/utils/rateio';
import styles from '../../Stock/pages/ProductForm.module.css';

interface ReadingFormProps {
  reading: ReadingDTO;
  sectors: SectorDTO[];
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Lançamento manual e correção de uma leitura.
 *
 * O rateio editado aqui vale só para este mês: alterar não mexe nos meses
 * anteriores nem no padrão da impressora.
 */
export function ReadingForm({ reading, sectors, onSuccess, onCancel }: ReadingFormProps) {
  const [blackStart, setBlackStart] = useState(reading.blackStart);
  const [blackEnd, setBlackEnd] = useState(reading.blackEnd);
  const [colorStart, setColorStart] = useState(reading.colorStart);
  const [colorEnd, setColorEnd] = useState(reading.colorEnd);
  const [a3Black, setA3Black] = useState(reading.a3Black);
  const [a3Color, setA3Color] = useState(reading.a3Color);
  const [notes, setNotes] = useState(reading.notes ?? '');
  const [shares, setShares] = useState<ShareRow[]>(
    reading.shares.map(s => ({ sectorId: s.sectorId, percentage: Number(s.percentage) }))
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const soma = somaRateio(shares);

  /** Editar uma linha reequilibra as outras: a soma nunca passa de 100. */
  const alterarPercentual = (indice: number, valor: number) => {
    const copia = shares.map((row, i) => (i === indice ? { ...row, percentage: valor } : row));
    setShares(rebalance(copia, indice));
  };

  const adicionarSetor = (sectorId: string) => {
    const copia = [...shares, { sectorId, percentage: 0 }];
    // Sem nada definido ainda, divide igualmente; com divisão existente, o novo
    // setor entra tomando espaço proporcional dos demais.
    setShares(shares.length === 0 ? distribuirIgualmente(copia) : rebalance(copia, copia.length - 1));
  };

  const removerSetor = (indice: number) => {
    const restante = shares.filter((_, i) => i !== indice);
    setShares(restante.length === 0 ? [] : distribuirIgualmente(restante));
  };
  const consumoPreto = Math.max(0, blackEnd - blackStart) + Number(a3Black || 0);
  const consumoCor = Math.max(0, colorEnd - colorStart) + Number(a3Color || 0);
  const invertido = blackEnd < blackStart || colorEnd < colorStart;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await PrinterService.updateReading(reading.id, {
        blackStart, blackEnd, colorStart, colorEnd,
        a3Black: Number(a3Black || 0),
        a3Color: Number(a3Color || 0),
        notes: notes || null,
        shares: shares.map(s => ({ sectorId: s.sectorId, percentage: Number(s.percentage) }))
      });
      onSuccess();
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao salvar a leitura.');
    } finally {
      setSaving(false);
    }
  };

  // Só setores da empresa da impressora: uma impressora do Hospital não pode ser
  // rateada em centro de custo da Operadora.
  const daEmpresa = sectors.filter(s => !reading.enterpriseId || s.enterpriseId === reading.enterpriseId);
  const disponiveis = daEmpresa.filter(s => !shares.some(r => r.sectorId === s.id));

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card} style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <ArrowsLeftRight size={28} color="#146556" weight="bold" />
          <h2 className={styles.title}>{reading.serialNumber}</h2>
        </div>

        <p style={{ textAlign: 'center', color: '#666', marginTop: -6 }}>
          {reading.model ?? 'Modelo não informado'} · {reading.enterpriseName ?? 'sem empresa'}
          {reading.source === 'PRINTWAY' && ' · veio do PrintWay'}
        </p>

        {error && (
          <p style={{ background: '#ffebee', color: '#b3261e', border: '1px solid #f5c2c0',
                      padding: '12px 14px', borderRadius: 6, margin: '12px 0' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Contador preto — inicial</label>
              <input className={styles.input} type="number" min="0" value={blackStart}
                     onChange={(e) => setBlackStart(Number(e.target.value))} required />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Contador preto — final</label>
              <input className={styles.input} type="number" min="0" value={blackEnd}
                     onChange={(e) => setBlackEnd(Number(e.target.value))} required />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Contador cor — inicial</label>
              <input className={styles.input} type="number" min="0" value={colorStart}
                     onChange={(e) => setColorStart(Number(e.target.value))} required />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Contador cor — final</label>
              <input className={styles.input} type="number" min="0" value={colorEnd}
                     onChange={(e) => setColorEnd(Number(e.target.value))} required />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Páginas A3 preto</label>
              <input className={styles.input} type="number" min="0" value={a3Black}
                     onChange={(e) => setA3Black(Number(e.target.value))} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Páginas A3 cor</label>
              <input className={styles.input} type="number" min="0" value={a3Color}
                     onChange={(e) => setA3Color(Number(e.target.value))} />
            </div>
          </div>

          <div style={{
            background: invertido ? '#ffebee' : 'var(--color-brand-100)',
            border: `1px solid ${invertido ? '#f5c2c0' : 'var(--color-border)'}`,
            borderRadius: 6, padding: '10px 14px'
          }}>
            {invertido ? (
              <strong style={{ color: '#b3261e' }}>
                O contador final está menor que o inicial. Confira antes de salvar — pode ser
                impressora trocada, contador zerado ou digitação errada.
              </strong>
            ) : (
              <span>
                Consumo do mês: <strong>{consumoPreto.toLocaleString('pt-BR')}</strong> pretas
                {' e '}<strong>{consumoCor.toLocaleString('pt-BR')}</strong> coloridas
                {' '}(A3 já incluído)
              </span>
            )}
          </div>

          <label className={styles.label}>Observação</label>
          <input className={styles.input} value={notes} onChange={(e) => setNotes(e.target.value)}
                 placeholder="Ex: contador conferido no painel da impressora" />

          <div>
            <label className={styles.label}>
              Rateio deste mês — soma {soma.toFixed(2).replace('.', ',')}%
            </label>
            <small style={{ color: '#666', display: 'block', marginBottom: 8 }}>
              Vale só para este mês. Alterar aqui não mexe nos meses anteriores nem no
              padrão da impressora. Deixe vazio para a impressora reserva ainda sem setor.
            </small>

            {shares.map((row, i) => (
              <div key={row.sectorId} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ flex: 1 }}>
                  {sectors.find(s => s.id === row.sectorId)?.name ?? 'setor removido'}
                </span>
                <input
                  className={styles.input}
                  style={{ width: 110 }}
                  type="number" min="0" max="100" step="0.01"
                  value={row.percentage}
                  onChange={(e) => alterarPercentual(i, Number(e.target.value))}
                />
                <span>%</span>
                <button type="button" className={styles.input}
                        style={{ width: 42, cursor: 'pointer', color: row.locked ? '#146556' : '#666' }}
                        onClick={() => setShares(shares.map((r, idx) => idx === i ? { ...r, locked: !r.locked } : r))}
                        title={row.locked ? 'Destravar: volta a absorver ajustes' : 'Travar: mantém o valor quando outra linha mudar'}
                        aria-label={row.locked ? 'Destravar percentual' : 'Travar percentual'}>
                  {row.locked ? <Lock size={16} /> : <LockOpen size={16} />}
                </button>
                <button type="button" className={styles.input}
                        style={{ width: 42, cursor: 'pointer', color: '#d32f2f' }}
                        onClick={() => removerSetor(i)}
                        aria-label="Remover setor do rateio">
                  <Trash size={16} />
                </button>
              </div>
            ))}

            {disponiveis.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className={styles.input}
                  style={{ flex: 1 }}
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    adicionarSetor(e.target.value);
                  }}
                >
                  <option value="">+ Adicionar setor ao rateio...</option>
                  {disponiveis.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (cc {s.costCenterCode})</option>
                  ))}
                </select>
                <Plus size={20} style={{ alignSelf: 'center', color: '#666' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={onCancel} disabled={saving}
                    style={{ flex: 1, padding: 12, backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
                    style={{ flex: 1, padding: 12, backgroundColor: '#146556', color: 'white', border: 'none', borderRadius: 4, cursor: saving ? 'wait' : 'pointer', fontWeight: 'bold' }}>
              {saving ? 'Salvando...' : 'Salvar leitura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
