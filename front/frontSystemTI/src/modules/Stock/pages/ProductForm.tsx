// src/modules/Stock/pages/ProductForm.tsx

import { useEffect, useState } from 'react';
import { ProductService } from '../services/ProductService';
import type { ProductDTO } from '../types/Product';
import styles from './ProductForm.module.css';
import { Package } from '@phosphor-icons/react';


interface ProductFormProps {
  productToEdit?: ProductDTO | null; 
  onSuccess: () => void;           
}

export function ProductForm({ productToEdit, onSuccess }: ProductFormProps) {
  
  const [formData, setFormData] = useState<ProductDTO>({
    name: '',
    description: '',
    currentStock: 0,
    minStockLevel: 0
  });


  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {

      setFormData({ name: '', description: '', currentStock: 0, minStockLevel: 0 });
    }
  }, [productToEdit]);

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

        await ProductService.update(productToEdit.id, formData);
        alert('Produto atualizado com sucesso!');
      } else {
                await ProductService.create(formData);
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
        <h2 className={styles.title}>
          {productToEdit ? 'Editar Produto' : 'Novo Produto'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             
             <div className={styles.inputGroup}>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Nome</label>
                <div style={{display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 10px'}}>
                    <Package size={20} color="#666"/>
                    <input 
                        className={styles.input} 
                        style={{border: 'none', width: '100%', padding: '10px', outline: 'none'}}
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Ex: Teclado Mecânico" 
                        required
                    />
                </div>
             </div>

             <div className={styles.inputGroup}>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Descrição</label>
                <input 
                    className={styles.input} 
                    style={{border: '1px solid #ddd', borderRadius: '4px', padding: '10px', width: '100%'}}
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Detalhes do produto" 
                />
             </div>

             <div style={{display: 'flex', gap: '20px'}}>
                 <div className={styles.inputGroup} style={{flex: 1}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Qtd Atual</label>
                    <input 
                        type="number"
                        className={styles.input} 
                        style={{border: '1px solid #ddd', borderRadius: '4px', padding: '10px', width: '100%'}}
                        name="currentStock" 
                        value={formData.currentStock} 
                        onChange={handleChange} 
                    />
                 </div>

                 <div className={styles.inputGroup} style={{flex: 1}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Estoque Mínimo</label>
                    <input 
                        type="number"
                        className={styles.input} 
                        style={{border: '1px solid #ddd', borderRadius: '4px', padding: '10px', width: '100%'}}
                        name="minStockLevel" 
                        value={formData.minStockLevel} 
                        onChange={handleChange} 
                    />
                 </div>
             </div>
             
             <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                 <button 
                    type="button" 
                    onClick={onSuccess} 
                    style={{flex: 1, padding: '12px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                 >
                    Cancelar
                 </button>

                 <button 
                    type="submit" 
                    style={{flex: 1, padding: '12px', backgroundColor: '#3a7d71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                 >
                    {productToEdit ? 'Salvar Alterações' : 'Cadastrar'}
                 </button>
             </div>
        </form>
      </div>
    </div>
  );
}