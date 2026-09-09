import { useEffect, useState } from 'react';
import { Printer as PrinterIcon, Plus, Trash } from '@phosphor-icons/react';
import { PrinterService } from '../services/PrinterService';
import { EnterpriseService, SectorService } from '../../Registry/services/RegistryService';
import type { PrinterDTO } from '../../../shared/types/Printer';
import type { EnterpriseDTO, SectorDTO } from '../../../shared/types/Registry';
import styles from '../../Stock/pages/ProductForm.module.css';

interface PrinterFormProps {
  printerToEdit?: PrinterDTO | null;
  onSuccess: () => void;
}

interface ShareRow {
  sectorId: string;
  percentage: number;
}

export function PrinterForm({ printerToEdit, onSuccess }: PrinterFormProps) {
  const [enterprises, setEnterprises] = useState<EnterpriseDTO[]>([]);
  const [sectors, setSectors] = useState<SectorDTO[]>([]);

  const [serialNumber, setSerialNumber] = useState(printerToEdit?.serialNumber ?? '');
  const [assetTag, setAssetTag] = useState(printerToEdit?.assetTag ?? '');
  const [model, setModel] = useState(printerToEdit?.model ?? '');
  const [ipAddress, setIpAddress] = useState(printerToEdit?.ipAddress ?? '');
  const [enterpriseId, setEnterpriseId] = useState(printerToEdit?.enterpriseId ?? '');
  const [autoRead, setAutoRead] = useState(printerToEdit?.autoRead ?? true);
  const [backup, setBackup] = useState(printerToEdit?.backup ?? false);
  const [active, setActive] = useState(printerToEdit?.active ?? true);
  const [shares, setShares] = useState<ShareRow[]>(
    printerToEdit?.shares.map(s => ({ sectorId: s.sectorId, percentage: Number(s.percentage) })) ?? []
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(printerToEdit);
  const somaRateio = shares.reduce((total, s) => total + Number(s.percentage || 0), 0);

  useEffect(() => {
    Promise.all([EnterpriseService.getAll(), SectorService.getAll()])
      .then(([empresas, setores]) => {
        setEnterprises(empresas);
        setSectors(setores);
        // Com uma empresa só, escolher não é decisão.
        setEnterpriseId(prev => prev || (empresas.length === 1 ? empresas[0].id : ''));
      })
      .catch(() => setError('Erro ao carregar empresas e setores.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      serialNumber, assetTag: assetTag || null, model: model || null,
      ipAddress: ipAddress || null, enterpriseId, autoRead, backup, active,
      shares: shares.map(s => ({ sectorId: s.sectorId, percentage: Number(s.percentage) }))
    };

    try {
      if (isEdit && printerToEdit) {
        await PrinterService.update(printerToEdit.id, payload);
      } else {
        await PrinterService.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao salvar a impressora.');
    } finally {
      setSaving(false);
    }
  };

  const disponiveis = sectors.filter(s => !shares.some(r => r.sectorId === s.id));

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card} style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <PrinterIcon size={28} color="#146556" weight="bold" />
          <h2 className={styles.title}>{isEdit ? 'Editar Impressora' : 'Nova Impressora'}</h2>
        </div>

        {error && (
          <p style={{ background: '#ffebee', color: '#b3261e', border: '1px solid #f5c2c0',
                      padding: '12px 14px', borderRadius: 6, marginBottom: 16 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Número de série</label>
              <input className={styles.input} value={serialNumber}
                     onChange={(e) => setSerialNumber(e.target.value)}
                     placeholder="Ex: BRBSQ58109" required />
              <small style={{ color: '#666', display: 'block' }}>
                É a chave que liga o cadastro à leitura do PrintWay.
              </small>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Patrimônio</label>
              <input className={styles.input} value={assetTag}
                     onChange={(e) => setAssetTag(e.target.value)} placeholder="Ex: 10188" />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>Modelo</label>
              <input className={styles.input} value={model}
                     onChange={(e) => setModel(e.target.value)} placeholder="Ex: HP Laser 408dn" />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className={styles.label}>IP</label>
              <input className={styles.input} value={ipAddress}
                     onChange={(e) => setIpAddress(e.target.value)} placeholder="Ex: 172.20.2.15" />
            </div>
          </div>

          <label className={styles.label}>Empresa</label>
          <select className={styles.input} value={enterpriseId}
                  onChange={(e) => setEnterpriseId(e.target.value)} required>
            <option value="" disabled>Escolha a empresa...</option>
            {enterprises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={autoRead} onChange={(e) => setAutoRead(e.target.checked)} />
              O PrintWay lê automaticamente
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={backup} onChange={(e) => setBackup(e.target.checked)} />
              Impressora reserva
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Ativa
            </label>
          </div>
          <small style={{ color: '#666' }}>
            Desmarque a leitura automática para a impressora que você digita todo mês.
          </small>

          <div>
            <label className={styles.label}>
              Rateio padrão — soma {somaRateio.toFixed(2).replace('.', ',')}%
            </label>
            <small style={{ color: '#666', display: 'block', marginBottom: 8 }}>
              Precisa fechar 100%, ou ficar vazio. Este é o padrão copiado para cada mês ao
              abrir a competência; mudar aqui não altera meses já fechados.
            </small>

            {shares.map((row, i) => (
              <div key={row.sectorId} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ flex: 1 }}>
                  {sectors.find(s => s.id === row.sectorId)?.name ?? 'setor removido'}
                </span>
                <input className={styles.input} style={{ width: 110 }}
                       type="number" min="0" max="100" step="0.01" value={row.percentage}
                       onChange={(e) => {
                         const copia = [...shares];
                         copia[i] = { ...row, percentage: Number(e.target.value) };
                         setShares(copia);
                       }} />
                <span>%</span>
                <button type="button" className={styles.input}
                        style={{ width: 42, cursor: 'pointer', color: '#d32f2f' }}
                        onClick={() => setShares(shares.filter((_, idx) => idx !== i))}
                        aria-label="Remover setor do rateio">
                  <Trash size={16} />
                </button>
              </div>
            ))}

            {disponiveis.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <select className={styles.input} style={{ flex: 1 }} value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          setShares([...shares, { sectorId: e.target.value, percentage: 0 }]);
                        }}>
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
            <button type="button" onClick={onSuccess} disabled={saving}
                    style={{ flex: 1, padding: 12, backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
                    style={{ flex: 1, padding: 12, backgroundColor: '#146556', color: 'white', border: 'none', borderRadius: 4, cursor: saving ? 'wait' : 'pointer', fontWeight: 'bold' }}>
              {saving ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
