import { useCallback, useEffect, useState } from "react";
import { ContractService } from "../services/ContractService";
import styles from "./ContractList.module.css";
import type { ContractMonthResponse } from "../types/Contract";
import { InvoiceModal } from "../components/InvoiceModal";

interface ContractListProps {
    onOpenCostCenters: (invoiceId: string) => void;
}

const formatMoney = (value: number) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string) => {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
};

/**
 * Reproduz a coluna COMPARATIVO da planilha, mas o valor vem calculado do
 * backend a partir da nota do mês anterior — não é digitado a cada mês.
 */
function renderComparison(contract: ContractMonthResponse) {
    const { comparison, difference, differencePercent } = contract;

    if (comparison === 'PENDENTE') {
        return <span className={styles.lowStock}>AGUARDANDO</span>;
    }
    if (comparison === 'PRIMEIRA') {
        return <span className={styles.pageButton} style={{ display: 'inline-block' }}>PRIMEIRA NOTA</span>;
    }
    if (comparison === 'MANTEVE') {
        return <span className={styles.goodStock}>MANTEVE</span>;
    }

    const subiu = comparison === 'AUMENTOU';
    const sinal = subiu ? '+' : '';
    const detalhe = difference == null
        ? ''
        : ` ${sinal}${formatMoney(difference)}${
            differencePercent == null ? '' : ` (${sinal}${differencePercent}%)`
          }`;

    return (
        <span className={subiu ? styles.lowStock : styles.goodStock}>
            {subiu ? 'AUMENTOU' : 'DIMINUIU'}{detalhe}
        </span>
    );
}

export function ContractList({ onOpenCostCenters }: ContractListProps) {
    const [contracts, setContracts] = useState<ContractMonthResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

    const [loading, setLoading] = useState<boolean>(true);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<ContractMonthResponse | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'view'>('create');

    const loadContractsAndInvoices = useCallback(async (page: number, month: string) => {
        setLoading(true);
        try {
            const response = await ContractService.getAll(page - 1, itemsPerPage, month);
            setContracts(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        loadContractsAndInvoices(currentPage, selectedMonth);
    }, [currentPage, selectedMonth, loadContractsAndInvoices]);

    const handleLaunchInvoice = (contract: ContractMonthResponse) => {
        setSelectedContract(contract);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleViewInvoice = (contract: ContractMonthResponse) => {
        setSelectedContract(contract);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleGoToCostCenters = (invoiceId: string) => {
        onOpenCostCenters(invoiceId);
    };

    const getInvoiceValue = (invoice: ContractMonthResponse["currentInvoice"]) => {
        return invoice ? Number(invoice.value ?? 0) : 0;
    };

    const getEnterpriseName = (contract: ContractMonthResponse) => {
        return contract.enterpriseName || "Empresa não informada";
    };

    const filteredContracts = contracts.filter(contract =>
        (contract.serviceDescription || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        getEnterpriseName(contract).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalValue = filteredContracts.reduce((acc, contract) => {
        return acc + getInvoiceValue(contract.currentInvoice);
    }, 0);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <div className={styles.toolbar}>
                    <h2 className={styles.title}>Controle de Lançamentos</h2>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="month"
                            className={styles.searchInput}
                            style={{ minWidth: '150px' }}
                            value={selectedMonth}
                            onChange={(e) => {
                                setSelectedMonth(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Buscar contratos..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                        <p>A carregar lançamentos do mês {selectedMonth}...</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Empresa</th>
                                        <th>Tipo</th>
                                        <th>Descrição</th>
                                        <th>Status ({selectedMonth})</th>
                                        <th style={{ textAlign: 'right' }}>Mês anterior</th>
                                        <th style={{ textAlign: 'right' }}>Valor da Nota</th>
                                        <th>Comparativo</th>
                                        <th>Entregar até</th>
                                        <th>Centro de Custo</th>
                                        <th>Lançamento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContracts.map((contract) => {
                                        const hasInvoice = contract.currentInvoice !== null && contract.currentInvoice !== undefined;
                                        const invoiceData = contract.currentInvoice;

                                        return (
                                            <tr key={contract.id}>
                                                <td>{getEnterpriseName(contract)}</td>
                                                <td>{contract.type}</td>
                                                <td>{contract.serviceDescription}</td>
                                                <td>
                                                    {hasInvoice ? (
                                                        <span className={styles.goodStock}>
                                                            {invoiceData?.status === "ISSUED" ? "LANÇADO" : invoiceData?.status}
                                                        </span>
                                                    ) : (
                                                        <span className={styles.lowStock}>PENDENTE</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right', color: '#666' }}>
                                                    {contract.previousAmount != null
                                                        ? formatMoney(contract.previousAmount)
                                                        : '—'}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {hasInvoice && invoiceData
                                                        ? <strong>{formatMoney(invoiceData.value)}</strong>
                                                        : '—'}
                                                </td>
                                                <td>{renderComparison(contract)}</td>
                                                <td style={{ color: '#666' }}>
                                                    {invoiceData?.deliveredAt
                                                        ? `entregue em ${formatDate(invoiceData.deliveredAt)}`
                                                        : invoiceData?.deliveryDeadline
                                                            ? formatDate(invoiceData.deliveryDeadline)
                                                            : '—'}
                                                </td>
                                                <td>
                                                    <button
                                                        className={styles.pageButton}
                                                        style={{ width: '100%', fontSize: '12px', padding: '4px' }}
                                                        disabled={!invoiceData?.id}
                                                        onClick={() => invoiceData?.id && handleGoToCostCenters(invoiceData.id)}
                                                    >
                                                        {hasInvoice ? "Abrir Centros" : "Bloqueado"}
                                                    </button>
                                                </td>
                                                <td>
                                                    {hasInvoice ? (
                                                        <button className={styles.pageButton} style={{ borderColor: '#146556', color: '#146556' }} onClick={() => handleViewInvoice(contract)}>Visualizar</button>
                                                    ) : (
                                                        <button className={styles.pageButton} style={{ backgroundColor: '#e0f2f1', color: '#146556', borderColor: '#146556' }} onClick={() => handleLaunchInvoice(contract)}>Lançar Nota</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold', padding: '16px 24px' }}>VALOR TOTAL LANÇADO:</td>
                                        <td colSpan={5} style={{ fontWeight: 'bold', color: '#2e7d32', padding: '16px 24px', fontSize: '15px' }}>
                                            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className={styles.pagination}>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activeButton : ''}`}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <InvoiceModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                contract={selectedContract}
                mode={modalMode}
                referenceMonth={selectedMonth}
                onSuccess={() => loadContractsAndInvoices(currentPage, selectedMonth)} // Recarrega a tabela se salvar com sucesso
            />
        </div>
    );
}
