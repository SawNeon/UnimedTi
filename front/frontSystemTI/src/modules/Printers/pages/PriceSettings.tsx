import { useCallback, useEffect, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { PrinterService } from '../services/PrinterService';
import { EnterpriseService } from '../../Registry/services/RegistryService';
import type { PriceDTO, TermsDTO } from '../../../shared/types/Printer';
import type { EnterpriseDTO } from '../../../shared/types/Registry';
import styles from '../../Users/pages/UserList.module.css';

interface PriceSettingsProps {
  canOperate: boolean;
}

function apiMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })
    .response?.data?.message ?? fallback;
}

const money = (v: number, casas = 4) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: casas });

const mesLabel = (iso: string) => iso.slice(0, 7);
const hojeMes = () => new Date().toISOString().slice(0, 7);

/**
 * Preço da página e condições por empresa, versionados por vigência.
 *
 * O valor vale A PARTIR do mês informado e continua valendo até alguém definir
 * outro — então um reajuste nunca reescreve mês já fechado, e o preço não precisa
 * ser redigitado todo mês.
 */
export function PriceSettings({ canOperate }: PriceSettingsProps) {
  const [prices, setPrices] = useState<PriceDTO[]>([]);
  const [terms, setTerms] = useState<TermsDTO[]>([]);
  const [enterprises, setEnterprises] = useState<EnterpriseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, t, e] = await Promise.all([
        PrinterService.prices(), PrinterService.terms(), EnterpriseService.getAll()
      ]);
      setPrices(p); setTerms(t); setEnterprises(e);
      setError(null);
    } catch (err) {
      setError(apiMessage(err, 'Erro ao carregar os preços.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className={styles.card}><p style={{ padding: 20 }}>Carregando...</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card} style={{ padding: '0 0 24px' }}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Preços e condições</h2>
        </div>

        {error && <div className={styles.feedback}>{error}</div>}

        <div style={{ padding: '0 24px' }}>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>
            Cada valor vale a partir do mês informado e segue valendo até você definir
            outro. Reajustar em novembro não altera outubro, e você não precisa
            redigitar o preço todo mês.
          </p>

          <PriceSection prices={prices} canOperate={canOperate} onSaved={load} onError={setError} />

          <TermsSection terms={terms} enterprises={enterprises} canOperate={canOperate}
                        onSaved={load} onError={setError} />
        </div>
      </div>
    </div>
  );
}

function PriceSection({ prices, canOperate, onSaved, onError }: {
  prices: PriceDTO[]; canOperate: boolean;
  onSaved: () => void; onError: (m: string | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [validFrom, setValidFrom] = useState(hojeMes());
  const [preto, setPreto] = useState('');
  const [cor, setCor] = useState('');
  const [salvando, setSalvando] = useState(false);

  const vigente = prices[0];

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await PrinterService.savePrice({
        validFrom: `${validFrom}-01`,
        blackPageCost: Number(preto),
        colorPageCost: Number(cor)
      });
      setAberto(false); setPreto(''); setCor('');
      onError(null);
      onSaved();
    } catch (err) {
      onError(apiMessage(err, 'Erro ao salvar o preço.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h3 style={{ fontSize: 15 }}>Preço da página</h3>
        {canOperate && (
          <button className={styles.pageButton} onClick={() => setAberto(v => !v)}>
            <Plus size={14} /> {aberto ? 'Cancelar' : 'Novo preço'}
          </button>
        )}
      </div>

      {vigente && (
        <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
          Vigente desde {mesLabel(vigente.validFrom)}: preta {money(vigente.blackPageCost)} ·
          colorida {money(vigente.colorPageCost)}
        </p>
      )}

      {aberto && (
        <form onSubmit={salvar} style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
          border: '1px solid var(--color-border)', borderRadius: 8, padding: 14, marginBottom: 14
        }}>
          <Campo label="Vale a partir de">
            <input type="month" className={styles.searchInput} style={{ minWidth: 0, width: 150 }}
                   value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
          </Campo>
          <Campo label="Página preta (R$)">
            <input type="number" step="0.0001" min="0" className={styles.searchInput}
                   style={{ minWidth: 0, width: 140 }} value={preto}
                   onChange={(e) => setPreto(e.target.value)} placeholder="0,0838" required />
          </Campo>
          <Campo label="Página colorida (R$)">
            <input type="number" step="0.0001" min="0" className={styles.searchInput}
                   style={{ minWidth: 0, width: 140 }} value={cor}
                   onChange={(e) => setCor(e.target.value)} placeholder="0,9104" required />
          </Campo>
          <button type="submit" disabled={salvando}
                  style={{ padding: '10px 16px', background: '#146556', color: '#fff',
                           border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vigência</th>
              <th style={{ textAlign: 'right' }}>Página preta</th>
              <th style={{ textAlign: 'right' }}>Página colorida</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => (
              <tr key={p.id}>
                <td>
                  <strong>{mesLabel(p.validFrom)}</strong>
                  {i === 0 && <span className={styles.activeBadge} style={{ marginLeft: 8 }}>VIGENTE</span>}
                </td>
                <td style={{ textAlign: 'right' }}>{money(p.blackPageCost)}</td>
                <td style={{ textAlign: 'right' }}>{money(p.colorPageCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TermsSection({ terms, enterprises, canOperate, onSaved, onError }: {
  terms: TermsDTO[]; enterprises: EnterpriseDTO[]; canOperate: boolean;
  onSaved: () => void; onError: (m: string | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [validFrom, setValidFrom] = useState(hojeMes());
  const [enterpriseId, setEnterpriseId] = useState('');
  const [limite, setLimite] = useState('');
  const [valorFranquia, setValorFranquia] = useState('');
  const [fixo, setFixo] = useState('');
  const [noTotal, setNoTotal] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await PrinterService.saveTerms({
        validFrom: `${validFrom}-01`,
        enterpriseId,
        colorFranchiseLimit: Number(limite || 0),
        colorFranchiseValue: Number(valorFranquia || 0),
        fixedCharge: Number(fixo || 0),
        includedInTotal: noTotal
      });
      setAberto(false); setLimite(''); setValorFranquia(''); setFixo('');
      onError(null);
      onSaved();
    } catch (err) {
      onError(apiMessage(err, 'Erro ao salvar as condições.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <h3 style={{ fontSize: 15 }}>Franquia e acréscimo por empresa</h3>
        {canOperate && (
          <button className={styles.pageButton} onClick={() => setAberto(v => !v)}>
            <Plus size={14} /> {aberto ? 'Cancelar' : 'Nova condição'}
          </button>
        )}
      </div>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
        Até o limite de páginas coloridas cobra-se o valor da franquia; acima dele,
        por página. O acréscimo fixo é o Plantão. Empresa de serviço próprio pode
        ficar fora do total do fechamento.
      </p>

      {aberto && (
        <form onSubmit={salvar} style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
          border: '1px solid var(--color-border)', borderRadius: 8, padding: 14, marginBottom: 14
        }}>
          <Campo label="Vale a partir de">
            <input type="month" className={styles.searchInput} style={{ minWidth: 0, width: 150 }}
                   value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
          </Campo>
          <Campo label="Empresa">
            <select className={styles.searchInput} style={{ minWidth: 0, width: 180 }}
                    value={enterpriseId} onChange={(e) => setEnterpriseId(e.target.value)} required>
              <option value="" disabled>Escolha...</option>
              {enterprises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Campo>
          <Campo label="Limite de páginas cor">
            <input type="number" min="0" className={styles.searchInput} style={{ minWidth: 0, width: 140 }}
                   value={limite} onChange={(e) => setLimite(e.target.value)} placeholder="1000" />
          </Campo>
          <Campo label="Valor da franquia (R$)">
            <input type="number" step="0.01" min="0" className={styles.searchInput} style={{ minWidth: 0, width: 150 }}
                   value={valorFranquia} onChange={(e) => setValorFranquia(e.target.value)} placeholder="911,41" />
          </Campo>
          <Campo label="Acréscimo fixo (R$)">
            <input type="number" step="0.01" min="0" className={styles.searchInput} style={{ minWidth: 0, width: 150 }}
                   value={fixo} onChange={(e) => setFixo(e.target.value)} placeholder="2485,68" />
          </Campo>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingBottom: 8 }}>
            <input type="checkbox" checked={noTotal} onChange={(e) => setNoTotal(e.target.checked)} />
            Entra no total
          </label>
          <button type="submit" disabled={salvando}
                  style={{ padding: '10px 16px', background: '#146556', color: '#fff',
                           border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vigência</th>
              <th>Empresa</th>
              <th style={{ textAlign: 'right' }}>Limite cor</th>
              <th style={{ textAlign: 'right' }}>Franquia</th>
              <th style={{ textAlign: 'right' }}>Acréscimo fixo</th>
              <th style={{ textAlign: 'center' }}>No total</th>
            </tr>
          </thead>
          <tbody>
            {terms.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>
                  Nenhuma condição definida. Sem franquia, a cor é cobrada por página.
                </td>
              </tr>
            ) : terms.map(t => (
              <tr key={t.id}>
                <td><strong>{mesLabel(t.validFrom)}</strong></td>
                <td>{t.enterpriseName}</td>
                <td style={{ textAlign: 'right' }}>
                  {t.colorFranchiseLimit > 0 ? t.colorFranchiseLimit.toLocaleString('pt-BR') : '—'}
                </td>
                <td style={{ textAlign: 'right' }}>{money(t.colorFranchiseValue, 2)}</td>
                <td style={{ textAlign: 'right' }}>{money(t.fixedCharge, 2)}</td>
                <td style={{ textAlign: 'center' }}>
                  {t.includedInTotal
                    ? <span className={styles.activeBadge}>SIM</span>
                    : <span className={styles.inactiveBadge}>FORA</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>{label}</span>
      {children}
    </div>
  );
}
