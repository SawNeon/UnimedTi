import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { PrinterService } from '../services/PrinterService';
import type { PrinterDTO } from '../../../shared/types/Printer';
import styles from '../../Users/pages/UserList.module.css';

interface PrinterListProps {
  onEdit: (printer: PrinterDTO) => void;
  canOperate: boolean;
  reloadToken?: number;
}

function apiMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })
    .response?.data?.message ?? fallback;
}

export function PrinterList({ onEdit, canOperate, reloadToken }: PrinterListProps) {
  const [printers, setPrinters] = useState<PrinterDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setPrinters(await PrinterService.getAll());
      setError(null);
    } catch (err) {
      setError(apiMessage(err, 'Erro ao carregar as impressoras.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, reloadToken]);

  const handleDelete = async (printer: PrinterDTO) => {
    if (!window.confirm(`Excluir a impressora ${printer.serialNumber}?`)) return;

    try {
      await PrinterService.remove(printer.id);
      setPrinters(prev => prev.filter(p => p.id !== printer.id));
      setError(null);
    } catch (err) {
      // Impressora com leitura lançada não é excluída: o consumo é a base do
      // rateio já cobrado. O backend explica e sugere inativar.
      setError(apiMessage(err, 'Erro ao excluir a impressora.'));
    }
  };

  const filtered = printers.filter(p =>
    `${p.serialNumber} ${p.model ?? ''} ${p.assetTag ?? ''} ${p.enterpriseName ?? ''}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className={styles.card}><p style={{ padding: 20 }}>Carregando...</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Impressoras</h2>
          <input
            type="text"
            placeholder="Buscar por série, modelo ou patrimônio..."
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
                <th>Série</th>
                <th>Modelo</th>
                <th>Patrimônio</th>
                <th>Empresa</th>
                <th>Rateio padrão</th>
                <th>Situação</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>
                    Nenhuma impressora cadastrada.
                  </td>
                </tr>
              ) : (
                filtered.map(printer => (
                  <tr key={printer.id} className={printer.active ? '' : styles.inactiveRow}>
                    <td><strong>{printer.serialNumber}</strong></td>
                    <td style={{ color: '#666' }}>
                      <div className={styles.ellipsis} title={printer.model ?? ''}>{printer.model ?? '—'}</div>
                    </td>
                    <td style={{ color: '#666' }}>{printer.assetTag ?? '—'}</td>
                    <td style={{ color: '#666' }}>{printer.enterpriseName ?? '—'}</td>
                    <td style={{ fontSize: 12, color: '#666' }}>
                      {printer.shares.length === 0
                        ? <span className={styles.noProfile}>sem rateio definido</span>
                        : printer.shares.map(s => `${s.sectorName} ${s.percentage}%`).join(' · ')}
                    </td>
                    <td>
                      {!printer.active && <span className={styles.inactiveBadge}>INATIVA</span>}
                      {printer.active && !printer.autoRead && (
                        <span className={styles.inactiveBadge}>LEITURA MANUAL</span>
                      )}
                      {printer.active && printer.autoRead && (
                        <span className={styles.activeBadge}>PRINTWAY</span>
                      )}
                      {printer.backup && <span className={styles.profileTag} style={{ marginLeft: 4 }}>RESERVA</span>}
                    </td>
                    <td className={styles.actionsCell} style={{ textAlign: 'center' }}>
                      {canOperate && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => onEdit(printer)}
                            title="Editar"
                            aria-label={`Editar ${printer.serialNumber}`}
                          >
                            <PencilSimple size={20} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(printer)}
                            title="Excluir"
                            aria-label={`Excluir ${printer.serialNumber}`}
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
