import { useState } from 'react';
import styles from '../pages/OrderList.module.css';

interface DeliverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (file: File | null) => Promise<void>;
}

export function DeliverModal({ isOpen, onClose, onConfirm }: DeliverModalProps) {
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        await onConfirm(invoiceFile);
        setIsSubmitting(false);
        setInvoiceFile(null);
    };

    const handleClose = () => {
        setInvoiceFile(null);
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                
                <h3 className={styles.modalTitle}>Confirmar Entrega</h3>
                <p className={styles.modalText}>Se desejar, anexe a Nota Fiscal (PDF ou Imagem):</p>
                
                <input 
                    type="file" 
                    accept=".pdf, image/*"
                    onChange={(e) => setInvoiceFile(e.target.files ? e.target.files[0] : null)}
                    className={styles.fileInput}
                />

                <div className={styles.buttonContainer}>
                    <button 
                        onClick={handleClose} 
                        disabled={isSubmitting}
                        className={styles.cancelButton}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className={styles.confirmButton}
                    >
                        {isSubmitting ? 'Enviando...' : 'Confirmar Entrega'}
                    </button>
                </div>
            </div>
        </div>
    );
}