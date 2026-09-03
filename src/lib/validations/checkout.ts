import { z } from 'zod'

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/
const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}\-?\d{4}$|^\d{10,11}$/
const zipCodeRegex = /^\d{5}\-\d{3}$|^\d{8}$/

// Helper to validate CPF logically (optional deeper check, keeping it simple structurally for now)
function isValidCPF(cpf: string) {
  const cleanCpf = cpf.replace(/[^\d]+/g, '')
  if (cleanCpf.length !== 11 || !!cleanCpf.match(/(\d)\1{10}/)) return false
  
  let calc = (Array.from(cleanCpf).slice(0, 9).reduce((acc, digit, idx) => acc + parseInt(digit) * (10 - idx), 0) * 10) % 11
  if (calc === 10 || calc === 11) calc = 0
  if (calc !== parseInt(cleanCpf[9])) return false

  calc = (Array.from(cleanCpf).slice(0, 10).reduce((acc, digit, idx) => acc + parseInt(digit) * (11 - idx), 0) * 10) % 11
  if (calc === 10 || calc === 11) calc = 0
  if (calc !== parseInt(cleanCpf[10])) return false
  
  return true
}

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(3, 'Nome completo é obrigatório'),
    email: z.string().email('E-mail inválido'),
    phone: z.string()
      .min(10, 'Telefone incompleto')
      .regex(phoneRegex, 'Formato de telefone inválido'),
    cpf: z.string()
      .regex(cpfRegex, 'Formato de CPF inválido')
      .refine(isValidCPF, 'CPF inválido'),
  }),
  address: z.object({
    zipCode: z.string().regex(zipCodeRegex, 'CEP inválido'),
    street: z.string().min(2, 'Endereço obrigatório'),
    number: z.string().min(1, 'Número obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, 'Bairro obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    state: z.string().length(2, 'Estado (UF) deve ter 2 letras'),
  }),
  shipping: z.object({
    method: z.enum(['MOTOBOY_RJ', 'CORREIOS_PAC', 'CORREIOS_SEDEX', 'PICKUP'], {
      required_error: 'Selecione um método de entrega',
    }),
    price: z.number(),
    estimatedDays: z.number(),
    motoboyNotes: z.string().optional(),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar a Política de Trocas' })
  }),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
