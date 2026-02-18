import { useEffect, useState } from "react";
import { ProductService } from "../services/ProductService";
import type { ProductDTO } from "../types/Product";
import styles from "./ProductList.module.css";
import { Trash, PencilSimple } from "@phosphor-icons/react";

interface ProductListProps {
  onEdit: (product: ProductDTO) => void;
}

export function ProductList({ onEdit }: ProductListProps) {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await ProductService.getAll();
            setProducts(data);
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            alert("Erro ao conectar com a API.");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja deletar este produto?")) {
            try {
                await ProductService.delete(id);
                setProducts(prev => prev.filter(p => p.id !== id));
                alert("Produto deletado com sucesso!");
            } catch (error) {
                console.error("Erro ao deletar produto:", error);
                alert("Erro ao conectar com a API.");
            }
        }
    }

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className={styles.card}><p style={{padding: 20}}>Carregando...</p></div>;

    return (
        <div className={styles.pageContainer}>    
            <div className={styles.card}>
                <div className={styles.toolbar}>
                    <h2 className={styles.title}>Estoque de Produtos</h2>
                    <input
                        type="text"
                        placeholder="Busca de item..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{width: '60px'}}>#</th>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th style={{textAlign: 'right'}}>Estoque</th>
                                <th style={{textAlign: 'right'}}>Mínimo</th>
                                <th style={{textAlign: 'center'}}>Status</th>
                                <th style={{textAlign: 'center'}}>Ações</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{textAlign: 'center', padding: 20}}>
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id || Math.random()}>
                                        <td>
                                            <div className={styles.thumbPlaceholder}>
                                                {product.name.charAt(0).toUpperCase()}
                                            </div>
                                        </td>
                                        <td><strong>{product.name}</strong></td>
                                        <td style={{color: '#666'}}>{product.description}</td>
                                        <td style={{textAlign: 'right'}}>{product.currentStock}</td>
                                        <td style={{textAlign: 'right'}}>{product.minStockLevel}</td>
                                        <td style={{textAlign: 'center'}}>
                                            {product.currentStock <= product.minStockLevel ? (
                                                <span className={styles.lowStock}>BAIXO</span>
                                            ) : (
                                                <span className={styles.goodStock}>OK</span>
                                            )}
                                        </td>
                                        
                                        <td className={styles.actionsCell} style={{textAlign: 'center'}}>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                                onClick={() => onEdit(product)} 
                                            >
                                                <PencilSimple size={20} />
                                            </button>
                                            
                                            <button 
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                onClick={() => product.id && handleDelete(product.id)}
                                                title="Excluir"
                                            >
                                                <Trash size={20} />
                                            </button>
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