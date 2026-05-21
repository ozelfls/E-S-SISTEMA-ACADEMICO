package br.edu.ghflusao.service;

import br.edu.ghflusao.exception.BusinessException;

final class CpfFormatter {

    private CpfFormatter() {
    }

    static String format(String value) {
        String digits = value == null ? "" : value.replaceAll("\\D", "");
        if (digits.length() != 11) {
            throw new BusinessException("CPF deve conter exatamente 11 digitos.");
        }
        return digits.substring(0, 3) + "."
                + digits.substring(3, 6) + "."
                + digits.substring(6, 9) + "-"
                + digits.substring(9, 11);
    }
}
