import { useEffect, useState } from 'react';
import { FileText, PlusCircle } from '@phosphor-icons/react';
import { EnterpriseService } from '../../../shared/services/enterpriseService';
import type { EnterpriseDTO } from '../../../shared/types/Enterprise';
import { ContractService } from '../services/ContractService';
import type { ContractDTO, ContractStatus } from '../types/Contract';
import styles from './ContractForm.module.css';

interface ContractFormProps {
  onSuccess: () => void;
}

const initialFormData: ContractDTO = {
  enterprise: undefined,
  serviceType: '',
  serviceDescription: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  status: 'ACTIVE'
};

export function ContractForm({ onSuccess }: ContractFormProps) {
  const [formData, setFormData] = useState<ContractDTO>(initialFormData);
  const [enterprises, setEnterprises] = useState<EnterpriseDTO[]>([]);
  const [loadingEnterprises, setLoadingEnterprises] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEnterprises() {
      try {
        const response = await EnterpriseService.getAll();

        if (isMounted) {
          setEnterprises(response);
        }
      } catch (loadError) {
        console.error(loadError);

        if (isMounted) {
          setError('Nao foi possivel carregar as empresas.');
        }
      } finally {
        if (isMounted) {
          setLoadingEnterprises(false);
        }
      }
    }

    loadEnterprises();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name === 'enterpriseId') {
      const selectedEnterprise = enterprises.find(enterprise => enterprise.id === value);

      setFormData(prev => ({
        ...prev,
        enterprise: selectedEnterprise
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.enterprise?.id) {
      return 'Selecione a empresa do contrato.';
    }

    if (!formData.serviceType.trim()) {
      return 'Informe o tipo de servico.';
    }

    if (!formData.serviceDescription.trim()) {
      return 'Informe a descricao do servico.';
    }

    if (!formData.startDate) {
      return 'Informe a data de inicio.';
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      return 'A data de fim nao pode ser anterior a data de inicio.';
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const contractPayload: ContractDTO = {
      ...formData,
      serviceType: formData.serviceType.trim(),
      serviceDescription: formData.serviceDescription.trim(),
      endDate: formData.endDate || undefined,
      status: formData.status as ContractStatus
    };

    try {
      await ContractService.create(contractPayload);
      alert('Contrato cadastrado com sucesso!');
      onSuccess();
    } catch (submitError) {
      console.error(submitError);
      setError('Erro ao cadastrar contrato. Confira os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <PlusCircle size={28} color="#146556" weight="bold" />
          <h2 className={styles.title}>Novo Contrato</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.row}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="enterpriseId">
                Empresa
              </label>
              <select
                id="enterpriseId"
                name="enterpriseId"
                className={styles.select}
                value={formData.enterprise?.id ?? ''}
                onChange={handleInputChange}
                disabled={loadingEnterprises || saving}
                required
              >
                <option value="">
                  {loadingEnterprises ? 'Carregando empresas...' : 'Selecione uma empresa'}
                </option>
                {enterprises.map(enterprise => (
                  <option key={enterprise.id} value={enterprise.id}>
                    {enterprise.name}
                  </option>
                ))}
              </select>
              {!loadingEnterprises && enterprises.length === 0 && (
                <p className={styles.helpText}>
                  Cadastre uma empresa antes de criar um contrato.
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="serviceType">
                Tipo de servico
              </label>
              <input
                id="serviceType"
                name="serviceType"
                className={styles.input}
                value={formData.serviceType}
                onChange={handleInputChange}
                placeholder="Ex: Software, Internet, Suporte"
                disabled={saving}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                className={styles.select}
                value={formData.status}
                onChange={handleInputChange}
                disabled={saving}
                required
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="startDate">
                Inicio do contrato
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className={styles.input}
                value={formData.startDate}
                onChange={handleInputChange}
                disabled={saving}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="endDate">
                Fim do contrato
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className={styles.input}
                value={formData.endDate ?? ''}
                onChange={handleInputChange}
                disabled={saving}
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="serviceDescription">
                Descricao do servico
              </label>
              <textarea
                id="serviceDescription"
                name="serviceDescription"
                className={styles.textarea}
                value={formData.serviceDescription}
                onChange={handleInputChange}
                placeholder="Descreva o objeto do contrato"
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onSuccess}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.button}
              disabled={saving || loadingEnterprises || enterprises.length === 0}
            >
              <FileText size={18} weight="bold" /> {saving ? 'Salvando...' : 'Cadastrar Contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
