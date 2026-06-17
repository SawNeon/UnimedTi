import { useEffect, useState } from "react";
import { InvoiceService } from "../services/InvoiceService";
import type { InvoiceCostCenterViewDTO } from "../types/Invoice";
import styles from "./CostCenterView.module.css";

interface CostCenterViewProps {
    invoiceId: string;
    onBack: () => void;
}

export function CostCenterView({ invoiceId, onBack }: CostCenterViewProps) {
    const [invoice, setInvoice] = useState<InvoiceCostCenterViewDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInvoice() {
            setLoading(true);

            try {
                const data = await InvoiceService.getById(invoiceId);
                setInvoice(data);
            } catch (error) {
                console.error("Erro ao carregar centros de custo:", error);
            } finally {
                setLoading(false);
            }
        }

        if (invoiceId) {
            loadInvoice();
        }
    }, [invoiceId]);

    const formatCurrency = (value: number) => {
        return Number(value || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    };

    const formatPercentage = (value: number) => {
        return `${Number(value || 0).toFixed(3)}%`;
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <p>Carregando centros de custo...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className={styles.pageContainer}>
                <p>Nota não encontrada.</p>
                <button className={styles.backButton} onClick={onBack}>
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <div>
                    <p className={styles.systemLabel}>SISTEMA DE GESTÃO FINANCEIRA</p>
                    <h1 className={styles.title}>Visualização de Rateio Pós-Lançamento</h1>
                    <p className={styles.subtitle}>Distribuição de despesas por centro de custo</p>
                </div>

                <button className={styles.backButton} onClick={onBack}>
                    Voltar
                </button>
            </div>

            <div className={styles.summaryCard}>
                <div className={styles.summaryItem}>
                    <span>Serviço principal</span>
                    <strong>{invoice.serviceDescription}</strong>
                </div>

                <div className={styles.summaryItem}>
                    <span>Código / Nº da nota</span>
                    <strong>{invoice.number}</strong>
                </div>

                <div className={styles.summaryItem}>
                    <span>Valor total do lote</span>
                    <strong className={styles.money}>
                        {formatCurrency(invoice.totalAmount)}
                    </strong>
                </div>
            </div>

            <div className={styles.tableCard}>
                <h2 className={styles.sectionTitle}>
                    Distribuição de Despesas por Centro de Custo
                </h2>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>C. CUSTO</th>
                            <th>OPERADORA / SETOR</th>
                            <th>PORCENTAGEM</th>
                            <th>VALOR</th>
                        </tr>
                    </thead>

                    <tbody>
                        {invoice.items.map((item) => (
                            <tr key={item.sectorId}>
                                <td>{item.costCenterCode}</td>
                                <td>{item.sectorName}</td>
                                <td>{formatPercentage(item.percentage)}</td>
                                <td className={styles.valueCell}>
                                    {formatCurrency(item.allocation)}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr>
                            <td colSpan={3}>TOTAL</td>
                            <td className={styles.valueCell}>
                                {formatCurrency(invoice.totalAmount)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}