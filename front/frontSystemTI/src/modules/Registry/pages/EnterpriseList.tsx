import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { EnterpriseService } from '../services/RegistryService';
import type { EnterpriseDTO } from '../../../shared/types/Registry';
import styles from '../../Users/pages/UserList.module.css';

interface EnterpriseListProps {
  onEdit: (enterprise: EnterpriseDTO) => void;
  canOperate: boolean;
  /** Sobe para o App recarregar a lista de setores, que mostra o nome da empresa. */
  onChanged?: () => void;
}

function apiMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })
    .response?.data?.message ?? fallback;
}

export function EnterpriseList({ onEdit, canOperate, onChanged }: EnterpriseListProps) {
  const [enterprises, setEnterprises] = useState<EnterpriseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setEnterprises(await EnterpriseService.getAll());
      setError(null);
    } catch (err) {
      setError(apiMessage(err, 'Erro ao carregar as empresas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (enterprise: EnterpriseDTO) => {
    if (!window.confirm(`Excluir a empresa ${enterprise.name}?`)) return;

    try {
      await EnterpriseService.remove(enterprise.id);
      setEnterprises(prev => prev.filter(e => e.id !== enterprise.id));
      setError(null);
      onChanged?.();
    } catch (err) {
      // O backend recusa quando há setor ou contrato vinculado e diz exatamente
      // o quê — mostrar o genérico esconderia o que precisa ser desfeito antes.
      setError(apiMessage(err, 'Erro ao excluir a empresa.'));
    }
  };

  const filtered = enterprises.filter(e =>
    `${e.name} ${e.locale}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className={styles.card}><p style={{ padding: 20 }}>Carregando...</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Empresas</h2>
          <input
            type="text"
            placeholder="Buscar empresa..."
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
                <th>Localidade</th>
                <th style={{ textAlign: 'right' }}>Setores</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>
                    Nenhuma empresa cadastrada.
                  </td>
                </tr>
              ) : (
                filtered.map(enterprise => (
                  <tr key={enterprise.id}>
                    <td>
                      <div className={styles.thumbPlaceholder}>
                        {enterprise.name.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <strong className={styles.ellipsis} title={enterprise.name}>
                        {enterprise.name}
                      </strong>
                    </td>
                    <td style={{ color: '#666' }}>{enterprise.locale}</td>
                    <td style={{ textAlign: 'right' }}>{enterprise.sectorCount}</td>
                    <td className={styles.actionsCell} style={{ textAlign: 'center' }}>
                      {canOperate && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => onEdit(enterprise)}
                            title="Editar"
                            aria-label={`Editar ${enterprise.name}`}
                          >
                            <PencilSimple size={20} />
                          </button>

                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(enterprise)}
                            title="Excluir"
                            aria-label={`Excluir ${enterprise.name}`}
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
