import { useEffect, useState } from 'react';
import { Buildings } from '@phosphor-icons/react';
import { EnterpriseService, SectorService } from '../services/RegistryService';
import type { EnterpriseDTO, SectorDTO } from '../../../shared/types/Registry';
import styles from '../../Stock/pages/ProductForm.module.css';

interface SectorFormProps {
  sectorToEdit?: SectorDTO | null;
  onSuccess: () => void;
}

/** Grupos usados no rateio. Livre para digitar, mas sugeridos para padronizar. */
const GRUPOS_SUGERIDOS = ['1. Administrativos', '2. Produtivos', '3. Apoios'];

export function SectorForm({ sectorToEdit, onSuccess }: SectorFormProps) {
  const [enterprises, setEnterprises] = useState<EnterpriseDTO[]>([]);
  const [name, setName] = useState(sectorToEdit?.name ?? '');
  const [enterpriseId, setEnterpriseId] = useState(sectorToEdit?.enterpriseId ?? '');
  const [groupName, setGroupName] = useState(sectorToEdit?.groupName ?? '');
  const [costCenterCode, setCostCenterCode] = useState<number | ''>(
    sectorToEdit?.costCenterCode ?? ''
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(sectorToEdit);

  useEffect(() => {
    EnterpriseService.getAll()
      .then((data) => {
        setEnterprises(data);
        // Com uma empresa só, escolher não é decisão: já vem preenchida.
        setEnterpriseId(prev => prev || (data.length === 1 ? data[0].id : ''));
      })
      .catch(() => setError('Erro ao carregar as empresas.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      enterpriseId,
      groupName,
      costCenterCode: Number(costCenterCode)
    };

    try {
      if (isEdit && sectorToEdit) {
        await SectorService.update(sectorToEdit.id, payload);
      } else {
        await SectorService.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao salvar o setor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <Buildings size={28} color="#146556" weight="bold" />
          <h2 className={styles.title}>{isEdit ? 'Editar Setor' : 'Novo Setor'}</h2>
        </div>

        {error && (
          <p style={{ background: '#ffebee', color: '#b3261e', border: '1px solid #f5c2c0',
                      padding: '12px 14px', borderRadius: 6, marginBottom: 16 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label className={styles.label}>Nome</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: UTI"
            required
          />

          <label className={styles.label}>Empresa</label>
          <select
            className={styles.input}
            value={enterpriseId}
            onChange={(e) => setEnterpriseId(e.target.value)}
            required
          >
            <option value="" disabled>Escolha a empresa...</option>
            {enterprises.map(enterprise => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.name}</option>
            ))}
          </select>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className={styles.label}>Centro de custo</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={costCenterCode}
                onChange={(e) => setCostCenterCode(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 83"
                required
              />
              <small style={{ color: '#666', display: 'block' }}>
                O código contábil usado no rateio.
              </small>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className={styles.label}>Grupo</label>
              <input
                className={styles.input}
                list="grupos-sugeridos"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: 2. Produtivos"
                required
              />
              <datalist id="grupos-sugeridos">
                {GRUPOS_SUGERIDOS.map(grupo => <option key={grupo} value={grupo} />)}
              </datalist>
              <small style={{ color: '#666', display: 'block' }}>
                Agrupamento usado nos relatórios.
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onSuccess}
              disabled={saving}
              style={{ flex: 1, padding: '12px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, padding: '12px', backgroundColor: '#146556', color: 'white', border: 'none', borderRadius: '4px', cursor: saving ? 'wait' : 'pointer', fontWeight: 'bold' }}
            >
              {saving ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
