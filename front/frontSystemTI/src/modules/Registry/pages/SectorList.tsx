import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { SectorService } from '../services/RegistryService';
import type { SectorDTO } from '../../../shared/types/Registry';
import styles from '../../Users/pages/UserList.module.css';

interface SectorListProps {
  onEdit: (sector: SectorDTO) => void;
  canOperate: boolean;
  /** Muda quando uma empresa é salva, para a lista refletir o novo nome. */
  reloadToken?: number;
}

function apiMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })
    .response?.data?.message ?? fallback;
}

export function SectorList({ onEdit, canOperate, reloadToken }: SectorListProps) {
  const [sectors, setSectors] = useState<SectorDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSectors(await SectorService.getAll());
      setError(null);
    } catch (err) {
      setError(apiMessage(err, 'Erro ao carregar os setores.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, reloadToken]);

  const handleDelete = async (sector: SectorDTO) => {
    if (!window.confirm(`Excluir o setor ${sector.name}?`)) return;

    try {
      await SectorService.remove(sector.id);
      setSectors(prev => prev.filter(s => s.id !== sector.id));
      setError(null);
    } catch (err) {
      // Setor usado em movimentação, pedido ou rateio não pode sumir. A recusa do
      // backend nomeia o vínculo; o texto genérico não ajudaria a resolver.
      setError(apiMessage(err, 'Erro ao excluir o setor.'));
    }
  };

  const filtered = sectors.filter(s =>
    `${s.name} ${s.groupName} ${s.costCenterCode} ${s.enterpriseName ?? ''}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className={styles.card}><p style={{ padding: 20 }}>Carregando...</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Setores</h2>
          <input
            type="text"
            placeholder="Buscar por nome, grupo ou centro de custo..."
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
                <th style={{ textAlign: 'right' }}>Centro de custo</th>
                <th>Grupo</th>
                <th>Empresa</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>
                    Nenhum setor cadastrado.
                  </td>
                </tr>
              ) : (
                filtered.map(sector => (
                  <tr key={sector.id}>
                    <td>
                      <div className={styles.thumbPlaceholder}>
                        {sector.name.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <strong className={styles.ellipsis} title={sector.name}>{sector.name}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={styles.profileTag}>{sector.costCenterCode}</span>
                    </td>
                    <td style={{ color: '#666' }}>{sector.groupName}</td>
                    <td>
                      <div className={styles.ellipsis} style={{ color: '#666' }}>
                        {sector.enterpriseName ?? '—'}
                      </div>
                    </td>
                    <td className={styles.actionsCell} style={{ textAlign: 'center' }}>
                      {canOperate && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => onEdit(sector)}
                            title="Editar"
                            aria-label={`Editar ${sector.name}`}
                          >
                            <PencilSimple size={20} />
                          </button>

                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(sector)}
                            title="Excluir"
                            aria-label={`Excluir ${sector.name}`}
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
