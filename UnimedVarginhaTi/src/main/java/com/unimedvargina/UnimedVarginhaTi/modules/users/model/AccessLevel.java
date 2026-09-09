package com.unimedvargina.UnimedVarginhaTi.modules.users.model;

/**
 * Nivel de acesso a um modulo, em ordem crescente.
 *
 * <p>{@code READ} cobre os GET; {@code OPERATE} cobre criar, editar, excluir e
 * movimentar. Quem opera tambem le — dai a comparacao por posto em
 * {@link #allows(AccessLevel)}, em vez de igualdade exata.
 */
public enum AccessLevel {
    NONE(0),
    READ(1),
    OPERATE(2);

    private final int rank;

    AccessLevel(int rank) {
        this.rank = rank;
    }

    /** Verdadeiro quando este nivel satisfaz o exigido. */
    public boolean allows(AccessLevel required) {
        return this.rank >= required.rank;
    }
}
