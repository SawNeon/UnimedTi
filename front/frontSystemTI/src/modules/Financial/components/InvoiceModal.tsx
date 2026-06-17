import { useCallback, useEffect, useState } from "react";
import styles from "./InvoiceModal.module.css";
import { Lock, LockOpen, Plus, Trash } from "@phosphor-icons/react";
import { SectorService } from "../../../shared/services/sectorService";
import type { ContractMonthResponse } from "../types/Contract";
import type { InvoiceApportionmentTemplateDTO } from "../types/Invoice";
import { InvoiceService } from "../services/InvoiceService";
import { api } from "../../../shared/services/api";


interface SectorFromDB {
    id: string;
    name: string;
}

interface ApportionmentItem {
    sectorId: string;
    sectorName: string;
    allocation: number;
    percentage: number;
    isManual: boolean;
}

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract: ContractMonthResponse | null;
    mode: 'create' | 'view';
    referenceMonth?: string;
    onSuccess?: () => void;
}

interface InvoiceViewResponse {
    id: string;
    contractId: string;
    number: number;
    totalAmount: number;
    issueDate: string;
    dueDate: string;
    status: string;
    items: {
        sectorId: string;
        sectorName: string;
        allocation: number;
    }[];
}

const roundMoney = (value: number) => Number(value.toFixed(2));

export function InvoiceModal({ isOpen, onClose, contract, mode, referenceMonth, onSuccess }: InvoiceModalProps) {
    const modalKey = `${mode}-${contract?.currentInvoice?.id ?? contract?.id ?? 'empty'}-${isOpen ? 'open' : 'closed'}`;

    return (
        <InvoiceModalContent
            key={modalKey}
            isOpen={isOpen}
            onClose={onClose}
            contract={contract}
            mode={mode}
            referenceMonth={referenceMonth}
            onSuccess={onSuccess}
        />
    );
}

function InvoiceModalContent({ isOpen, onClose, contract, mode, referenceMonth, onSuccess }: InvoiceModalProps) {
    const [number, setNumber] = useState<number | "">("");
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [issueDate, setIssueDate] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");

    const [allSectors, setAllSectors] = useState<SectorFromDB[]>([]);
    const [selectedSectorId, setSelectedSectorId] = useState<string>("");
    const [items, setItems] = useState<ApportionmentItem[]>([]);
    const [apportionmentTemplate, setApportionmentTemplate] = useState<InvoiceApportionmentTemplateDTO | null>(null);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [templateMessage, setTemplateMessage] = useState<string | null>(null);

    const getDefaultIssueDate = useCallback(() => {
        return referenceMonth ? `${referenceMonth}-01` : new Date().toISOString().slice(0, 10);
    }, [referenceMonth]);

    const getTemplateReferenceDate = useCallback(() => {
        return issueDate || getDefaultIssueDate();
    }, [getDefaultIssueDate, issueDate]);

    const buildItemsFromTemplate = useCallback((
        template: InvoiceApportionmentTemplateDTO,
        amount: number
    ): ApportionmentItem[] => {
        return template.items.map(item => {
            const percentage = Number(item.percentage);
            const allocation = amount > 0
                ? roundMoney((percentage / 100) * amount)
                : Number(item.allocation);

            return {
                sectorId: item.sectorId,
                sectorName: item.sectorName,
                allocation,
                percentage: Number(percentage.toFixed(2)),
                isManual: false
            };
        });
    }, []);

    const applyTemplate = useCallback((template: InvoiceApportionmentTemplateDTO, amount: number) => {
        setItems(buildItemsFromTemplate(template, amount));
        setTemplateMessage(
            `Padrão do mês anterior aplicado com base na nota ${template.sourceInvoiceNumber}.`
        );
    }, [buildItemsFromTemplate]);

    const loadPreviousTemplate = useCallback(async (referenceDate: string, amount: number) => {
        if (!contract?.id) return;

        setLoadingTemplate(true);
        setTemplateMessage(null);

        try {
            const template = await InvoiceService.getPreviousApportionmentTemplate(contract.id, referenceDate);
            setApportionmentTemplate(template);

            if (template && template.items.length > 0) {
                applyTemplate(template, amount);
                return;
            }

            setTemplateMessage("Nenhum padrão encontrado no mês anterior para este contrato.");
        } catch (error) {
            console.error("Erro ao buscar padrão de rateio anterior:", error);
            setTemplateMessage("Não foi possível buscar o padrão do mês anterior.");
        } finally {
            setLoadingTemplate(false);
        }
    }, [applyTemplate, contract?.id]);

    useEffect(() => {

        if (!isOpen || !contract) return;

        if (mode === 'create') {
            const defaultIssueDate = getDefaultIssueDate();
            setIssueDate(defaultIssueDate);
            setDueDate("");
            setNumber("");
            setTotalAmount(0);
            setItems([]);
            setApportionmentTemplate(null);
            setTemplateMessage(null);

            SectorService.getByContract(contract.id)
                .then((data: SectorFromDB[]) => {
                    setAllSectors(data);
                })
                .catch(err => console.error("Erro ao buscar setores", err));

            loadPreviousTemplate(defaultIssueDate, 0);
            return;
        }
        if (mode === 'view') {
            const invoiceId = contract.currentInvoice?.id;

            if (!invoiceId) {
                console.error("Invoice ID não encontrado para visualização.");
                return;
            }

            api.get<InvoiceViewResponse>(`/invoices/${invoiceId}`)
                .then((response) => {
                    const invoice = response.data;

                    setNumber(invoice.number);
                    setTotalAmount(Number(invoice.totalAmount));
                    setIssueDate(invoice.issueDate);
                    setDueDate(invoice.dueDate);

                    const mappedItems: ApportionmentItem[] = invoice.items.map(item => {
                        const allocation = Number(item.allocation);
                        const total = Number(invoice.totalAmount);

                        return {
                            sectorId: item.sectorId,
                            sectorName: item.sectorName,
                            allocation,
                            percentage: total > 0 ? Number(((allocation / total) * 100).toFixed(2)) : 0,
                            isManual: true
                        };
                    });

                    setItems(mappedItems);
                })
                .catch(err => console.error("Erro ao buscar nota fiscal", err));
        }
    }, [getDefaultIssueDate, isOpen, contract, loadPreviousTemplate, mode]);

    const balanceSectors = (total: number, currentItems: ApportionmentItem[]) => {
        if (total <= 0 || currentItems.length === 0) return;

        const manualItems = currentItems.filter(i => i.isManual);
        const autoItems = currentItems.filter(i => !i.isManual);

        const totalManualMoney = manualItems.reduce((sum, i) => sum + i.allocation, 0);
        const remainingMoney = total - totalManualMoney;

        if (autoItems.length > 0) {
            const autoPercentageTotal = autoItems.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
            const shouldUsePercentages = autoPercentageTotal > 0;

            currentItems.forEach(item => {
                if (!item.isManual) {
                    const distributedValue = shouldUsePercentages
                        ? remainingMoney * (Number(item.percentage || 0) / autoPercentageTotal)
                        : remainingMoney > 0 ? remainingMoney / autoItems.length : 0;

                    item.allocation = roundMoney(distributedValue);
                    item.percentage = total > 0 ? Number(((item.allocation / total) * 100).toFixed(2)) : 0;
                }
            });
        }
        setItems([...currentItems]);
    };

    const handleAddSector = () => {
        if (!selectedSectorId) return;

        const sectorData = allSectors.find(s => s.id === selectedSectorId);
        if (!sectorData) return;

        const alreadyExists = items.some(i => i.sectorId === selectedSectorId);
        if (alreadyExists) {
            alert("Este setor já foi adicionado ao rateio!");
            return;
        }

        const newItem: ApportionmentItem = {
            sectorId: sectorData.id,
            sectorName: sectorData.name,
            allocation: 0,
            percentage: 0,
            isManual: false
        };

        const updatedItems = [...items, newItem];
        setSelectedSectorId("");

        balanceSectors(totalAmount, updatedItems);
    };


    const handleRemoveSector = (sectorId: string) => {
        const updatedItems = items.filter(item => item.sectorId !== sectorId);

        balanceSectors(totalAmount, updatedItems);
    };

    const handleTotalAmountChange = (val: number) => {
        setTotalAmount(val);
        const updated = items.map(item => {
            if (item.isManual) {
                item.percentage = val > 0 ? Number(((item.allocation / val) * 100).toFixed(2)) : 0;
            }
            return item;
        });
        balanceSectors(val, updated);
    };

    const handleSectorValueChange = (index: number, value: number) => {
        const updated = [...items];
        updated[index].allocation = value;
        updated[index].percentage = totalAmount > 0 ? Number(((value / totalAmount) * 100).toFixed(2)) : 0;
        updated[index].isManual = true;
        balanceSectors(totalAmount, updated);
    };

    const handleSectorPercentChange = (index: number, percent: number) => {
        const updated = [...items];
        updated[index].percentage = percent;
        updated[index].allocation = totalAmount > 0 ? Number(((percent / 100) * totalAmount).toFixed(2)) : 0;
        updated[index].isManual = true;
        balanceSectors(totalAmount, updated);
    };

    const toggleLock = (index: number) => {
        const updated = [...items];
        updated[index].isManual = !updated[index].isManual;
        balanceSectors(totalAmount, updated);
    };

    const handleReloadTemplate = () => {
        loadPreviousTemplate(getTemplateReferenceDate(), totalAmount);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'view') return;

        if (!contract?.id) {
            alert("Contrato não encontrado para lançar a nota.");
            return;
        }

        if (items.length === 0) {
            alert("Por favor, adicione pelo menos um setor para o rateio.");
            return;
        }

        const sumAllocations = items.reduce((sum, i) => sum + i.allocation, 0);
        if (Math.abs(sumAllocations - totalAmount) > 1) {
            alert("Erro: A soma dos rateios por setor precisa ser igual ao valor total da nota!");
            return;
        }

        const payload = {
            contractId: contract.id,
            number: Number(number),
            totalAmount: Number(totalAmount),
            issueDate,
            dueDate,
            items: items.map(i => ({
                sectorId: i.sectorId,
                allocation: Number(i.allocation)
            }))
        };

        try {
            console.log("Enviando payload:", payload);
            await api.post('/invoices', payload);

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar nota:", error);
        }
    };
    if (!isOpen || !contract) return null;
    const isView = mode === 'view';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>
                    {isView ? "Visualizar Nota Fiscal" : "Lançar Nota Fiscal"}
                </h2>
                <p className={styles.subtitle}>Empresa: <strong>{contract.enterpriseName}</strong></p>

                <form onSubmit={handleSubmit} className={styles.form}>

                    <div className={styles.row}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Número da Nota</label>
                            <input type="number" required disabled={isView} className={styles.input} value={number} onChange={(e) => setNumber(Number(e.target.value))} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Valor Total (R$)</label>
                            <input type="number" required disabled={isView} className={styles.input} value={totalAmount || ""} onChange={(e) => handleTotalAmountChange(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Data de Emissão</label>
                            <input type="date" required disabled={isView} className={styles.input} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className={styles.label}>Data de Vencimento</label>
                            <input type="date" required disabled={isView} className={styles.input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {!isView && (
                        <div className={styles.templateBox}>
                            <div>
                                <strong>Padrão de rateio</strong>
                                <p>
                                    {templateMessage ?? "Ao lançar a nota, o sistema busca o rateio do mês anterior deste contrato."}
                                </p>
                                {apportionmentTemplate && (
                                    <span>
                                        Origem: nota {apportionmentTemplate.sourceInvoiceNumber} de {apportionmentTemplate.sourceIssueDate}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                className={styles.templateButton}
                                onClick={handleReloadTemplate}
                                disabled={loadingTemplate}
                            >
                                {loadingTemplate ? "Buscando..." : "Reaplicar padrão"}
                            </button>
                        </div>
                    )}

                    {!isView && (
                        <div className={styles.selectionBox}>
                            <label className={styles.label}>Selecione os Setores Participantes</label>
                            <div className={styles.row} style={{ gap: '10px' }}>
                                <select
                                    className={styles.select}
                                    value={selectedSectorId}
                                    onChange={(e) => setSelectedSectorId(e.target.value)}
                                >
                                    <option value="">-- Escolha um Setor para adicionar --</option>
                                    {allSectors.map(sec => (
                                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={handleAddSector}
                                    disabled={!selectedSectorId}
                                >
                                    <Plus size={18} weight="bold" />
                                </button>
                            </div>
                        </div>
                    )}

                    <h3 className={styles.sectionTitle}>Distribuição do Rateio</h3>

                    {items.length === 0 ? (
                        <p className={styles.emptyText}>Nenhum setor adicionado a esta nota ainda.</p>
                    ) : (
                        <div className={styles.sectorsContainer}>
                            {items.map((item, index) => (
                                <div key={item.sectorId} className={styles.sectorRow}>


                                    <button
                                        type="button"
                                        disabled={isView}
                                        className={`${styles.lockButton} ${item.isManual ? styles.locked : ''}`}
                                        onClick={() => toggleLock(index)}
                                        title={item.isManual ? "Manual (Travado)" : "Automático"}
                                    >
                                        {item.isManual ? <Lock size={18} weight="fill" /> : <LockOpen size={18} />}
                                    </button>

                                    <span className={styles.sectorName}>{item.sectorName}</span>

                                    <div className={styles.inputWrapper}>
                                        <span className={styles.currencyPrefix}>R$</span>
                                        <input
                                            type="number"
                                            disabled={isView}
                                            className={styles.sectorInput}
                                            value={item.allocation || ""}
                                            onChange={(e) => handleSectorValueChange(index, Number(e.target.value))}
                                        />
                                    </div>

                                    <div className={styles.inputWrapper} style={{ maxWidth: '85px' }}>
                                        <input
                                            type="number"
                                            disabled={isView}
                                            className={styles.sectorInput}
                                            style={{ paddingRight: '20px', textAlign: 'right', paddingLeft: '10px' }}
                                            value={item.percentage || ""}
                                            onChange={(e) => handleSectorPercentChange(index, Number(e.target.value))}
                                        />
                                        <span className={styles.percentSuffix}>%</span>
                                    </div>

                                    {!isView && (
                                        <button
                                            type="button"
                                            className={styles.deleteButton}
                                            onClick={() => handleRemoveSector(item.sectorId)}
                                        >
                                            <Trash size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {items.length > 0 && (
                        <div className={styles.totalIndicator}>
                            Soma do Rateio: <strong>R$ {items.reduce((sum, i) => sum + i.allocation, 0).toFixed(2)}</strong> de R$ {totalAmount.toFixed(2)}
                        </div>
                    )}

                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            {isView ? "Fechar" : "Cancelar"}
                        </button>
                        {!isView && (
                            <button type="submit" className={styles.submitButton}>
                                Salvar Nota Fiscal
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
