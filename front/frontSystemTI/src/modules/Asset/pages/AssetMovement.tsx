// src/modules/Stock/pages/AssetMovement.tsx

import { useEffect, useState } from 'react';
import { AssetService } from '../services/AssetService';
import type { AssetDTO } from '../types/Asset';
import styles from './AssetMovement.module.css';
import { ArrowsLeftRight, Package } from '@phosphor-icons/react';

interface AssetMovementProps {
  onSuccess: () => void;
}

export function AssetMovement({ onSuccess }: AssetMovementProps) {
  const [Assets, setAssets] = useState<AssetDTO[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [reason, setReason] = useState<string>('');
  const [responsible, setResponsible] = useState<string>('');
  const [sector, setSector] = useState<string>('');
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await AssetService.getAll();
        setAssets(data);
      } catch (error) {
        console.error("Erro ao buscar ativos", error);
        alert("Erro ao carregar a lista de ativos.");
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssetId) {
      alert('Selecione um ativo.');
      return;
    }
  
    setLoading(true);
    try {
      await AssetService.acesstMovement({
        id: selectedAssetId,
        reason, 
        responsible,
        sector,
        expectedReturnDate: expectedReturnDate || undefined,
        type: 'OUT'
      });
      alert('Movimentação registrada com sucesso!');
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
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className={styles.label}>Selecione o Ativo</label>
                <div style={{display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 10px', backgroundColor: 'white'}}>
                    <Package size={20} color="#666"/>
                    <select 
                        className={styles.select}
                        value={selectedAssetId}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Escolha um item...</option>
                        {Assets.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} (Status: {p.status})
                            </option>
                        ))}
                    </select>
                </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <label className={styles.label}>Motivo</label>
                    <input 
                        className={styles.input}
                        type="text"
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        placeholder="Ex: Empréstimo, Manutenção..."
                        required
                    />
                 </div>
                 
                 <div style={{ display: 'flex', gap: '20px' }}>
                   <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                      <label className={styles.label} >Responsável</label>
                      <input
                          className={styles.input}
                          type="text"
                          value={responsible} 
                          onChange={(e) => setResponsible(e.target.value)} 
                          placeholder="Nome de quem vai usar"
                          required
                      />
                   </div>
                   
                 </div>

                 <div style={{gap: '20px' }}>
                   <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                      <label className={styles.label}>Setor</label>
                      <input
                          className={styles.input}
                          type="text"
                          value={sector} 
                          onChange={(e) => setSector(e.target.value)} 
                          placeholder="Ex: TI, RH..."
                          required
                      />
                   </div>
                   <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                      <label className={styles.label}>Data de retorno esperada</label>
                      <input
                          className={styles.input}
                          type="date"
                          value={expectedReturnDate} 
                          onChange={(e) => setExpectedReturnDate(e.target.value)} 
                          placeholder="YYYY-MM-DD"
                      />
                   </div>
                 </div>
             </div>
             
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
                    style={{flex: 1, padding: '12px', backgroundColor: '#3a7d71', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', transition: 'background 0.2s'}}
                 >
                    {loading ? 'Processando...' : 'Confirmar'}
                 </button>
             </div>
        </form>
      </div>
    </div>
  );
}