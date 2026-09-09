import { useEffect, useState } from 'react';
import { OrderService } from '../services/OrderService';
import styles from './OrderForm.module.css';
import { SectorService } from '../../../shared/services/sectorService';
import type { SectorDTO } from '../../../shared/types/Sector';
import { PlusCircle } from '@phosphor-icons/react';


interface OrderFormProps {
    onSucess: () => void;
}

export function OrderForm({ onSucess }: OrderFormProps) {
    const [Sectors, setSectors] = useState<SectorDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [request, setRequest] = useState<File | null>(null);

    const [numberRequest, setNumberRequest] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [sector, setSector] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const dataSectors = await SectorService.getAll();
                setSectors(dataSectors);
            } catch (error) {
                console.error("Erro ao buscar setores", error);
                alert("Erro ao carregar a lista de setores.");
            }
        };
        fetchSectors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!numberRequest || !description || !type || !sector) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            await OrderService.create({
                numberRequest,
                type,
                sector: { id: sector },
                description,
                expectedDeliveryDate
            }, request);
            setLoading(false);
            onSucess();
        } catch (error) {
            console.error("Erro ao criar pedido", error);
            alert("Erro ao criar pedido.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.content}>
                    <PlusCircle size={28} color="#146556" weight="bold" />
                    <h2 className={styles.title}>Adicionar Pedido</h2>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Número do Pedido*</label>
                        <input
                            type="text"
                            value={numberRequest}
                            onChange={(e) => setNumberRequest(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGrou}>
                        <label className={styles.label}>Setor</label>
                        <select
                            className={styles.input}
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            required
                        >
                            <option value="" disabled>Escolha um setor...</option>
                            {Sectors.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tipo de Pedido*</label>
                            <select
                                className={styles.input}
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                            >
                                <option value="" disabled>Escolha um tipo...</option>
                                <option value="HARDWARE">Hardware</option>
                                <option value="SOFTWARE">Software</option>
                                <option value="PERIPHERALS">Periféricos</option>
                                <option value="MAINTENANCE">Manutenção</option>
                                <option value="SUPPLY">Suprimento</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Descrição</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Data de Entrega Esperada</label>
                        <input
                            type="date"
                            value={expectedDeliveryDate}
                            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <input
                            type="file"
                            accept=".pdf, image/*"
                            onChange={(e) => setRequest(e.target.files ? e.target.files[0] : null)}
                            className={styles.input}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="button" className={styles.cancelButton} onClick={onSucess} disabled={loading}>
                            Cancelar
                        </button>

                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            Enviar Pedido
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}