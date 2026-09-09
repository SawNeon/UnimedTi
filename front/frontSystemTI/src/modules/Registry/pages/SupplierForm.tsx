import { useState } from 'react';
import { Storefront } from '@phosphor-icons/react';
import { SupplierService } from '../services/RegistryService';
import type { SupplierDTO } from '../../../shared/types/Registry';
import styles from '../../Stock/pages/ProductForm.module.css';

interface SupplierFormProps {
  supplierToEdit?: SupplierDTO | null;
  onSuccess: () => void;
}

export function SupplierForm({ supplierToEdit, onSuccess }: SupplierFormProps) {
  const [name, setName] = useState(supplierToEdit?.name ?? '');
  const [document, setDocument] = useState(supplierToEdit?.document ?? '');
  const [notes, setNotes] = useState(supplierToEdit?.notes ?? '');
  const [active, setActive] = useState(supplierToEdit?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(supplierToEdit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: name.trim(),
      document: document.trim() || null,
      notes: notes.trim() || null,
      active
    };

    try {
      if (isEdit && supplierToEdit) {
        await SupplierService.update(supplierToEdit.id, payload);
      } else {
        await SupplierService.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao salvar o fornecedor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <Storefront size={28} color="#146556" weight="bold" />
          <h2 className={styles.title}>{isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
        </div>

        {error && (
          <p style={{ background: '#ffebee', color: '#b3261e', border: '1px solid #f5c2c0',
                      padding: '12px 14px', borderRadius: 6, marginBottom: 16 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <label className={styles.label}>Nome</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Printec"
            required
          />

          <label className={styles.label}>CNPJ</label>
          <input
            className={styles.input}
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Ex: 10.197.494/0001-08"
          />
          <small style={{ color: '#666' }}>
            Como está na nota. Serve para conferir na hora de lançar; pode ficar em branco.
          </small>

          <label className={styles.label}>Observação</label>
          <input
            className={styles.input}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: contato do comercial, condição de pagamento"
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Ativo
          </label>
          <small style={{ color: '#666' }}>
            Fornecedor encerrado sai da lista de contratos novos, mas continua nos antigos.
          </small>

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
