import { useEffect, useState } from 'react';
import { UserCircle } from '@phosphor-icons/react';
import { UserService } from '../services/UserService';
import type { AccessProfileDTO, UserDTO } from '../../../shared/types/Access';
import styles from '../../Stock/pages/ProductForm.module.css';

interface UserFormProps {
  userToEdit?: UserDTO | null;
  onSuccess: () => void;
}

export function UserForm({ userToEdit, onSuccess }: UserFormProps) {
  const [profiles, setProfiles] = useState<AccessProfileDTO[]>([]);
  const [login, setLogin] = useState(userToEdit?.login ?? '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(userToEdit?.name ?? '');
  const [email, setEmail] = useState(userToEdit?.email ?? '');
  const [profileId, setProfileId] = useState(userToEdit?.profileId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(userToEdit);

  useEffect(() => {
    UserService.getProfiles()
      .then(setProfiles)
      .catch(() => setError('Erro ao carregar os perfis de acesso.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEdit && userToEdit) {
        await UserService.update(userToEdit.id, { name, email, profileId });
      } else {
        await UserService.create({ login, password, name, email, profileId });
      }
      onSuccess();
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao salvar o usuário.');
    } finally {
      setSaving(false);
    }
  };

  const selectedProfile = profiles.find(p => p.id === profileId);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <UserCircle size={28} color="#3a7d71" weight="bold" />
          <h2 className={styles.title}>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        </div>

        {error && (
          <p style={{ background: '#ffebee', color: '#b3261e', border: '1px solid #f5c2c0',
                      padding: '12px 14px', borderRadius: 6, marginBottom: 16 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <label className={styles.label}>Login</label>
          <input
            className={styles.input}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Ex: joao.silva"
            minLength={3}
            required
            // O login identifica a pessoa no historico de movimentacoes; troca-lo
            // depois quebraria essa ligacao.
            disabled={isEdit}
          />
          {isEdit && <small style={{ color: '#666' }}>O login não pode ser alterado.</small>}

          {!isEdit && (
            <>
              <label className={styles.label}>Senha</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </>
          )}

          <label className={styles.label}>Nome</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
            required
          />

          <label className={styles.label}>E-mail</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@unimedvarginha.coop.br"
            required
          />

          <label className={styles.label}>Perfil de acesso</label>
          <select
            className={styles.input}
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            required
          >
            <option value="" disabled>Escolha um perfil...</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedProfile?.description && (
            <small style={{ color: '#666' }}>{selectedProfile.description}</small>
          )}

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
              style={{ flex: 1, padding: '12px', backgroundColor: '#3a7d71', color: 'white', border: 'none', borderRadius: '4px', cursor: saving ? 'wait' : 'pointer', fontWeight: 'bold' }}
            >
              {saving ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
