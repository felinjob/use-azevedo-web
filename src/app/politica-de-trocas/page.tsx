import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

export default function PoliticaTrocasPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-brand-canvas)] font-sans">
      <Topbar />
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-green-deep)] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a Loja
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-md border border-[var(--color-brand-muted)]/15 shadow-xs">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-brand-muted)]/15">
            <ShieldCheck className="w-8 h-8 text-[var(--color-brand-green-deep)]" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[var(--color-brand-dark)] font-medium">
                Política de Trocas e Devoluções
              </h1>
              <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">Em conformidade com o Código de Defesa do Consumidor (Art. 49 CDC)</p>
            </div>
          </div>
          
          <div className="prose prose-sm sm:prose text-[var(--color-brand-muted)] max-w-none space-y-8 leading-relaxed">
            <p className="text-sm sm:text-base text-[var(--color-brand-dark)]">
              A <strong>Use Azevedo</strong> deseja que você tenha uma experiência de compra impecável. Sabemos que comprar moda online pode gerar dúvidas sobre caimento e medidas, principalmente quando se trata de valorizar curvas e corpos reais. Por isso, nossa política é transparente, acolhedora e alinhada ao CDC.
            </p>

            <section className="bg-[var(--color-brand-canvas)] p-5 rounded-sm border border-[var(--color-brand-muted)]/15">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[var(--color-brand-dark)] mb-2">
                1. Direito de Arrependimento (Devolução)
              </h2>
              <p className="text-xs sm:text-sm">
                Conforme o Art. 49 do CDC, você tem o direito de desistir da compra em até <strong>7 (sete) dias corridos</strong> após o recebimento do produto no seu endereço:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3 text-xs sm:text-sm">
                <li>O produto não pode apresentar sinais de uso, lavagem ou alterações.</li>
                <li>A etiqueta original deve estar fixada à peça intacta.</li>
                <li>O estorno é realizado integralmente (incluindo o valor do frete original) após a chegada e conferência da peça em nosso ateliê.</li>
              </ul>
            </section>

            <section className="bg-[var(--color-brand-canvas)] p-5 rounded-sm border border-[var(--color-brand-muted)]/15">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[var(--color-brand-dark)] mb-2">
                2. Troca de Numeração ou Modelo
              </h2>
              <p className="text-xs sm:text-sm">
                Se a peça não serviu com o caimento desejado ou você prefere outra cor, disponibilizamos a primeira troca em até <strong>7 (sete) dias úteis</strong> após o recebimento:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3 text-xs sm:text-sm">
                <li>Entre em contato com nossa equipe via WhatsApp informando o número do pedido.</li>
                <li>Para peças <strong>Sob Encomenda</strong>, um novo prazo de confecção será iniciado após o recebimento da peça original.</li>
                <li>Peças personalizadas sob medida (ajustes específicos de comprimento fora da grade) não são passíveis de troca, exceto vício de fabricação.</li>
              </ul>
            </section>

            <section className="bg-[var(--color-brand-canvas)] p-5 rounded-sm border border-[var(--color-brand-muted)]/15">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[var(--color-brand-dark)] mb-2">
                3. Como Solicitar?
              </h2>
              <p className="text-xs sm:text-sm">
                É simples e ágil. Envie uma mensagem direta para a Amanda no WhatsApp oficial:
              </p>
              <div className="mt-3 p-3 bg-white rounded-xs border border-[var(--color-brand-muted)]/20 text-xs text-[var(--color-brand-dark)]">
                <p>• Número do seu pedido (ex: UA-123456)</p>
                <p>• Motivo da solicitação (Troca de tamanho ou Devolução)</p>
                <p>• Foto do produto (caso reporte algum defeito de confecção)</p>
              </div>
            </section>
            
            <div className="pt-6 border-t border-[var(--color-brand-muted)]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[var(--color-brand-muted)]">
                Horário de atendimento: Segunda a Sexta, das 9h às 18h.
              </p>
              <a
                href="https://wa.me/5521978594358?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20troca%20ou%20devolu%C3%A7%C3%A3o"
                target="_blank"
                rel="noreferrer"
                className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
