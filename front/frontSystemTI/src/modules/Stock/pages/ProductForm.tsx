// src/modules/Stock/pages/ProductForm.tsx

import { useState } from 'react';
import { ProductService } from '../services/ProductService';
import type { ProductDTO, ProductFormPayload } from '../types/Product';
import styles from './ProductForm.module.css';
import { PlusCircle, Package } from '@phosphor-icons/react';



interface ProductFormProps {
  productToEdit?: ProductDTO | null;
  onSuccess: () => void;
  /** Estoque em contexto: o ponto de pedido gravado é o desta unidade. */
  unitId: string;
  unitName: string;
}

export function ProductForm({ productToEdit, onSuccess, unitId, unitName }: ProductFormProps) {
  const formKey = productToEdit?.id ?? 'new-product';

  return (
    <ProductFormFields
      key={formKey}
      productToEdit={productToEdit}
      onSuccess={onSuccess}
      unitId={unitId}
      unitName={unitName}
    />
  );
}

function ProductFormFields({ productToEdit, onSuccess, unitId, unitName }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormPayload>(() => ({
    name: productToEdit?.name ?? '',
    description: productToEdit?.description ?? '',
    minStockLevel: productToEdit?.minStockLevel ?? 0
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Stock') ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (productToEdit && productToEdit.id) {

        await ProductService.update(productToEdit.id, formData, unitId);
        alert('Produto atualizado com sucesso!');
      } else {
        await ProductService.create(formData, unitId);
        alert('Produto cadastrado com sucesso!');
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <PlusCircle size={28} color="#3a7d71" weight="bold" />
          <h2 className={styles.title}>
            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
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
              placeholder="Ex: Teclado Mecânico"
              required
            />
          </div>

          
          <label className={styles.label}>Descrição</label>
            <input
              className={styles.input}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes do produto"
            />
          

          <div style={{gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Estoque Mínimo em {unitName}</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleChange}
                required
              />
              <small style={{ color: '#666' }}>
                O ponto de pedido é próprio de cada estoque. O saldo entra por
                movimentação, não por aqui.
              </small>
            </div>
          </div>

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
              {productToEdit ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
