export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  try {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return null

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data = await response.json()

    if (data.erro) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching CEP:', error)
    return null
  }
}

export interface ShippingOption {
  id: 'MOTOBOY_RJ' | 'CORREIOS_PAC' | 'CORREIOS_SEDEX' | 'PICKUP'
  name: string
  price: number
  estimatedDays: number
  description: string
}
/**
 * Calcula as opções de frete disponíveis com base no CEP, UF e valor do pedido.
 *
 * Regras de negócio:
 * - Motoboy: somente para RJ, preço = 0 ("a combinar" com a Amanda).
 * - PAC: frete grátis se PIX >= R$199 ou Cartão >= R$299.
 * - SEDEX: sempre cobrado, valores diferenciados RJ vs demais estados.
 * - Retirada: sempre disponível, sem custo.
 *
 * @param cep - CEP do destinatário (usado para futuras faixas de preço).
 * @param uf - Unidade Federativa do destinatário.
 * @param hasMadeToOrder - Se há itens sob encomenda no pedido.
 * @param maxProductionDays - Prazo máximo de produção entre os itens.
 * @param subtotal - Valor subtotal do pedido para cálculo de frete grátis.
 * @param paymentMethod - Método de pagamento selecionado.
 * @returns Array de opções de frete ordenadas por prioridade.
 */
export function calculateShippingOptions(
  cep: string,
  uf: string,
  hasMadeToOrder: boolean,
  maxProductionDays: number,
  subtotal: number = 0,
  paymentMethod: 'PIX' | 'CREDIT_CARD' = 'PIX'
): ShippingOption[] {
  const isRJ = uf.toUpperCase() === 'RJ'
  const options: ShippingOption[] = []

  const isFreeShipping = 
    (paymentMethod === 'PIX' && subtotal >= 199) || 
    (paymentMethod === 'CREDIT_CARD' && subtotal >= 299)

  if (isRJ) {
    options.push({
      id: 'MOTOBOY_RJ',
      name: 'Motoboy',
      price: 0, // Motoboy is always 0 in the system to not add to total, since it's "A combinar"
      estimatedDays: 2,
      description: `1 a 2 dias úteis`,
    })
  }

  options.push({
    id: 'CORREIOS_SEDEX',
    name: 'SEDEX',
    price: isRJ ? 24.90 : 42.50,
    estimatedDays: 3,
    description: `2 a 3 dias úteis`,
  })

  options.push({
    id: 'CORREIOS_PAC',
    name: 'PAC',
    price: isFreeShipping ? 0 : (isRJ ? 18.90 : 26.90),
    estimatedDays: 8,
    description: `6 a 8 dias úteis`,
  })

  options.push({
    id: 'PICKUP',
    name: 'Retirada no Local',
    price: 0,
    estimatedDays: 0,
    description: `Rio de Janeiro - RJ (Agendamento via WhatsApp)`,
  })

  return options
}
