import { useEffect, useState } from "react";
import { ContractService } from "../services/ContractService";
import type { ContractDTO } from "../types/Contract";
import { EnterpriseService } from "../../../shared/services/enterpriseService";
import type { EnterpriseDTO } from "../../../shared/types/Enterprise";
import styles from "./ContractList.module.css";
import { Trash, PencilSimple } from "@phosphor-icons/react";

interface ContractListProps extends Omit<ContractDTO, 'enterprise'> {
    enterprise?:(ContractDTO & { enterprise: { name: string } });
}

interface ContractListProps {}

export function ContractList({ }: ContractListProps) {
    const [contracts, setContracts] = useState<ContractDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);


    useEffect(() => {
        loadContracts(currentPage);
    }, [currentPage]);

    const loadContracts = async (page: number) => {
        setLoading(true);
        try {
            const response = await ContractService.getAll(page - 1, itemsPerPage);
            const data = response.content;
            setTotalPages(response.totalPages);

            const dataEnterprises = await EnterpriseService.getAll();
            const enterprisesMap: Record<string, string> = {};

            dataEnterprises.forEach((enterprise: EnterpriseDTO) => {
                if (enterprise.id) {
                    enterprisesMap[enterprise.id] = enterprise.name;
                }
            });

            const contractsWithEnterpriseName = data.map((contract: ContractDTO) => ({
                ...contract,
                enterprise: contract.enterprise?.id && enterprisesMap[contract.enterprise.id]
                    ? { ...contract.enterprise, name: enterprisesMap[contract.enterprise.id] }
                    : contract.enterprise
            }));
            setContracts(contractsWithEnterpriseName);
        } catch (error) {
            console.error("Error loading contracts:", error);
        } finally {
            setLoading(false);
        }
    };
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return (
            <div className={styles.card}>
                <p className={styles.loadingText}>Carregando...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <div className={styles.toolbar}>
                    <h2 className={styles.title}>Contratos</h2>
                    <input
                        type="text"
                        placeholder="Buscar contratos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Empresa</th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Status</th>
                            <th>Laçamento</th>
                            <th>Visualizar</th>
                            
            </div>
        </div>
    );

}
