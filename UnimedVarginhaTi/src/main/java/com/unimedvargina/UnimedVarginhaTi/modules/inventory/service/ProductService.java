package com.unimedvargina.UnimedVarginhaTi.modules.inventory.service;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto.ProductRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto.ProductResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto.StockMovementRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto.StockTransferRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.InventoryMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.Product;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.ProductStockBalance;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository.InventoryMovementRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository.ProductRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository.ProductStockBalanceRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.OperationalUnitRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.SectorRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ProductService {

    /**
     * Tipos de movimentacao de estoque. Padronizados em maiusculo — antes a entrada
     * gravava "in" e a saida "OUT", o que quebrava qualquer filtro por tipo.
     */
    public static final String MOVEMENT_IN = "IN";
    public static final String MOVEMENT_OUT = "OUT";
    public static final String MOVEMENT_TRANSFER_IN = "TRANSFER_IN";
    public static final String MOVEMENT_TRANSFER_OUT = "TRANSFER_OUT";

    @Autowired
    private ProductRepository repository;

    @Autowired
    private InventoryMovementRepository movementRepository;

    @Autowired
    private ProductStockBalanceRepository balanceRepository;

    @Autowired
    private OperationalUnitRepository unitRepository;

    @Autowired
    private SectorRepository sectorRepository;

    /**
     * Cria o produto no catalogo compartilhado e abre saldo zerado em TODAS as
     * unidades. Assim o item ja existe nos dois estoques desde o cadastro, e a
     * listagem de qualquer equipe encontra a linha correspondente.
     */
    @Transactional
    public ProductResponseDTO create(ProductRequestDTO request, UUID unitId) {
        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());

        for (OperationalUnit unit : unitRepository.findAll()) {
            product.getBalances().add(new ProductStockBalance(product, unit, request.minStockLevel()));
        }

        Product saved = repository.save(product);
        return ProductResponseDTO.from(requireBalance(saved.getId(), unitId));
    }

    /**
     * Atualiza os dados do catalogo (compartilhados) e o ponto de pedido, que e
     * proprio da unidade em contexto — o hospital nao precisa do mesmo minimo da matriz.
     */
    @Transactional
    public ProductResponseDTO update(UUID productId, ProductRequestDTO request, UUID unitId) {
        Product product = findById(productId);
        product.setName(request.name());
        product.setDescription(request.description());
        repository.save(product);

        ProductStockBalance balance = requireBalance(productId, unitId);
        balance.setMinStockLevel(request.minStockLevel());
        balanceRepository.save(balance);

        return ProductResponseDTO.from(balance);
    }

    public void delete(UUID id) {
        repository.deleteById(id);
    }

    public Product findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    /** Listagem do estoque de uma unidade — nunca soma os dois lados. */
    public Page<ProductResponseDTO> listByUnit(UUID unitId, int page, int size) {
        requireUnit(unitId);
        return balanceRepository.findByUnitId(unitId, PageRequest.of(page, size))
                .map(ProductResponseDTO::from);
    }

    @Transactional
    public ProductResponseDTO addStock(UUID productId, UUID unitId, StockMovementRequestDTO request) {
        ProductStockBalance balance = requireBalance(productId, unitId);

        balance.setCurrentStock(balance.getCurrentStock() + request.quantity());
        balanceRepository.save(balance);

        movementRepository.save(buildMovement(balance, request.quantity(), request.reason(),
                request.responsible(), resolveSector(request.sectorId()), MOVEMENT_IN, null));

        return ProductResponseDTO.from(balance);
    }

    @Transactional
    public ProductResponseDTO removeStock(UUID productId, UUID unitId, StockMovementRequestDTO request) {
        ProductStockBalance balance = requireBalance(productId, unitId);
        requireSufficientStock(balance, request.quantity());

        balance.setCurrentStock(balance.getCurrentStock() - request.quantity());
        balanceRepository.save(balance);

        movementRepository.save(buildMovement(balance, request.quantity(), request.reason(),
                request.responsible(), resolveSector(request.sectorId()), MOVEMENT_OUT, null));

        return ProductResponseDTO.from(balance);
    }

    /**
     * Move quantidade de um estoque para o outro em uma unica transacao: o total
     * somado das duas unidades nao muda. As duas movimentacoes geradas compartilham
     * um {@code transferGroupId}, o que permite reconstruir o par depois.
     */
    @Transactional
    public ProductResponseDTO transfer(UUID productId, StockTransferRequestDTO request) {
        if (request.fromUnitId().equals(request.toUnitId())) {
            throw new BusinessRuleException("A unidade de origem e a de destino devem ser diferentes.");
        }

        ProductStockBalance origin = requireBalance(productId, request.fromUnitId());
        ProductStockBalance destination = requireBalance(productId, request.toUnitId());
        requireSufficientStock(origin, request.quantity());

        origin.setCurrentStock(origin.getCurrentStock() - request.quantity());
        destination.setCurrentStock(destination.getCurrentStock() + request.quantity());
        balanceRepository.save(origin);
        balanceRepository.save(destination);

        UUID transferGroupId = UUID.randomUUID();
        movementRepository.save(buildMovement(origin, request.quantity(), request.reason(),
                request.responsible(), null, MOVEMENT_TRANSFER_OUT, transferGroupId));
        movementRepository.save(buildMovement(destination, request.quantity(), request.reason(),
                request.responsible(), null, MOVEMENT_TRANSFER_IN, transferGroupId));

        return ProductResponseDTO.from(origin);
    }

    private InventoryMovements buildMovement(ProductStockBalance balance, Integer quantity, String reason,
                                             String responsible, Sector sector, String type, UUID transferGroupId) {
        InventoryMovements movement = new InventoryMovements();
        movement.setProduct(balance.getProduct());
        movement.setUnit(balance.getUnit());
        movement.setQuantity(quantity);
        movement.setReason(reason);
        movement.setResponsible(responsible);
        movement.setSector(sector);
        movement.setType(type);
        movement.setTransferGroupId(transferGroupId);
        return movement;
    }

    /**
     * O saldo tem de existir para a unidade pedida. Produtos cadastrados antes de
     * uma unidade nova nao teriam a linha, entao ela e aberta zerada na hora em vez
     * de estourar erro para o operador.
     */
    private ProductStockBalance requireBalance(UUID productId, UUID unitId) {
        return balanceRepository.findByProductIdAndUnitId(productId, unitId)
                .orElseGet(() -> {
                    Product product = findById(productId);
                    OperationalUnit unit = requireUnit(unitId);
                    return balanceRepository.save(new ProductStockBalance(product, unit, 0));
                });
    }

    private OperationalUnit requireUnit(UUID unitId) {
        return unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unidade operacional", unitId));
    }

    private Sector resolveSector(UUID sectorId) {
        if (sectorId == null) {
            return null;
        }
        return sectorRepository.findById(sectorId)
                .orElseThrow(() -> new ResourceNotFoundException("Setor", sectorId));
    }

    private void requireSufficientStock(ProductStockBalance balance, int quantity) {
        if (balance.getCurrentStock() < quantity) {
            throw new BusinessRuleException(
                    "Saida de %d unidade(s) maior que o estoque de %s em %s (%d)."
                            .formatted(quantity, balance.getProduct().getName(),
                                    balance.getUnit().getName(), balance.getCurrentStock()));
        }
    }
}
