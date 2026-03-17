import { useEffect, useState } from 'react';
import { AssetService } from '../services/AssetService';
import type { AssetDTO } from '../types/Asset';
import styles from './AssetForm.module.css';
import { PlusCircle, Package } from '@phosphor-icons/react';


interface AssetFormProps {
  assetToEdit?: AssetDTO | null;
  onSuccess: () => void;
}

export function AssetForm({ assetToEdit, onSuccess }: AssetFormProps) {

    const [formData, setFormData] = useState<AssetDTO>({
        name: '',
        assetTag: '',
        description: '',
        status: ''
      });

    useEffect(() => {
        if (assetToEdit) {
            setFormData(assetToEdit);
        } else {
            setFormData({ name: '', assetTag: '', description: '', status: 'AVAILABLE' });
        }
    }, [assetToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (assetToEdit && assetToEdit.id) {
                await AssetService.update(assetToEdit.id, formData);
                alert('Ativo atualizado com sucesso!');
            } else {
                await AssetService.create(formData);
                alert('Ativo cadastrado com sucesso!');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar ativo.');
        }
    };

    return (
        <div className={styles.pageContainer}>
      <div className={styles.card}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <PlusCircle size={28} color="#3a7d71" weight="bold" />
          <h2 className={styles.title}>
            {assetToEdit ? 'Editar Ativo' : 'Novo Ativo'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>


          <label className={styles.label}>Nome</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 10px' }}>
            <Package size={20} color="#666" />
            <input
              className={styles.input}
              style={{ border: 'none', width: '100%', padding: '10px', outline: 'none' }}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Notebook Insperon 15"
              required
            />
          </div>

         <label className={styles.label}>Patrimônio</label>
            <input
              className={styles.input}      
              name="assetTag"
              value={formData.assetTag}
              onChange={handleChange}
              placeholder="Ex: 0001"
            />
          
          <label className={styles.label}>Descrição</label>
            <input
              className={styles.input}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes do produto"
            />
          <label className={styles.label}>Status</label>
            <select
            className={styles.input}
            name="status"
            value={formData.status}
            onChange={handleChange as any} 
            required
          >
            <option value="AVAILABLE">Disponível</option>
            <option value="UNAVAILABLE">Indisponível</option>
            <option value="INACTIVE">Desativado</option>
          </select>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onSuccess}
              style={{ flex: 1, padding: '12px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              style={{ flex: 1, padding: '12px', backgroundColor: '#3a7d71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {assetToEdit ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}