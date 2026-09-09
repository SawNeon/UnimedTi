package com.unimedvargina.UnimedVarginhaTi.modules.printers.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Leitura do contador de uma impressora em uma competencia.
 *
 * <p>O consumo e a DIFERENCA entre o contador do fim e o do inicio, como na
 * planilha. O inicial vem do fechamento anterior, e o final e importado do
 * PrintWay ou digitado.
 */
@Entity
@Table(
        name = "printer_readings",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_printer_readings_printer_competence",
                columnNames = {"printer_id", "competence"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class PrinterReading extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "printer_id", nullable = false)
    private Printer printer;

    /** Mes de referencia, sempre no dia 1. */
    @Column(nullable = false)
    private LocalDate competence;

    @Column(name = "black_start", nullable = false)
    private Integer blackStart = 0;

    @Column(name = "black_end", nullable = false)
    private Integer blackEnd = 0;

    @Column(name = "color_start", nullable = false)
    private Integer colorStart = 0;

    @Column(name = "color_end", nullable = false)
    private Integer colorEnd = 0;

    /** A3 tem o mesmo preco da A4 e entra no total da respectiva cor. */
    @Column(name = "a3_black", nullable = false)
    private Integer a3Black = 0;

    @Column(name = "a3_color", nullable = false)
    private Integer a3Color = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadingSource source = ReadingSource.PRINTWAY;

    /**
     * Verdadeiro quando alguem ajustou a mao um numero vindo do PrintWay. Guardar
     * isso preserva a origem, em vez de apagar de onde o dado veio.
     */
    @Column(nullable = false)
    private boolean corrected = false;

    private String notes;

    /**
     * Rateio aplicado neste mes. Copiado do padrao da impressora ao criar a
     * leitura, e editavel sem afetar meses anteriores.
     */
    @OneToMany(mappedBy = "reading", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.EAGER)
    private List<PrinterReadingShare> shares = new ArrayList<>();

    /** Paginas pretas do periodo, incluindo A3. */
    public int blackConsumption() {
        return Math.max(0, blackEnd - blackStart) + a3Black;
    }

    public int colorConsumption() {
        return Math.max(0, colorEnd - colorStart) + a3Color;
    }

    /**
     * Contador que andou para tras: impressora trocada, contador zerado ou numero
     * digitado errado. A leitura fica marcada para conferencia em vez de gerar um
     * consumo negativo que sumiria dentro da soma.
     */
    public boolean isInconsistent() {
        return blackEnd < blackStart || colorEnd < colorStart;
    }
}
