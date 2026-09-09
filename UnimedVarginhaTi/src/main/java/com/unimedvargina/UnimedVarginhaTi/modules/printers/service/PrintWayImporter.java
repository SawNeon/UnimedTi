package com.unimedvargina.UnimedVarginhaTi.modules.printers.service;

import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Le o relatorio "Impressoes e copias por impressora" exportado do PrintWay.
 *
 * <p>As colunas sao localizadas pelo TEXTO do cabecalho, e nao por posicao. O
 * relatorio tem colunas vazias entre as uteis e o cabecalho nao fica na primeira
 * linha; fixar indices quebraria em silencio, gravando o numero da coluna errada.
 */
@Component
public class PrintWayImporter {

    /** Uma linha util do relatorio. */
    public record Linha(
            String serialNumber,
            String modelo,
            Integer pretoFim,
            Integer corFim,
            Integer a3Preto,
            Integer a3Color
    ) {}

    private static final String COL_SERIE = "numero de serie";
    private static final String COL_IMPRESSORA = "impressora";
    private static final String COL_PRETO_FIM = "cont. fin. p&b";
    private static final String COL_COR_FIM = "cont. fin. color.";
    private static final String COL_A3_PRETO = "total a3 p&b";
    private static final String COL_A3_COR = "total a3 colorido";

    public List<Linha> ler(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BusinessRuleException("Selecione o arquivo exportado do PrintWay.");
        }

        try (InputStream in = arquivo.getInputStream(); Workbook wb = WorkbookFactory.create(in)) {
            Sheet sheet = wb.getSheetAt(0);

            int linhaCabecalho = encontrarCabecalho(sheet);
            Map<String, Integer> colunas = mapearColunas(sheet.getRow(linhaCabecalho));

            exigirColuna(colunas, COL_SERIE);
            exigirColuna(colunas, COL_PRETO_FIM);

            List<Linha> linhas = new ArrayList<>();
            for (int i = linhaCabecalho + 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String serie = texto(row, colunas.get(COL_SERIE));
                if (serie == null || serie.isBlank()) continue;

                linhas.add(new Linha(
                        serie.trim(),
                        texto(row, colunas.get(COL_IMPRESSORA)),
                        inteiro(row, colunas.get(COL_PRETO_FIM)),
                        inteiro(row, colunas.get(COL_COR_FIM)),
                        inteiro(row, colunas.get(COL_A3_PRETO)),
                        inteiro(row, colunas.get(COL_A3_COR))
                ));
            }

            if (linhas.isEmpty()) {
                throw new BusinessRuleException(
                        "O arquivo não tem nenhuma linha com número de série preenchido.");
            }

            return linhas;

        } catch (IOException e) {
            throw new BusinessRuleException("Não foi possível ler o arquivo. Envie o .xlsx do PrintWay.");
        }
    }

    /**
     * O cabecalho nao fica na primeira linha: o relatorio abre com titulo, periodo
     * e nome do cliente. Procura-se a linha que contem "numero de serie".
     */
    private int encontrarCabecalho(Sheet sheet) {
        int limite = Math.min(sheet.getLastRowNum(), 40);
        for (int i = 0; i <= limite; i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            for (Cell cell : row) {
                if (normalizar(valorTexto(cell)).equals(COL_SERIE)) {
                    return i;
                }
            }
        }
        throw new BusinessRuleException(
                "Cabeçalho não encontrado no arquivo. Esperada uma coluna \"Número de série\".");
    }

    private Map<String, Integer> mapearColunas(Row cabecalho) {
        Map<String, Integer> colunas = new LinkedHashMap<>();
        for (Cell cell : cabecalho) {
            String chave = normalizar(valorTexto(cell));
            if (!chave.isBlank()) {
                colunas.putIfAbsent(chave, cell.getColumnIndex());
            }
        }
        return colunas;
    }

    private void exigirColuna(Map<String, Integer> colunas, String chave) {
        if (!colunas.containsKey(chave)) {
            throw new BusinessRuleException(
                    "O arquivo não tem a coluna esperada \"" + chave + "\".");
        }
    }

    /** Sem acento, sem espaco duplicado, em minusculo: a acentuacao do cabecalho varia. */
    private String normalizar(String valor) {
        if (valor == null) return "";
        String semAcento = java.text.Normalizer.normalize(valor, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return semAcento.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private String valorTexto(Cell cell) {
        if (cell == null) return "";
        return cell.getCellType() == CellType.STRING ? cell.getStringCellValue() : "";
    }

    private String texto(Row row, Integer indice) {
        if (indice == null) return null;
        Cell cell = row.getCell(indice);
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> null;
        };
    }

    private Integer inteiro(Row row, Integer indice) {
        if (indice == null) return null;
        Cell cell = row.getCell(indice);
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case NUMERIC -> (int) cell.getNumericCellValue();
            case STRING -> {
                String bruto = cell.getStringCellValue().replaceAll("[^0-9-]", "");
                yield bruto.isBlank() ? null : Integer.valueOf(bruto);
            }
            default -> null;
        };
    }
}
