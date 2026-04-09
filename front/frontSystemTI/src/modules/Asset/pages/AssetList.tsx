import { useEffect, useState } from "react";
import { AssetService } from "../services/AssetService";
import type { AssetDTO } from "../types/Asset";
import styles from "./AssetList.module.css";
import { ArrowBendDownLeftIcon, PencilSimpleIcon } from "@phosphor-icons/react";

interface AssetListProps {
  onEdit: (asset: AssetDTO) => void;
}

export function AssetList({ onEdit }: AssetListProps) {
    const [assets, setAssets] = useState<AssetDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const data = await AssetService.getAll();
            setAssets(data);
        } catch (error) {
            console.error("Error loading assets:", error);
            alert("Error connecting to the API.");
        } finally {
            setLoading(false);
        }   
    }

    const handleReturn = async (id: string) => {
            try {
                await AssetService.returnAsset(id);
                setAssets(prev => prev.filter(a => a.id !== id));
                alert("Ativo devolvido com sucesso!");
                loadAssets();
            } catch (error) {
                console.error("Error returning asset:", error);
                alert("Error connecting to the API.");
            }
    }

    const filteredAssets = assets.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className={styles.card}><p style={{padding: 20}}>Carregando...</p></div>;

    return (
        <div className={styles.pageContainer}>    
            <div className={styles.card}>
                <div className={styles.toolbar}>
                    <h2 className={styles.title}>Cadastro de Ativos</h2>
                    <input
                        type="text"
                        placeholder="Busca de item..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{width: '60px'}}>X</th>
                                <th>Nome</th>
                                <th style={{textAlign: 'center'}}>Descrição</th>
                                <th style={{textAlign: 'right'}}>Patrimônio</th>
                                <th style={{textAlign: 'center'}}>Status</th>
                                <th style={{textAlign: 'center'}}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>Nenhum ativo encontrado.</td>
                                </tr>
                            ) : (
                                filteredAssets.map(assets => (
                                    <tr key={assets.id || Math.random()}>
                                        <td>
                                            <div className={styles.thumbPlaceholder}>
                                                {assets.name.charAt(0).toUpperCase()}
                                            </div>
                                        </td>
                                        <td><strong>{assets.name}</strong></td>
                                        <td style={{color: '#666'}}>{assets.description}</td>
                                        <td style={{textAlign: 'right'}}>{assets.assetTag}</td>
                                        <td style={{textAlign: 'right'}}>
                                            {assets.status === 'AVAILABLE' ? <span className={styles.spanGreen}>Disponível</span> : 
                                             assets.status === 'UNAVAILABLE' ? <span className={styles.spanRed}>Indisponível</span> : 
                                             assets.status === 'INACTIVE' ? <span className={styles.spanRed}>Inativo</span> : 
                                             assets.status}
                                        </td>
                                        <td className={styles.actionsCell} style={{textAlign: 'center'}}>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                                onClick={() => onEdit(assets)} 
                                            >
                                                <PencilSimpleIcon size={20} />
                                            </button>
                                            
                                            <button 
                                                className={`${styles.actionBtn}`}
                                                onClick={() => assets.id && handleReturn(assets.id)}
                                                title="return asset"
                                            >
                                                <ArrowBendDownLeftIcon size={20} />
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