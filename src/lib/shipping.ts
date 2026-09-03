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

export function calculateShippingOptions(
  cep: string,
  uf: string,
  hasMadeToOrder: boolean,
  maxProductionDays: number
): ShippingOption[] {
  const isRJ = uf.toUpperCase() === 'RJ'
  const options: ShippingOption[] = []

  const productionText = hasMadeToOrder 
    ? ` (inclui ${maxProductionDays} dias de confecção)` 
    : ''

  if (isRJ) {
    options.push({
      id: 'MOTOBOY_RJ',
      name: 'Motoboy',
      price: 22.00,
      estimatedDays: 2 + maxProductionDays,
      description: `1 a 2 dias úteis${productionText}`,
    })
  }

  options.push({
    id: 'CORREIOS_SEDEX',
    name: 'SEDEX',
    price: isRJ ? 24.90 : 42.50,
    estimatedDays: 3 + maxProductionDays,
    description: `2 a 3 dias úteis${productionText}`,
  })

  options.push({
    id: 'CORREIOS_PAC',
    name: 'PAC',
    price: isRJ ? 18.90 : 26.90,
    estimatedDays: 8 + maxProductionDays,
    description: `6 a 8 dias úteis${productionText}`,
  })

  options.push({
    id: 'PICKUP',
    name: 'Retirada no Local',
    price: 0,
    estimatedDays: maxProductionDays, // Instant after production
    description: `Rio de Janeiro - RJ (Agendamento via WhatsApp)${productionText}`,
  })

  return options
}
