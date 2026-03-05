// src/modules/Stock/pages/ProductMovement.tsx

import { useEffect, useState } from 'react';
import { ProductService } from '../services/ProductService';
import type { ProductDTO, MovementPayload } from '../types/Product';
import styles from './ProductForm.module.css'; 
import { ArrowsLeftRight, Package } from '@phosphor-icons/react';

interface ProductMovementProps {
  onSuccess: () => void;
}

export function ProductMovement({ onSuccess }: ProductMovementProps) {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<'add' | 'remove'>('add');
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [responsible, setResponsible] = useState<string>('');
  const [sector, setSector] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAll();
        setProducts(data);
      } catch (error) {
        console.error("Erro ao buscar produtos", error);
        alert("Erro ao carregar a lista de produtos.");
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId) {
      alert('Selecione um produto.');
      return;
    }
    
    if (!quantity || quantity <= 0) {
      alert('Digite uma quantidade válida maior que zero.');
      return;
    }

    setLoading(true);
    try {
      if (movementType === 'add') {
        await ProductService.addStock({
          id: selectedProductId,
          quantity: Number(quantity),
          reason,
          responsible,
          sector
        })  ;
        alert('Entrada de estoque registrada com sucesso!');
      } else {
        await ProductService.removeStock({
          id: selectedProductId,
          quantity: Number(quantity),
          reason,
          responsible,
          sector
        });     
        alert('Saída de estoque registrada com sucesso!');
      }
      onSuccess(); 
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar movimentação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <ArrowsLeftRight size={28} color="#3a7d71" weight="bold" />
          <h2 className={styles.title} style={{ margin: 0 }}>Movimentar Estoque</h2>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             
             {/* Seleção do Produto */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Selecione o Produto</label>
                <div style={{display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 10px', backgroundColor: 'white'}}>
                    <Package size={20} color="#666"/>
                    <select 
                        style={{border: 'none', width: '100%', padding: '12px', outline: 'none', backgroundColor: 'transparent', color: '#555'}}
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Escolha um item...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} (Estoque atual: {p.currentStock})
                            </option>
                        ))}
                    </select>
                </div>
             </div>

             <div style={{display: 'flex', gap: '20px'}}>
                 {/* Quantidade */}
                 <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Quantidade</label>
                    <input 
                        type="number"
                        min="1"
                        style={{border: '1px solid #ddd', borderRadius: '4px', padding: '12px', width: '100%', outlineColor: '#3a7d71'}}
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')} 
                        placeholder="Ex: 10"
                        required
                    />
                 </div>

                 {/* Tipo de Movimentação (Radio Buttons) */}
                 <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Tipo</label>
                    <div style={{display: 'flex', gap: '10px', height: '100%', alignItems: 'center'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: movementType === 'add' ? '#3a7d71' : '#555', fontWeight: movementType === 'add' ? 'bold' : 'normal'}}>
                            <input 
                                type="radio" 
                                name="movement" 
                                value="add" 
                                checked={movementType === 'add'} 
                                onChange={() => setMovementType('add')} 
                            />
                            Entrada (+)
                        </label>
                        <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: movementType === 'remove' ? '#d32f2f' : '#555', fontWeight: movementType === 'remove' ? 'bold' : 'normal'}}>
                            <input 
                                type="radio" 
                                name="movement" 
                                value="remove" 
                                checked={movementType === 'remove'} 
                                onChange={() => setMovementType('remove')} 
                            />
                            Saída (-)
                        </label>
                    </div>
                 </div>
             </div>

             {/* Motivo, Responsável e Setor */}
             <div style={{display: 'flex', gap: '20px'}}>
                 <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Motivo</label>
                    <input 
                        type="text"
                        style={{border: '1px solid #ddd', borderRadius: '4px', padding: '12px', width: '100%', outlineColor: '#3a7d71'}}
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        placeholder="Ex: Devolução"
                        required
                    />
                 </div>
                 <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Responsável</label>
                    <input 
                        type="text"
                        style={{border: '1px solid #ddd', borderRadius: '4px', padding: '12px', width: '100%', outlineColor: '#3a7d71'}}
                        value={responsible} 
                        onChange={(e) => setResponsible(e.target.value)} 
                        placeholder="Nome"
                        required
                    />
                 </div>
                 <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#555'}}>Setor</label>
                    <input 
                        type="text"
                        style={{border: '1px solid #ddd', borderRadius: '4px', padding: '12px', width: '100%', outlineColor: '#3a7d71'}}
                        value={sector} 
                        onChange={(e) => setSector(e.target.value)} 
                        placeholder="Ex: TI"
                        required
                    />
                 </div>
             </div>
             
             {/* Botões de Ação */}
             <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                 <button 
                    type="button" 
                    onClick={onSuccess}
                    disabled={loading}
                    style={{flex: 1, padding: '12px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                 >
                    Cancelar
                 </button>

                 <button 
                    type="submit" 
                    disabled={loading}
                    style={{flex: 1, padding: '12px', backgroundColor: movementType === 'add' ? '#3a7d71' : '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', transition: 'background 0.2s'}}
                 >
                    {loading ? 'Processando...' : 'Confirmar'}
                 </button>
             </div>
        </form>
      </div>
    </div>
  );
}