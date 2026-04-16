import { useEffect, useState } from "react";
import type { OrderDTO } from "../types/Order";
import { OrderService } from "../services/OrderService";
import styles from "./OrderList.module.css";
import { CheckFatIcon, FileIcon, FunnelIcon } from "@phosphor-icons/react";
import { SectorService } from "../../../shared/services/sectorService";
import type { SectorDTO } from "../../../shared/types/Sector";
import { DeliverModal } from "../components/DeliverModal";

interface OrderWithSector extends Omit<OrderDTO, 'sector'> {
    sector?: (SectorDTO & { name: string });
}



interface OrderListProps { }

export function OrderList({ }: OrderListProps) {
    const [orders, setOrders] = useState<OrderWithSector[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [filterOrdered, setFilterOrdered] = useState<boolean>(false);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);



    useEffect(() => {
        loadOrders(currentPage);
    }, [currentPage]);

    const loadOrders = async (page: number) => {
        setLoading(true);
        try {
            const response = await OrderService.getAll(page - 1, itemsPerPage);
            const data = response.content;
            setTotalPages(response.totalPages);


            const dataSectors = await SectorService.getAll();
            const sectorsMap: Record<string, string> = {};

            dataSectors.forEach((sector: SectorDTO) => {
                if (sector.id) {
                    sectorsMap[sector.id] = sector.name;
                }
            });

            const ordersWithSectorName = data.map((order: OrderDTO) => ({
                ...order,
                sector: order.sector?.id && sectorsMap[order.sector.id]
                    ? { ...order.sector, name: sectorsMap[order.sector.id] }
                    : order.sector
            }));

            setOrders(ordersWithSectorName);
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeliveryModal = (order: OrderWithSector) => {
        if (order.id) {
            setSelectedOrderId(order.id);
            setIsDeliverModalOpen(true);
        }
    };
    const handleConfirmDelivery = async (file: File | null) => {
        if (!selectedOrderId) return;

        try {
            await OrderService.deliver(selectedOrderId, file);
            alert("Pedido marcado como entregue!");
            setIsDeliverModalOpen(false);
            loadOrders(currentPage);
        } catch (error) {
            console.error("Erro ao entregar pedido:", error);
            alert("Erro ao confirmar entrega.");
        }
    };

    const handleViewFile = async (id: string | undefined) => {
        if (!id) return;
        try {
            const fileBlob = await OrderService.viwerFile(id);
            const fileURL = URL.createObjectURL(fileBlob);
            window.open(fileURL, '_blank');
        } catch (error) {
            console.error("Erro ao visualizar arquivo:", error);
            alert("Erro ao visualizar arquivo.");
        }
    };


    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        if (window.confirm("Deseja realmente excluir este pedido?")) {
            try {
                await OrderService.delete(id);
                loadOrders(currentPage);
            } catch (error) {
                console.error("Erro ao deletar pedido:", error);
            }
        }
    };

    const filteredOrders = orders.filter(o =>
        o.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(o.numberRequest).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFilterOrdered = () => {
        setFilterOrdered(!filterOrdered);
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
                    <h2 className={styles.title}>Cadastro de Pedidos</h2>
                    <input
                        type="text"
                        placeholder="Busca de pedido..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Pedido</th>
                            <th>Data do Pedido</th>
                            <th>Categoria</th>
                            <th>Setor</th>
                            <th>Descrição</th>
                            <th>Status <button
                                className={styles.filterbtn}
                                onClick={handleFilterOrdered}
                                title="Filter Ordered Orders"
                            >
                                <FunnelIcon />
                            </button></th>
                            <th>Data de Entrega</th>
                            <th>Arquivos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                            .map(order => (
                                <tr key={order.id || Math.random()}>
                                    <td>{order.numberRequest}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString() || '-'}</td>
                                    <td>{order.type === 'HARDWARE' ? 'Hardware' : order.type === 'SOFTWARE' ? 'Software' : order.type === 'PERIPHERALS' ? 'Periféricos' : order.type === 'MAINTENANCE' ? 'Manutenção' : order.type === 'SUPPLY' ? 'Suprimento' : '-'}</td>
                                    <td>{order.sector?.name || order.sector?.id ? order.sector.name || order.sector.id : '-'}</td>
                                    <td>{order.description}</td>
                                    <td>{order.status == 'ORDERED' ? 'Pedido Realizado' : order.status === 'DELIVERED' ? 'Entregue' : order.status === 'CANCELLED' ? 'Cancelado' : '-'}</td>
                                    <td>{order.expectedDeliveryDate == null ? '-' : new Date(order.expectedDeliveryDate).toLocaleDateString()}</td>
                                    <td className={styles.fileCell}>
                                        {order.request && (
                                            <button
                                                className={styles.fileBtn}
                                                onClick={() => handleViewFile(order.request)}
                                                title="Visualizar solicitação"
                                            >
                                                <FileIcon size={20} />
                                            </button>
                                        )}

                                        {order.invoice && (
                                            <button
                                                className={styles.fileBtn}
                                                onClick={() => handleViewFile(order.invoice)}
                                                title="Visualizar fatura"
                                            >
                                                <FileIcon size={20} />
                                            </button>
                                        )}
                                    </td>
                                    <td className={styles.actionCell}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleOpenDeliveryModal(order)}
                                            title="Confirmar Entrega"
                                        >
                                            <CheckFatIcon size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
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

            <DeliverModal
                isOpen={isDeliverModalOpen}
                onClose={() => setIsDeliverModalOpen(false)}
                onConfirm={handleConfirmDelivery}
            />
        </div>
    );
}