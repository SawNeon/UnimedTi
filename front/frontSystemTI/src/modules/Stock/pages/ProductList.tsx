import { useCallback, useEffect, useState } from "react";
import { ProductService } from "../services/ProductService";
import type { ProductDTO } from "../types/Product";
import styles from "./ProductList.module.css";
import { Trash, PencilSimple } from "@phosphor-icons/react";

interface ProductListProps {
    onEdit: (product: ProductDTO) => void;
    /** Estoque que está sendo visto. Trocar de unidade recarrega a lista. */
    unitId: string;
    /**
     * Excluir tira o produto do catálogo, logo dos DOIS estoques — por isso exige
     * operar em todas as unidades. Sem isso o botão apareceria só para dar 403.
     */
    canDelete: boolean;
}

export function ProductList({ onEdit, unitId, canDelete }: ProductListProps) {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const [itemsPerPage] = useState(8);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const loadProducts = useCallback(async (page: number) => {
        if (!unitId) return;

        try {
            const response = await ProductService.getAll(page - 1, itemsPerPage, unitId);
            const data = response.content;
            setProducts(data);
            setTotalPages(response.totalPages);

        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            alert("Erro ao conectar com a API.");
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage, unitId]);

    // Voltar para a primeira página ao trocar de estoque: a paginação do estoque
    // anterior não vale para o novo.
    useEffect(() => {
        setCurrentPage(1);
    }, [unitId]);

    useEffect(() => {
        loadProducts(currentPage);
    }, [currentPage, loadProducts]);

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
    
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className={styles.card}><p style={{ padding: 20 }}>Carregando...</p></div>;

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
                                <th style={{ width: '60px' }}>#</th>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th style={{ textAlign: 'right' }}>Estoque</th>
                                <th style={{ textAlign: 'right' }}>Mínimo</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>
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
                                        <td style={{ color: '#666' }}>{product.description}</td>
                                        <td style={{ textAlign: 'right' }}>{product.currentStock}</td>
                                        <td style={{ textAlign: 'right' }}>{product.minStockLevel}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            {product.belowMinimum ?? (product.currentStock <= product.minStockLevel) ? (
                                                <span className={styles.lowStock}>BAIXO</span>
                                            ) : (
                                                <span className={styles.goodStock}>OK</span>
                                            )}
                                        </td>

                                        <td className={styles.actionsCell} style={{ textAlign: 'center' }}>
                                            <button
                                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                                onClick={() => onEdit(product)}
                                                title="Editar"
                                                aria-label={`Editar ${product.name}`}
                                            >
                                                <PencilSimple size={20} />
                                            </button>

                                            {canDelete && (
                                                <button
                                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                    onClick={() => product.id && handleDelete(product.id)}
                                                    title="Excluir"
                                                    aria-label={`Excluir ${product.name}`}
                                                >
                                                    <Trash size={20} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className={styles.pagination}>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activeButton : ''}`}
                                onClick={() => paginate(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
