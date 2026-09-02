package com.unimedvargina.UnimedVarginhaTi.shared.exception;

/**
 * Lançada quando a requisição é sintaticamente válida mas viola uma regra de
 * negócio (ex.: soma do rateio diferente do valor da fatura). Resulta em HTTP 409.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
