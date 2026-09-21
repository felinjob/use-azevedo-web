'use client'

import { useEffect, useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, CheckoutFormData } from '@/lib/validations/checkout'
import { fetchAddressByCep, calculateShippingOptions, ShippingOption } from '@/lib/shipping'
import { useCartStore } from '@/lib/store/cart'
import Image from 'next/image'
import Link from 'next/link'
import { AlertCircle, ShoppingBag, Truck, MapPin, User, ChevronLeft } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import PaymentSection from '@/components/checkout/PaymentSection'
import PaymentRedirectOverlay from '@/components/checkout/PaymentRedirectOverlay'
import { createOrder } from '@/app/actions/create-order'
import { validateCoupon } from '@/app/actions/validate-coupon'
import { useRouter } from 'next/navigation'

// --- Simple Mask Helpers ---
const applyCpfMask = (v: string) => {
  v = v.replace(/\D/g, "")
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }
  return v
}

const applyPhoneMask = (v: string) => {
  v = v.replace(/\D/g, "")
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2")
    v = v.replace(/(\d)(\d{4})$/, "$1-$2")
  }
  return v
}

const applyCepMask = (v: string) => {
  v = v.replace(/\D/g, "")
  if (v.length <= 8) {
    v = v.replace(/^(\d{5})(\d)/, "$1-$2")
  }
  return v
}

export default function CheckoutPage() {
  const { items, getSubtotal, hasMadeToOrderItems } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  
  // States for Coupon
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, amount: number} | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  const router = useRouter()
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping: { price: 0, estimatedDays: 0 }
    }
  })

  const zipCode = watch('address.zipCode')
  const selectedShippingMethod = watch('shipping.method')
  const termsAccepted = watch('termsAccepted')

  const subtotal = getSubtotal()
  const hasMadeToOrder = hasMadeToOrderItems()
  const maxProductionDays = useMemo(() => {
    return items.reduce((max, item) => Math.max(max, item.productionTimeDays || 0), 0)
  }, [items])

  const state = watch('address.state')
  const validZip = zipCode && zipCode.replace(/\D/g, '').length === 8

  const shippingOptions = useMemo(() => {
    if (validZip && state) {
      return calculateShippingOptions(zipCode, state, hasMadeToOrder, maxProductionDays, subtotal, 'PIX') // Pass default as it no longer depends on local paymentMethod selection
    }
    return []
  }, [validZip, zipCode, state, hasMadeToOrder, maxProductionDays, subtotal])

  const selectedShipping = shippingOptions.find(opt => opt.id === selectedShippingMethod)
  const discountAmount = appliedCoupon?.amount || 0
  const total = Math.max(0, subtotal + (selectedShipping?.price || 0) - discountAmount)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync shipping price if the selected option changes price (e.g. PIX vs Cartão)
  useEffect(() => {
    if (selectedShippingMethod && selectedShipping) {
      setValue('shipping.price', selectedShipping.price)
    }
  }, [selectedShippingMethod, selectedShipping, setValue])

  // ViaCEP integration
  useEffect(() => {
    if (zipCode && zipCode.replace(/\D/g, '').length === 8) {
      const fetchCep = async () => {
        const address = await fetchAddressByCep(zipCode)
        if (address) {
          setValue('address.street', address.logradouro, { shouldValidate: true })
          setValue('address.neighborhood', address.bairro, { shouldValidate: true })
          setValue('address.city', address.localidade, { shouldValidate: true })
          setValue('address.state', address.uf, { shouldValidate: true })
        }
      }
      fetchCep()
    }
  }, [zipCode, setValue])

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setIsValidatingCoupon(true)
    setCouponError('')
    
    const res = await validateCoupon(couponInput, subtotal)
    if (res.valid) {
      setAppliedCoupon({ code: res.code!, amount: res.discountAmount! })
      setCouponInput('')
    } else {
      setCouponError(res.error!)
    }
    setIsValidatingCoupon(false)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setCheckoutError(null)
    try {
      const res = await createOrder({
        formData: data,
        cartItems: items,
        couponCode: appliedCoupon?.code
      })

      if (res.success && res.redirectUrl) {
        setIsRedirecting(true)
        setTimeout(() => {
          window.location.href = res.redirectUrl!
        }, 2800)
      } else if (res.success && res.orderNumber) {
        // Fallback case redirect URL was not returned
        setIsRedirecting(true)
        setTimeout(() => {
          router.push(`/pedido/${res.orderNumber}`)
        }, 2800)
      } else {
        setCheckoutError(res.error || 'Erro ao processar pedido. Tente novamente.')
      }
    } catch (err) {
      console.error(err)
      setCheckoutError('Erro inesperado ao processar o pedido. Tente novamente.')
    }
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-offwhite)] flex flex-col">
        <Topbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-2">Sua sacola está vazia</h2>
          <p className="text-gray-500 mb-8 text-center">Que tal escolher algumas peças exclusivas?</p>
          <Link href="/" className="bg-[var(--color-brand-green-deep)] text-white px-8 py-3 font-semibold uppercase tracking-wider hover:bg-[var(--color-brand-dark)] transition-colors">
            Explorar Coleção
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-brand-offwhite)] relative">
      {/* Overlay de Segurança de Alta Fidelidade */}
      <PaymentRedirectOverlay isVisible={isRedirecting} />

      <Topbar />
      
      {/* Header Simples de Checkout */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-[var(--color-brand-dark)] tracking-wide">
            USE AZEVEDO <span className="text-sm font-sans text-gray-400 font-normal uppercase tracking-widest ml-2">Checkout</span>
          </h1>
          <Link href="/" className="text-xs md:text-sm text-[var(--color-brand-dark)] hover:text-black hover:underline flex items-center gap-1 font-medium">
            <ChevronLeft className="w-4 h-4" />
            Voltar para a loja
          </Link>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Formulários (Esquerda) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Bloco 1: Dados Pessoais */}
            <section className="bg-white p-6 md:p-8 border border-[var(--color-brand-muted)]/15 rounded-md shadow-xs">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-6 flex items-center uppercase tracking-widest">
                <User className="w-5 h-5 mr-3 text-[var(--color-brand-green-deep)]" />
                Dados Pessoais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input {...register('customer.name')} className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors" placeholder="Digite seu nome completo" />
                  {errors.customer?.name && <p className="text-red-500 text-xs mt-1">{errors.customer.name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input type="email" {...register('customer.email')} className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors" placeholder="seu@email.com" />
                  {errors.customer?.email && <p className="text-red-500 text-xs mt-1">{errors.customer.email.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <Controller
                    control={control}
                    name="customer.cpf"
                    render={({ field: { onChange, value } }) => (
                      <input 
                        value={value || ''}
                        onChange={(e) => onChange(applyCpfMask(e.target.value))}
                        className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors" 
                        placeholder="000.000.000-00" 
                        maxLength={14}
                      />
                    )}
                  />
                  {errors.customer?.cpf && <p className="text-red-500 text-xs mt-1">{errors.customer.cpf.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Celular *</label>
                  <Controller
                    control={control}
                    name="customer.phone"
                    render={({ field: { onChange, value } }) => (
                      <input 
                        value={value || ''}
                        onChange={(e) => onChange(applyPhoneMask(e.target.value))}
                        className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors" 
                        placeholder="(00) 00000-0000" 
                        maxLength={15}
                      />
                    )}
                  />
                  {errors.customer?.phone && <p className="text-red-500 text-xs mt-1">{errors.customer.phone.message}</p>}
                </div>
              </div>
            </section>

            {/* Bloco 2: Endereço de Entrega */}
            <section className="bg-white p-6 md:p-8 border border-gray-200">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-6 flex items-center uppercase tracking-widest">
                <MapPin className="w-5 h-5 mr-3 text-[var(--color-brand-gold)]" />
                Entrega e Endereço
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                  <Controller
                    control={control}
                    name="address.zipCode"
                    render={({ field: { onChange, value } }) => (
                      <input 
                        value={value || ''}
                        onChange={(e) => onChange(applyCepMask(e.target.value))}
                        className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors" 
                        placeholder="00000-000" 
                        maxLength={9}
                      />
                    )}
                  />
                  {errors.address?.zipCode && <p className="text-red-500 text-xs mt-1">{errors.address.zipCode.message}</p>}
                </div>
                
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro *</label>
                  <input {...register('address.street')} className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors bg-gray-50" readOnly />
                  {errors.address?.street && <p className="text-red-500 text-xs mt-1">{errors.address.street.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                  <input {...register('address.number')} className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors" />
                  {errors.address?.number && <p className="text-red-500 text-xs mt-1">{errors.address.number.message}</p>}
                </div>
                
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input {...register('address.complement')} className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors" placeholder="Apto, Bloco, Casa..." />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                  <input {...register('address.neighborhood')} className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors bg-gray-50" readOnly />
                  {errors.address?.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.address.neighborhood.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input {...register('address.city')} className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors bg-gray-50" readOnly />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
                  <input {...register('address.state')} className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors bg-gray-50 text-center" readOnly />
                </div>
              </div>
            </section>

            {/* Bloco 3: Opções de Frete */}
            <section className="bg-white p-6 md:p-8 border border-gray-200">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-6 flex items-center uppercase tracking-widest">
                <Truck className="w-5 h-5 mr-3 text-[var(--color-brand-gold)]" />
                Opções de Frete
              </h2>
              
              {shippingOptions.length === 0 ? (
                <div className="text-gray-500 italic text-sm p-4 bg-gray-50 border border-dashed border-gray-300 text-center">
                  Digite um CEP válido acima para calcular as opções de entrega.
                </div>
              ) : (
                <div className="space-y-4">
                  {hasMadeToOrder && (
                    <div className="flex items-start gap-2 text-amber-800 bg-amber-50 p-4 rounded-sm border border-amber-200 mb-6">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <strong className="font-semibold">Atenção:</strong> Seu pedido contém peças sob encomenda. O prazo de confecção será considerado no envio.
                      </p>
                    </div>
                  )}

                  {shippingOptions.map(option => (
                    <label key={option.id} className={`flex items-center p-4 border cursor-pointer transition-colors ${selectedShippingMethod === option.id ? 'border-[var(--color-brand-green-deep)] bg-green-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        value={option.id}
                        className="w-4 h-4 text-[var(--color-brand-green-deep)] border-gray-300 focus:ring-[var(--color-brand-green-deep)]"
                        {...register('shipping.method', {
                          onChange: () => {
                            setValue('shipping.price', option.price)
                            setValue('shipping.estimatedDays', option.estimatedDays)
                          }
                        })}
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[var(--color-brand-dark)]">{option.name}</span>
                          <span className="font-bold text-[var(--color-brand-dark)]">
                            {option.id === 'MOTOBOY_RJ' 
                              ? 'A combinar com a Amanda' 
                              : option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2).replace('.', ',')}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      </div>
                    </label>
                  ))}
                  {errors.shipping?.method && <p className="text-red-500 text-xs mt-1">{errors.shipping.method.message}</p>}

                  {selectedShippingMethod === 'MOTOBOY_RJ' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações para o Motoboy (Opcional)</label>
                      <textarea 
                        {...register('shipping.motoboyNotes')} 
                        className="w-full border border-gray-300 p-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors text-sm min-h-[80px]" 
                        placeholder="Deixar na portaria, campainha quebrada..." 
                      />
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Resumo (Direita - Sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white p-6 md:p-8 border border-gray-200 sticky top-8">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">
                Resumo do Pedido
              </h2>

              {/* Itens do Carrinho */}
              <div className="max-h-[300px] overflow-y-auto mb-6 pr-2 space-y-4 scrollbar-thin">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-20 bg-gray-100 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-semibold text-[var(--color-brand-dark)] line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Tamanho: {item.size} | Cor: {item.color}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-sm">Qtd: {item.quantity}</span>
                        <span className="text-sm font-bold text-[var(--color-brand-dark)]">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Linhas Financeiras */}
              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                {/* Seção de Cupom */}
                <div className="bg-gray-50 p-4 border border-gray-200 mb-4 rounded-sm">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cupom de Desconto</h3>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 text-[var(--color-brand-green-deep)] px-3 py-2 border border-green-200 rounded-sm">
                      <span className="text-sm font-bold font-mono tracking-wide">{appliedCoupon.code}</span>
                      <button 
                        type="button" 
                        onClick={handleRemoveCoupon}
                        className="text-xs font-semibold hover:text-green-800 underline uppercase"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Insira seu código"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[var(--color-brand-green-deep)] uppercase"
                      />
                      <button 
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        className="bg-gray-800 hover:bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors rounded-sm"
                      >
                        {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frete {selectedShipping?.name ? `(${selectedShipping.name})` : ''}</span>
                  <span>
                    {!selectedShippingMethod 
                      ? '--' 
                      : selectedShipping?.id === 'MOTOBOY_RJ' 
                        ? 'A combinar com a Amanda'
                        : selectedShipping?.price === 0 ? 'Grátis' : `R$ ${selectedShipping?.price.toFixed(2).replace('.', ',')}`
                    }
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm font-semibold text-[var(--color-brand-green-deep)]">
                    <span>Desconto ({appliedCoupon.code})</span>
                    <span>- R$ {appliedCoupon.amount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-[var(--color-brand-dark)] pt-3 border-t border-gray-100">
                  <span>Total Geral</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Checkbox de Termos */}
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...register('termsAccepted')}
                    className="mt-1 w-4 h-4 text-[var(--color-brand-green-deep)] border-gray-300 focus:ring-[var(--color-brand-green-deep)]"
                  />
                  <span className="text-xs text-gray-600 leading-tight">
                    Declaro que li e concordo com a Política de Trocas (prazo de 7 dias úteis após recebimento; trocas não aplicáveis a itens de bazar/promoção).
                  </span>
                </label>
                {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted.message}</p>}
              </div>

              {/* Pagamento em vez de Botão Submeter */}
              <PaymentSection 
                total={total}
                isSubmitting={isSubmitting || isRedirecting}
                termsAccepted={termsAccepted}
                termsError={errors.termsAccepted?.message}
                checkoutError={checkoutError}
                onSubmit={handleSubmit(onSubmit)}
              />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
