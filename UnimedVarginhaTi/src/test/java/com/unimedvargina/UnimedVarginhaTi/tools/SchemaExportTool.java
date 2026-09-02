package com.unimedvargina.UnimedVarginhaTi.tools;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Ferramenta manual: gera em {@code target/schema-mysql.sql} o DDL MySQL que o
 * Hibernate espera para as entidades atuais.
 *
 * <p>Use ao criar ou alterar entidades: rode, compare o resultado com o schema já
 * versionado em {@code db/migration} e escreva a migration correspondente. Nunca
 * copie o arquivo inteiro por cima de uma migration já aplicada.
 *
 * <pre>{@code ./mvnw test -Dtest=SchemaExportTool}</pre>
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false",
        "spring.jpa.properties.hibernate.format_sql=true",
        "spring.jpa.properties.jakarta.persistence.schema-generation.scripts.action=create",
        "spring.jpa.properties.jakarta.persistence.schema-generation.scripts.create-target=target/schema-mysql.sql"
})
class SchemaExportTool {

    /** O DDL é escrito durante a criação do EntityManagerFactory, ao subir o contexto. */
    @Test
    void exportSchema() {
    }
}
