import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { MessageCircle, Package, RefreshCcw, Truck, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Dúvidas Frequentes | Use Azevedo',
  description: 'Tire suas dúvidas sobre prazos, trocas, pagamentos e mais.'
}

export default function DuvidasPage() {
  return (
    <div className="min-h-screen bg-[var(--color-brand-offwhite)] flex flex-col">
      <Topbar />
      <Header />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-brand-dark)] mb-4">Central de Dúvidas</h1>
            <p className="text-[var(--color-brand-muted)] max-w-2xl mx-auto">
              Como podemos te ajudar? Encontre abaixo as respostas para as dúvidas mais comuns das nossas clientes.
            </p>
          </div>

          <div className="space-y-12">
            {/* Categoria 1 */}
            <section>
              <h2 className="text-xl font-bold text-[var(--color-brand-dark)] flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
                <Package className="w-6 h-6 text-[var(--color-brand-gold)]" />
                Prazos e Entregas
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
                  <h3 className="font-bold text-[var(--color-brand-dark)] mb-2">Qual o prazo de envio?</h3>
                  <p className="text-sm text-gray-600">Peças a Pronta Entrega são despachadas em até 1 dia útil. Peças Sob Encomenda possuem um prazo de confecção (informado na página do produto) que deve ser somado ao prazo do frete escolhido.</p>
                </div>
                <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
                  <h3 className="font-bold text-[var(--color-brand-dark)] mb-2">A entrega via Motoboy atende minha região?</h3>
                  <p className="text-sm text-gray-600">O frete via Motoboy está disponível exclusivamente para a capital do Rio de Janeiro. Ao digitar seu CEP no checkout, a opção aparecerá automaticamente se for elegível.</p>
                </div>
              </div>
            </section>

            {/* Categoria 2 */}
            <section>
              <h2 className="text-xl font-bold text-[var(--color-brand-dark)] flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
                <RefreshCcw className="w-6 h-6 text-[var(--color-brand-gold)]" />
                Trocas e Devoluções
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
                  <h3 className="font-bold text-[var(--color-brand-dark)] mb-2">A primeira troca é grátis?</h3>
                  <p className="text-sm text-gray-600">Sim! A Use Azevedo arca com o frete da sua primeira troca. Você tem até 7 dias úteis após o recebimento para solicitar a troca pelo nosso WhatsApp.</p>
                </div>
                <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
                  <h3 className="font-bold text-[var(--color-brand-dark)] mb-2">Posso trocar itens em promoção?</h3>
                  <p className="text-sm text-gray-600">Peças adquiridas em seções de Bazar, Sale ou com cupons promocionais específicos não são elegíveis para a política de troca grátis.</p>
                </div>
              </div>
            </section>

            {/* Categoria 3 */}
            <section>
              <h2 className="text-xl font-bold text-[var(--color-brand-dark)] flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
                <ShieldCheck className="w-6 h-6 text-[var(--color-brand-gold)]" />
                Pagamentos
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
                  <h3 className="font-bold text-[var(--color-brand-dark)] mb-2">Quais as formas de pagamento?</h3>
                  <p className="text-sm text-gray-600">Aceitamos pagamentos via PIX (com aprovação imediata) e Cartão de Crédito, parcelando em até 12x sem juros.</p>
                </div>
                <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
                  <h3 className="font-bold text-[var(--color-brand-dark)] mb-2">Como funciona o Frete Grátis?</h3>
                  <p className="text-sm text-gray-600">Ganhe frete grátis nas opções PAC e Motoboy RJ em compras acima de R$ 199 pagando no PIX, ou acima de R$ 299 no Cartão de Crédito.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-16 bg-[var(--color-brand-green-deep)] text-white p-8 md:p-12 text-center flex flex-col items-center">
            <h2 className="text-2xl font-serif mb-4">Ainda tem alguma dúvida?</h2>
            <p className="text-green-50 mb-8 max-w-lg">Nosso time está sempre disponível para te ajudar com tamanhos, tecidos ou acompanhamento de pedidos.</p>
            <a 
              href="https://wa.me/5521978594358?text=Olá, estava na página de dúvidas e gostaria de ajuda!" 
              target="_blank" 
              rel="noreferrer"
              className="bg-white text-[var(--color-brand-green-deep)] font-bold py-4 px-8 uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com a Amanda no WhatsApp
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
