interface InfinitePayCustomer {
  firstName: string
  lastName: string
  documentNumber: string // CPF
  email: string
  phoneNumber: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zip: string
  }
}

interface PixPaymentParams {
  orderId: string
  amountInCents: number
  customer: InfinitePayCustomer
  expiresInMinutes?: number
}

interface CardPaymentParams extends PixPaymentParams {
  installments: number
  card: {
    number: string
    cardholderName: string
    expirationMonth: string
    expirationYear: string
    cvv: string
  }
}

export class InfinitePayClient {
  private clientId: string
  private clientSecret: string
  private baseUrl: string
  private token: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.clientId = process.env.INFINITEPAY_CLIENT_ID || ''
    this.clientSecret = process.env.INFINITEPAY_CLIENT_SECRET || ''
    const env = process.env.INFINITEPAY_ENV || 'sandbox'
    this.baseUrl = env === 'production' 
      ? 'https://api.infinitepay.io/v2' 
      : 'https://api.sandbox.infinitepay.io/v2'
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token
    }

    if (!this.clientId || !this.clientSecret) {
      console.warn('InfinitePay credentials not found. Operating in MOCK mode.')
      return 'mock_token'
    }

    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      })

      if (!response.ok) throw new Error('Falha ao autenticar na InfinitePay')
      
      const data = await response.json()
      if (!data.access_token) throw new Error('Token não retornado')
      this.token = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000 // Buffer de 1 minuto
      return this.token!
    } catch (error) {
      console.error('InfinitePay Auth Error:', error)
      throw new Error('Falha de comunicação com o gateway de pagamento.')
    }
  }

  async createPixPayment(params: PixPaymentParams) {
    if (this.clientId === 'your_infinitepay_client_id_here' || !this.clientId) {
      // Mock mode for local testing before keys are added
      return {
        id: `ip_pix_${Date.now()}`,
        status: 'pending',
        pixCopiaECola: `00020126580014br.gov.bcb.pix0136${params.customer.documentNumber}5204000053039865802BR5925Use Azevedo6009SAO PAULO62140510${params.orderId}6304`,
        qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        expiresAt: new Date(Date.now() + (params.expiresInMinutes || 20) * 60000).toISOString()
      }
    }

    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        metadata: { orderId: params.orderId },
        amount: params.amountInCents,
        payment_method: 'pix',
        customer: params.customer,
        pix_expiration_time: params.expiresInMinutes || 20
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('InfinitePay Pix Error:', errorData)
      throw new Error('Erro ao gerar PIX.')
    }

    return await response.json()
  }

  async createCardPayment(params: CardPaymentParams) {
    if (this.clientId === 'your_infinitepay_client_id_here' || !this.clientId) {
      // Mock mode for local testing before keys are added
      return {
        id: `ip_card_${Date.now()}`,
        status: 'approved',
        transactionId: `txn_${Date.now()}`
      }
    }

    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        metadata: { orderId: params.orderId },
        amount: params.amountInCents,
        payment_method: 'credit',
        installments: params.installments,
        customer: params.customer,
        card: {
          number: params.card.number,
          holder_name: params.card.cardholderName,
          expiration_month: params.card.expirationMonth,
          expiration_year: params.card.expirationYear,
          cvv: params.card.cvv
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('InfinitePay Card Error:', errorData)
      throw new Error('Transação recusada pela operadora de cartão.')
    }

    return await response.json()
  }
}

export const infinitepay = new InfinitePayClient()
