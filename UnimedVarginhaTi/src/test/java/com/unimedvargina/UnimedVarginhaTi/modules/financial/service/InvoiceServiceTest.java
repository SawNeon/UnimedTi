package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Apportionment;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ApportionmentRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.InvoiceRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.service.SectorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Cobre as regras de integridade do rateio de fatura — o controle que a planilha
 * não conseguia impor.
 */
@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ApportionmentRepository apportionmentRepository;

    @Mock
    private ContractService contractService;

    @Mock
    private SectorService sectorService;

    @InjectMocks
    private InvoiceService invoiceService;

    private static final UUID CONTRACT_ID = UUID.randomUUID();
    private static final UUID SECTOR_A = UUID.randomUUID();
    private static final UUID SECTOR_B = UUID.randomUUID();

    @Test
    @DisplayName("grava a fatura quando a soma do rateio fecha com o valor total")
    void createsInvoiceWhenApportionmentMatchesTotal() {
        when(contractService.findById(CONTRACT_ID)).thenReturn(new Contract());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(call -> call.getArgument(0));
        when(sectorService.findById(SECTOR_A)).thenReturn(Optional.of(sector(SECTOR_A)));
        when(sectorService.findById(SECTOR_B)).thenReturn(Optional.of(sector(SECTOR_B)));

        InvoiceRequestDTO request = request(
                new BigDecimal("1500.00"),
                item(SECTOR_A, "1000.00"),
                item(SECTOR_B, "500.00"));

        Invoice saved = invoiceService.createInvoiceWithApportionment(request);

        assertThat(saved.getAmount()).isEqualByComparingTo("1500.00");
        assertThat(saved.getStatus()).isEqualTo(InvoiceStatus.ISSUED);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Apportionment>> captor = ArgumentCaptor.forClass(List.class);
        verify(apportionmentRepository).saveAll(captor.capture());
        assertThat(captor.getValue())
                .extracting(Apportionment::getAllocation)
                .containsExactly(new BigDecimal("1000.00"), new BigDecimal("500.00"));
    }

    @Test
    @DisplayName("aceita soma equivalente com escala diferente (1500 == 1500.00)")
    void acceptsEquivalentValuesWithDifferentScale() {
        when(contractService.findById(CONTRACT_ID)).thenReturn(new Contract());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(call -> call.getArgument(0));
        when(sectorService.findById(SECTOR_A)).thenReturn(Optional.of(sector(SECTOR_A)));

        InvoiceRequestDTO request = request(
                new BigDecimal("1500"),
                item(SECTOR_A, "1500.00"));

        assertThat(invoiceService.createInvoiceWithApportionment(request)).isNotNull();
    }

    @Test
    @DisplayName("rejeita quando a soma do rateio é menor que o valor da fatura")
    void rejectsWhenApportionmentIsLowerThanTotal() {
        when(contractService.findById(CONTRACT_ID)).thenReturn(new Contract());

        InvoiceRequestDTO request = request(
                new BigDecimal("1500.00"),
                item(SECTOR_A, "1000.00"),
                item(SECTOR_B, "400.00"));

        assertThatThrownBy(() -> invoiceService.createInvoiceWithApportionment(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("1400.00")
                .hasMessageContaining("1500.00")
                .hasMessageContaining("-100.00");

        verify(invoiceRepository, never()).save(any());
        verify(apportionmentRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("rejeita quando a soma do rateio ultrapassa o valor da fatura")
    void rejectsWhenApportionmentExceedsTotal() {
        when(contractService.findById(CONTRACT_ID)).thenReturn(new Contract());

        InvoiceRequestDTO request = request(
                new BigDecimal("1000.00"),
                item(SECTOR_A, "600.00"),
                item(SECTOR_B, "600.00"));

        assertThatThrownBy(() -> invoiceService.createInvoiceWithApportionment(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("200.00");

        verify(invoiceRepository, never()).save(any());
    }

    @Test
    @DisplayName("rejeita o mesmo setor repetido no rateio")
    void rejectsDuplicatedSector() {
        when(contractService.findById(CONTRACT_ID)).thenReturn(new Contract());

        InvoiceRequestDTO request = request(
                new BigDecimal("1000.00"),
                item(SECTOR_A, "500.00"),
                item(SECTOR_A, "500.00"));

        assertThatThrownBy(() -> invoiceService.createInvoiceWithApportionment(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("mais de uma vez");

        verify(invoiceRepository, never()).save(any());
    }

    @Test
    @DisplayName("rejeita vencimento anterior à emissão")
    void rejectsDueDateBeforeIssueDate() {
        when(contractService.findById(CONTRACT_ID)).thenReturn(new Contract());

        InvoiceRequestDTO request = new InvoiceRequestDTO(
                CONTRACT_ID, 1, new BigDecimal("100.00"),
                LocalDate.of(2026, 3, 10),
                LocalDate.of(2026, 3, 5),
                List.of(item(SECTOR_A, "100.00")));

        assertThatThrownBy(() -> invoiceService.createInvoiceWithApportionment(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("vencimento");

        verify(invoiceRepository, never()).save(any());
    }

    @Test
    @DisplayName("rejeita rateio para setor inexistente")
    void rejectsUnknownSector() {
        when(contractService.findById(CONTRACT_ID)).thenReturn(new Contract());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(call -> call.getArgument(0));
        when(sectorService.findById(SECTOR_A)).thenReturn(Optional.empty());

        InvoiceRequestDTO request = request(
                new BigDecimal("100.00"),
                item(SECTOR_A, "100.00"));

        assertThatThrownBy(() -> invoiceService.createInvoiceWithApportionment(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(apportionmentRepository, never()).saveAll(any());
    }

    private static InvoiceRequestDTO request(BigDecimal total,
                                             InvoiceRequestDTO.ApportionmentItemDTO... items) {
        return new InvoiceRequestDTO(
                CONTRACT_ID, 1, total,
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 3, 31),
                List.of(items));
    }

    private static InvoiceRequestDTO.ApportionmentItemDTO item(UUID sectorId, String allocation) {
        return new InvoiceRequestDTO.ApportionmentItemDTO(sectorId, new BigDecimal(allocation));
    }

    private static Sector sector(UUID id) {
        Sector sector = new Sector();
        sector.setId(id);
        sector.setName("Setor " + id.toString().substring(0, 4));
        sector.setCostCenterCode(100);
        return sector;
    }
}
