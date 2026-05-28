import { useEffect, useState } from "react";
import styles from "./InvoiceModal.module.css";
import type { ApportionmentItem } from "../types/Invoice";
import type { InvoiceModalProps } from "../types/Invoice";


export function InvoiceModal({ isOpen, onClose, contract, mode, onSuccess }: InvoiceModalProps) {
    const [number, setNumber] = useState<number | "">("");
    const [totalAmount, setTotalAmount] = useState<number | "">("");
    const [issueDate, setIssueDate] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");
    
    const [items, setItems] = useState<ApportionmentItem[]>([
        { sectorId: "sec-1", sectorName: "TI", allocation: 0 },
        { sectorId: "sec-2", sectorName: "Financeiro", allocation: 0 }
    ]);

    useEffect(() => {
        if (isOpen && contract) {
            if (mode === 'view' && contract.currentInvoice) {
                setNumber(contract.currentInvoice.number);
                setTotalAmount(contract.currentInvoice.value);
            } else {
                setNumber("");
                setTotalAmount("");
                setIssueDate("");
                setDueDate("");
            }
        }
    }, [isOpen, contract, mode]);

    if (!isOpen || !contract) return null;

    const handleAllocationChange = (index: number, val: number) => {
        const updated = [...items];
        updated[index].allocation = val;
        setItems(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'view') return;

        const payload = {
            contractId: contract.id,
            number,
            totalAmount,
            issueDate,
            dueDate,
            items: items.map(i => ({ sectorId: i.sectorId, allocation: i.allocation }))
        };

        try {
            console.log("Enviando para o Back-end:", payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar nota:", error);
        }
    };

    const isView = mode === 'view';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            {/* Evita fechar o modal ao clicar dentro do card */}
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>
                    {isView ? "Visualizar Nota Fiscal" : "Lançar Nota Fiscal"}
                </h2>
                <p className={styles.subtitle}>Contrato: {contract.enterpriseName}</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Número da Nota</label>
                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    required
                                    disabled={isView}
                                    className={styles.input}
                                    value={number}
                                    onChange={(e) => setNumber(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Valor Total (R$)</label>
                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    required
                                    disabled={isView}
                                    className={styles.input}
                                    value={totalAmount}
                                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Data de Emissão</label>
                            <input
                                type="date"
                                required
                                disabled={isView}
                                className={styles.input}
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Data de Vencimento</label>
                            <input
                                type="date"
                                required
                                disabled={isView}
                                className={styles.input}
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <hr className={styles.divider} />
                    <h3 className={styles.sectionTitle}>Rateio por Centro de Custo / Setor</h3>
                    
                    {items.map((item, index) => (
                        <div key={item.sectorId} className={styles.row} style={{ alignItems: 'center', marginBottom: '8px' }}>
                            <span className={styles.sectorLabel}>{item.sectorName}</span>
                            <input
                                type="number"
                                placeholder="Valor alocado (R$)"
                                disabled={isView}
                                className={styles.input}
                                style={{ maxWidth: '200px' }}
                                value={item.allocation || ""}
                                onChange={(e) => handleAllocationChange(index, Number(e.target.value))}
                            />
                        </div>
                    ))}

                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            {isView ? "Fechar" : "Cancelar"}
                        </button>
                        {!isView && (
                            <button type="submit" className={styles.submitButton}>
                                Salvar Lançamento
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}