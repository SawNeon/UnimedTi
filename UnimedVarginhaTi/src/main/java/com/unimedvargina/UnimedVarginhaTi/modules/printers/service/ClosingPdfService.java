package com.unimedvargina.UnimedVarginhaTi.modules.printers.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.ClosingDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * PDF do rateio de uma empresa, para anexar a nota.
 *
 * <p>Reproduz a aba PRINT da planilha, que e o papel que hoje vai para o
 * Financeiro: uma tabela por empresa, com o codigo do centro de custo, o codigo do
 * Piramide, o consumo e o valor. Uma empresa por PDF, como na planilha -- o
 * Financeiro lanca uma nota por CNPJ e nao tem o que fazer com a tabela do outro.
 */
@Service
public class ClosingPdfService {

    private static final Locale BR = Locale.of("pt", "BR");
    private static final DateTimeFormatter MES = DateTimeFormatter.ofPattern("MM/yyyy");

    private static final Font TITULO = new Font(Font.HELVETICA, 14, Font.BOLD);
    private static final Font SUBTITULO = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);
    private static final Font CABECALHO = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);
    private static final Font CELULA = new Font(Font.HELVETICA, 8);
    private static final Font TOTAL = new Font(Font.HELVETICA, 9, Font.BOLD);

    private static final Color VERDE = new Color(20, 101, 86);
    private static final Color ZEBRA = new Color(244, 247, 246);

    @Autowired
    private PrinterClosingService closingService;

    /** O PDF e o nome com que ele deve ser salvo, para o anexo nao virar "download (3).pdf". */
    public record Pdf(String fileName, byte[] content) {}

    public Pdf build(LocalDate competence, UUID enterpriseId) {
        ClosingDTO fechamento = closingService.calculate(competence);

        ClosingDTO.EnterpriseTotalDTO empresa = fechamento.enterprises().stream()
                .filter(e -> e.enterpriseId().equals(enterpriseId))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException(
                        "A empresa informada não tem leitura de impressora em " + MES.format(competence) + "."));

        List<ClosingDTO.SectorTotalDTO> linhas = fechamento.sectors().stream()
                .filter(s -> enterpriseId.equals(s.enterpriseId()))
                .toList();

        Document documento = new Document(PageSize.A4, 36, 36, 40, 40);
        ByteArrayOutputStream saida = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(documento, saida);
            documento.open();

            documento.add(cabecalho(empresa.enterpriseName(), competence));
            documento.add(tabela(linhas, fechamento));
            documento.add(rodape(empresa, linhas));

            documento.close();
        } catch (DocumentException e) {
            throw new BusinessRuleException("Não foi possível gerar o PDF do rateio: " + e.getMessage());
        }

        return new Pdf(nomeDoArquivo(competence, empresa.enterpriseName()), saida.toByteArray());
    }

    private static String nomeDoArquivo(LocalDate competence, String enterpriseName) {
        String empresa = enterpriseName.replaceAll("[^A-Za-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return "rateio-impressoras-%s-%s.pdf"
                .formatted(empresa.toLowerCase(BR), MES.format(competence).replace('/', '-'));
    }

    private Element cabecalho(String empresa, LocalDate competence) {
        Paragraph titulo = new Paragraph("Rateio de impressão — " + empresa, TITULO);
        titulo.setSpacingAfter(2);

        Paragraph mes = new Paragraph("Competência " + MES.format(competence), SUBTITULO);
        mes.setSpacingAfter(12);

        Paragraph bloco = new Paragraph();
        bloco.add(titulo);
        bloco.add(mes);
        return bloco;
    }

    private PdfPTable tabela(List<ClosingDTO.SectorTotalDTO> linhas, ClosingDTO fechamento)
            throws DocumentException {
        // A coluna do Piramide precisa caber o titulo inteiro; mais estreita, ele
        // quebra no meio da palavra e o cabecalho fica ilegivel.
        PdfPTable tabela = new PdfPTable(new float[]{1.0f, 1.7f, 4.0f, 1.5f, 1.3f, 1.7f, 1.7f, 1.9f});
        tabela.setWidthPercentage(100);
        tabela.setHeaderRows(1);

        for (String titulo : new String[]{"COD", "PIRÂMIDE", "CENTRO DE CUSTO",
                "CONS. PRETO", "CONS. COR", "VALOR PRETO", "VALOR COR", "TOTAL"}) {
            PdfPCell celula = new PdfPCell(new Phrase(titulo, CABECALHO));
            celula.setBackgroundColor(VERDE);
            celula.setPadding(5);
            celula.setBorderColor(VERDE);
            tabela.addCell(celula);
        }

        boolean zebra = false;
        for (ClosingDTO.SectorTotalDTO linha : linhas) {
            Color fundo = zebra ? ZEBRA : Color.WHITE;
            zebra = !zebra;

            // Preto e cor separados pelo preco da pagina, como na planilha. A
            // franquia da empresa nao entra aqui: ela e do contrato, nao de um
            // centro de custo, e aparece no rodape.
            BigDecimal valorPreto = linha.blackPages().multiply(fechamento.blackPageCost());
            BigDecimal valorCor = linha.colorPages().multiply(fechamento.colorPageCost());

            adicionar(tabela, texto(linha.costCenterCode()), fundo, Element.ALIGN_LEFT);
            adicionar(tabela, texto(linha.pyramidCode()), fundo, Element.ALIGN_LEFT);
            adicionar(tabela, linha.sectorName(), fundo, Element.ALIGN_LEFT);
            adicionar(tabela, inteiro(linha.blackPages()), fundo, Element.ALIGN_RIGHT);
            adicionar(tabela, inteiro(linha.colorPages()), fundo, Element.ALIGN_RIGHT);
            adicionar(tabela, dinheiro(valorPreto), fundo, Element.ALIGN_RIGHT);
            adicionar(tabela, dinheiro(valorCor), fundo, Element.ALIGN_RIGHT);
            adicionar(tabela, dinheiro(linha.cost()), fundo, Element.ALIGN_RIGHT);
        }

        tabela.setSpacingAfter(14);
        return tabela;
    }

    private Element rodape(ClosingDTO.EnterpriseTotalDTO empresa, List<ClosingDTO.SectorTotalDTO> linhas) {
        BigDecimal somaSetores = linhas.stream()
                .map(ClosingDTO.SectorTotalDTO::cost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Paragraph bloco = new Paragraph();

        bloco.add(new Paragraph(
                "Páginas: %s pretas e %s coloridas".formatted(
                        NumberFormat.getIntegerInstance(BR).format(empresa.blackPages()),
                        NumberFormat.getIntegerInstance(BR).format(empresa.colorPages())),
                CELULA));

        if (empresa.franchiseApplied()) {
            bloco.add(new Paragraph(
                    "Franquia de cor aplicada: " + dinheiro(empresa.colorCost())
                            + " (valor do contrato, não rateado por centro de custo)", CELULA));
        }
        if (empresa.fixedCharge().compareTo(BigDecimal.ZERO) != 0) {
            bloco.add(new Paragraph("Acréscimo fixo: " + dinheiro(empresa.fixedCharge()), CELULA));
        }

        bloco.add(new Paragraph("Soma dos centros de custo: " + dinheiro(somaSetores), CELULA));

        Paragraph total = new Paragraph("Total da empresa: " + dinheiro(empresa.total()), TOTAL);
        total.setSpacingBefore(6);
        bloco.add(total);

        return bloco;
    }

    private void adicionar(PdfPTable tabela, String valor, Color fundo, int alinhamento) {
        PdfPCell celula = new PdfPCell(new Phrase(valor, CELULA));
        celula.setBackgroundColor(fundo);
        celula.setHorizontalAlignment(alinhamento);
        celula.setPadding(4);
        celula.setBorderColor(new Color(220, 226, 224));
        tabela.addCell(celula);
    }

    private static String texto(String valor) {
        return valor == null || valor.isBlank() ? "—" : valor;
    }

    private static String inteiro(BigDecimal valor) {
        return NumberFormat.getIntegerInstance(BR).format(valor.setScale(0, RoundingMode.HALF_UP));
    }

    private static String dinheiro(BigDecimal valor) {
        return NumberFormat.getCurrencyInstance(BR).format(valor);
    }
}
