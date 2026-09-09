import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { SupplierService } from '../services/RegistryService';
import type { SupplierDTO } from '../../../shared/types/Registry';
import styles from '../../Users/pages/UserList.module.css';

interface SupplierListProps {
  onEdit: (supplier: SupplierDTO) => void;
  canOperate: boolean;
}

function apiMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })
    .response?.data?.message ?? fallback;
}

/** Empresas fornecedoras — quem emite a nota dos contratos. */
export function SupplierList({ onEdit, canOperate }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSuppliers(await SupplierService.getAll());
      setError(null);
    } catch (err) {
      setError(apiMessage(err, 'Erro ao carregar os fornecedores.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (supplier: SupplierDTO) => {
    if (!window.confirm(`Excluir o fornecedor ${supplier.name}?`)) return;

    try {
      await SupplierService.remove(supplier.id);
      setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
      setError(null);
    } catch (err) {
      // O backend recusa quando há contrato vinculado e diz quantos são; o
      // genérico esconderia que o caminho ali é desativar, não excluir.
      setError(apiMessage(err, 'Erro ao excluir o fornecedor.'));
    }
  };

  const filtered = suppliers.filter(s =>
    `${s.name} ${s.document ?? ''} ${s.notes ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className={styles.card}><p style={{ padding: 20 }}>Carregando...</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Fornecedores</h2>
          <input
            type="text"
            placeholder="Buscar fornecedor..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && <div className={styles.feedback}>{error}</div>}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Observação</th>
                <th style={{ textAlign: 'center' }}>Situação</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>
                    Nenhum fornecedor cadastrado.
                  </td>
                </tr>
              ) : (
                filtered.map(supplier => (
                  <tr key={supplier.id}>
                    <td>
                      <div className={styles.thumbPlaceholder}>
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <strong className={styles.ellipsis} title={supplier.name}>
                        {supplier.name}
                      </strong>
                    </td>
                    <td style={{ color: '#666' }}>{supplier.document ?? '—'}</td>
                    <td style={{ color: '#666' }}>
                      <div className={styles.ellipsis} title={supplier.notes ?? ''}>
                        {supplier.notes ?? '—'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={supplier.active ? styles.activeBadge : styles.inactiveBadge}>
                        {supplier.active ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className={styles.actionsCell} style={{ textAlign: 'center' }}>
                      {canOperate && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => onEdit(supplier)}
                            title="Editar"
                            aria-label={`Editar ${supplier.name}`}
                          >
                            <PencilSimple size={20} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(supplier)}
                            title="Excluir"
                            aria-label={`Excluir ${supplier.name}`}
                          >
                            <Trash size={20} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
