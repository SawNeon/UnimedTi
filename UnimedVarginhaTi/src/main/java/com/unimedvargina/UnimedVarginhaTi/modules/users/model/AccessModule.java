package com.unimedvargina.UnimedVarginhaTi.modules.users.model;

/**
 * Modulos do sistema para efeito de permissao.
 *
 * <p>Cada valor corresponde a um conjunto de endpoints protegido por
 * {@code @PreAuthorize}. Ao criar um modulo novo, adicione o valor aqui E anote os
 * controllers: um modulo sem anotacao fica aberto a qualquer usuario autenticado.
 */
public enum AccessModule {
    STOCK,
    ASSET,
    ORDER,
    FINANCIAL,
    PRINTER,
    USER_MANAGEMENT
}
