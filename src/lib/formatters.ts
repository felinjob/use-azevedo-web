/**
 * Formatação centralizada de valores monetários e datas para o padrão brasileiro.
 * Toda formatação de moeda/data do projeto deve utilizar estas funções
 * em vez de `.toFixed(2).replace('.', ',')` inline.
 */

/**
 * Formata um valor numérico para o padrão de moeda brasileira (BRL).
 * @param value - Valor numérico a ser formatado.
 * @returns String formatada como "R$ 199,90".
 *
 * @example
 * formatCurrency(199.9) // "R$ 199,90"
 * formatCurrency(0)     // "R$ 0,00"
 */
export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

/**
 * Formata apenas o valor numérico sem o prefixo "R$".
 * Útil para composições de string onde o prefixo já está presente no JSX.
 * @param value - Valor numérico a ser formatado.
 * @returns String formatada como "199,90".
 */
export function formatCurrencyValue(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

/**
 * Formata uma data para o padrão brasileiro (dd/mm/aaaa).
 * @param date - Data a ser formatada (Date, string ISO ou timestamp).
 * @returns String no formato "01/10/2026".
 */
export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

/**
 * Remove caracteres não-numéricos de uma string.
 * Útil para sanitizar CPF, telefone e CEP antes de salvar no banco.
 * @param value - String a ser limpa.
 * @returns Apenas os dígitos.
 */
export function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Formata telefone brasileiro para padrão internacional (+55...).
 * @param phone - Telefone limpo (apenas dígitos).
 * @returns String no formato "+5521999999999".
 */
export function formatPhoneInternational(phone: string): string {
  const clean = sanitizeDigits(phone)
  return clean.startsWith('55') ? `+${clean}` : `+55${clean}`
}
