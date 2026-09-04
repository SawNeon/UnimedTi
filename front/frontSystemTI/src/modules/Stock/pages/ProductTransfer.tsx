// src/modules/Stock/pages/ProductTransfer.tsx

import { useEffect, useMemo, useState } from 'react';
import { ProductService } from '../services/ProductService';
import type { ProductDTO } from '../types/Product';
import styles from './ProductMovement.module.css';
import { ArrowsLeftRight, Package } from '@phosphor-icons/react';
import type { UnitAccess } from '../../../shared/types/Access';

interface ProductTransferProps {
  onSuccess: () => void;
  units: UnitAccess[];
  /** Unidade selecionada no cabeçalho — vira a origem sugerida. */
  currentUnitId: string;
}

/**
 * Move quantidade de um estoque para o outro.
 *
 * O catálogo é compartilhado, então é o mesmo produto dos dois lados: sai da
 * origem e entra no destino na mesma transação, e o total somado não muda.
 */
export function ProductTransfer({ onSuccess, units, currentUnitId }: ProductTransferProps) {
  // Transferir exige operar na origem E no destino. Oferecer uma unidade de
  // somente leitura aqui só produziria um 403 do backend.
  //
  // Memoizado porque entra como dependência do efeito abaixo: um array novo a
  // cada render faria o efeito disparar sem parar.
  const operableUnits = useMemo(
    () => units.filter(u => u.level === 'OPERATE'),
    [units]
  );
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [fromUnitId, setFromUnitId] = useState<string>(currentUnitId);
  const [toUnitId, setToUnitId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState<string>('');
  const [responsible, setResponsible] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // A lista mostra o saldo da ORIGEM: é ele que limita a transferência.
  useEffect(() => {
    if (!fromUnitId) return;

    const fetchProducts = async () => {
      try {
        const response = await ProductService.getAll(0, 100, fromUnitId);
        setProducts(response.content ?? []);
        setSelectedProductId('');
      } catch (error) {
        console.error('Erro ao buscar produtos', error);
        alert('Erro ao carregar a lista de produtos.');
      }
    };
    fetchProducts();
  }, [fromUnitId]);

  // Destino acompanha a origem: com duas unidades, escolher uma define a outra.
  useEffect(() => {
    const other = operableUnits.find(u => u.unitId !== fromUnitId);
    setToUnitId(prev => (prev && prev !== fromUnitId ? prev : other?.unitId ?? ''));
  }, [fromUnitId, operableUnits]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fromUnitId === toUnitId) {
      alert('A unidade de origem e a de destino devem ser diferentes.');
      return;
    }
    if (!quantity || quantity <= 0) {
      alert('Digite uma quantidade válida maior que zero.');
      return;
    }

    setLoading(true);
    try {
      await ProductService.transfer({
        id: selectedProductId,
        fromUnitId,
        toUnitId,
        quantity: Number(quantity),
        reason,
        responsible
      });
      alert('Transferência registrada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error(error);
      const apiMessage = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      alert(apiMessage ?? 'Erro ao registrar transferência.');
    } finally {
      setLoading(false);
    }
  };

  const unitName = (id: string) => units.find(u => u.unitId === id)?.unitName ?? '';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <ArrowsLeftRight size={28} color="#3a7d71" weight="bold" />
          <h2 className={styles.title} style={{ margin: 0 }}>Transferir entre Estoques</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className={styles.label}>De</label>
              <select
                className={styles.select}
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                required
              >
                {operableUnits.map(u => (
                  <option key={u.unitId} value={u.unitId}>{u.unitName}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className={styles.label}>Para</label>
              <select
                className={styles.select}
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                required
              >
                {operableUnits.filter(u => u.unitId !== fromUnitId).map(u => (
                  <option key={u.unitId} value={u.unitId}>{u.unitName}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label className={styles.label}>Selecione o Produto</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 10px', backgroundColor: 'white' }}>
              <Package size={20} color="#666" />
              <select
                className={styles.select}
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="" disabled>Escolha um item...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (disponível em {unitName(fromUnitId)}: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label className={styles.label}>Quantidade</label>
            <input
              className={styles.input}
              type="number"
              min="1"
              max={selectedProduct?.currentStock ?? undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
              placeholder="Ex: 5"
              required
            />
            {selectedProduct && (
              <small style={{ color: '#666' }}>
                Disponível em {unitName(fromUnitId)}: {selectedProduct.currentStock}
              </small>
            )}
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className={styles.label}>Motivo</label>
              <input
                className={styles.input}
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Remanejamento entre equipes"
                required
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className={styles.label}>Responsável</label>
              <input
                className={styles.input}
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nome"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onSuccess}
              disabled={loading}
              style={{ flex: 1, padding: '12px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '12px', backgroundColor: '#3a7d71', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Processando...' : 'Transferir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
