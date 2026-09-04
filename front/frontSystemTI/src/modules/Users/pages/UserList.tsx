import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Key, Prohibit, CheckCircle } from '@phosphor-icons/react';
import { UserService } from '../services/UserService';
import type { UserDTO } from '../../../shared/types/Access';
import styles from './UserList.module.css';

interface UserListProps {
  onEdit: (user: UserDTO) => void;
  /** Somente quem tem OPERATE altera; com READ a tela fica em consulta. */
  canOperate: boolean;
  /** Id do usuario logado, para nao oferecer acoes que o backend recusa. */
  currentUserId: string | null;
}

function apiMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })
    .response?.data?.message ?? fallback;
}

export function UserList({ onEdit, canOperate, currentUserId }: UserListProps) {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await UserService.getAll());
      setError(null);
    } catch (err) {
      setError(apiMessage(err, 'Erro ao carregar usuários.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleActive = async (user: UserDTO) => {
    const action = user.active ? 'desativar' : 'reativar';
    if (!window.confirm(`Deseja ${action} o usuário ${user.name}?`)) return;

    try {
      const updated = await UserService.setActive(user.id, !user.active);
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      setError(null);
    } catch (err) {
      // As recusas do backend (ultimo administrador, proprio usuario) vem com
      // mensagem pronta e explicam o motivo melhor que um texto generico.
      setError(apiMessage(err, `Erro ao ${action} o usuário.`));
    }
  };

  const handleChangePassword = async (user: UserDTO) => {
    const password = window.prompt(`Nova senha para ${user.name} (mínimo 8 caracteres):`);
    if (!password) return;

    try {
      await UserService.changePassword(user.id, password);
      setError(null);
      alert('Senha alterada com sucesso.');
    } catch (err) {
      setError(apiMessage(err, 'Erro ao alterar a senha.'));
    }
  };

  const filtered = users.filter(u =>
    `${u.name} ${u.login} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className={styles.card}><p style={{ padding: 20 }}>Carregando...</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Usuários</h2>
          <input
            type="text"
            placeholder="Busca por nome, login ou e-mail..."
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
                <th>Login</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className={user.active ? '' : styles.inactiveRow}>
                    <td>
                      <div className={styles.thumbPlaceholder}>
                        {(user.name || user.login).charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td><strong>{user.name}</strong></td>
                    <td style={{ color: '#666' }}>{user.login}</td>
                    <td style={{ color: '#666' }}>{user.email}</td>
                    <td>
                      {user.profileName
                        ? <span className={styles.profileTag}>{user.profileName}</span>
                        : <span className={styles.noProfile}>sem perfil — não acessa nada</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {user.active
                        ? <span className={styles.activeBadge}>ATIVO</span>
                        : <span className={styles.inactiveBadge}>DESATIVADO</span>}
                    </td>
                    <td className={styles.actionsCell} style={{ textAlign: 'center' }}>
                      {canOperate && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => onEdit(user)}
                            title="Editar"
                          >
                            <PencilSimple size={20} />
                          </button>

                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => handleChangePassword(user)}
                            title="Definir nova senha"
                          >
                            <Key size={20} />
                          </button>

                          {/* O proprio usuario nao aparece com a acao: o backend
                              recusaria, e oferecer o botao so geraria erro. */}
                          {user.id !== currentUserId && (
                            <button
                              className={`${styles.actionBtn} ${user.active ? styles.deleteBtn : styles.editBtn}`}
                              onClick={() => handleToggleActive(user)}
                              title={user.active ? 'Desativar' : 'Reativar'}
                            >
                              {user.active ? <Prohibit size={20} /> : <CheckCircle size={20} />}
                            </button>
                          )}
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
