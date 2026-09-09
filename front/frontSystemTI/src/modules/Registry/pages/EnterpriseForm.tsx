import { useState } from 'react';
import { Buildings } from '@phosphor-icons/react';
import { EnterpriseService } from '../services/RegistryService';
import type { EnterpriseDTO } from '../../../shared/types/Registry';
import styles from '../../Stock/pages/ProductForm.module.css';

interface EnterpriseFormProps {
  enterpriseToEdit?: EnterpriseDTO | null;
  onSuccess: () => void;
}

export function EnterpriseForm({ enterpriseToEdit, onSuccess }: EnterpriseFormProps) {
  const [name, setName] = useState(enterpriseToEdit?.name ?? '');
  const [locale, setLocale] = useState(enterpriseToEdit?.locale ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(enterpriseToEdit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEdit && enterpriseToEdit) {
        await EnterpriseService.update(enterpriseToEdit.id, { name, locale });
      } else {
        await EnterpriseService.create({ name, locale });
      }
      onSuccess();
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao salvar a empresa.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <Buildings size={28} color="#146556" weight="bold" />
          <h2 className={styles.title}>{isEdit ? 'Editar Empresa' : 'Nova Empresa'}</h2>
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
            placeholder="Ex: Operadora de Saúde"
            required
          />

          <label className={styles.label}>Localidade</label>
          <input
            className={styles.input}
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="Ex: Varginha"
            required
          />

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
