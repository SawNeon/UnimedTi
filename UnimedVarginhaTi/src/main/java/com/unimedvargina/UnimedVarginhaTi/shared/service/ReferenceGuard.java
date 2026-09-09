package com.unimedvargina.UnimedVarginhaTi.shared.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Descobre se um cadastro ainda esta em uso antes de deixar excluir.
 *
 * <p>Setor e empresa sao referenciados por movimentacao, pedido, contrato e rateio.
 * Excluir sem olhar quebraria o historico -- e sem esta checagem o erro que chega
 * ao operador seria uma violacao de chave estrangeira, que nao diz o que fazer.
 *
 * <p>A consulta e por tabela de proposito: o mapa de dependencias e um fato do
 * schema, e trazer os repositorios de cada modulo para dentro de shared inverteria
 * a direcao das dependencias. Em compensacao, uma tabela nova que aponte para
 * setor ou empresa precisa ser adicionada AQUI -- senao a exclusao passa e a FK
 * barra depois, com mensagem ruim.
 */
@Component
public class ReferenceGuard {

    /** Como o operador chama aquilo, no singular e no plural. */
    private record Label(String singular, String plural) {
        String forCount(long total) {
            return total == 1 ? singular : plural;
        }
    }

    /** tabela -> rotulo legivel. */
    private static final Map<String, Label> SECTOR_REFERENCES = new LinkedHashMap<>();
    private static final Map<String, Label> ENTERPRISE_REFERENCES = new LinkedHashMap<>();

    static {
        SECTOR_REFERENCES.put("users", new Label("usuário", "usuários"));
        SECTOR_REFERENCES.put("inventory_movements",
                new Label("movimentação de estoque", "movimentações de estoque"));
        SECTOR_REFERENCES.put("asset_movements",
                new Label("movimentação de ativos", "movimentações de ativos"));
        SECTOR_REFERENCES.put("purchase_orders", new Label("pedido de compra", "pedidos de compra"));
        SECTOR_REFERENCES.put("apportionments",
                new Label("rateio de nota fiscal", "rateios de nota fiscal"));

        ENTERPRISE_REFERENCES.put("sectors", new Label("setor", "setores"));
        ENTERPRISE_REFERENCES.put("contracts", new Label("contrato", "contratos"));
    }

    @PersistenceContext
    private EntityManager entityManager;

    /** Descricao do que impede a exclusao do setor, ou vazio quando nada impede. */
    public Map<String, Long> sectorUsages(UUID sectorId) {
        return usages(SECTOR_REFERENCES, "sector_id", sectorId);
    }

    public Map<String, Long> enterpriseUsages(UUID enterpriseId) {
        return usages(ENTERPRISE_REFERENCES, "enterprise_id", enterpriseId);
    }

    private Map<String, Long> usages(Map<String, Label> references, String column, UUID id) {
        Map<String, Long> found = new LinkedHashMap<>();

        references.forEach((table, label) -> {
            // Nome de tabela e coluna vem das constantes acima, nunca da requisicao.
            Number total = (Number) entityManager
                    .createNativeQuery("SELECT COUNT(*) FROM " + table + " WHERE " + column + " = UUID_TO_BIN(:id)")
                    .setParameter("id", id.toString())
                    .getSingleResult();

            if (total.longValue() > 0) {
                found.put(label.forCount(total.longValue()), total.longValue());
            }
        });

        return found;
    }

    /** Monta a frase que explica ao operador por que nao da para excluir. */
    public static String describe(Map<String, Long> usages) {
        return usages.entrySet().stream()
                .map(entry -> "%d %s".formatted(entry.getValue(), entry.getKey()))
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
    }
}
