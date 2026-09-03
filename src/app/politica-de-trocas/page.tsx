import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'

export default function PoliticaTrocasPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Topbar />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        <h1 className="text-3xl font-serif text-[var(--color-brand-dark)] mb-8 border-b border-gray-100 pb-4">Política de Trocas e Devoluções</h1>
        
        <div className="prose prose-sm sm:prose text-gray-600 max-w-none space-y-8">
          <p>
            A <strong>Use Azevedo</strong> deseja que você tenha uma experiência de compra incrível. Sabemos que comprar online pode gerar dúvidas sobre tamanhos e caimento, principalmente quando se trata de valorizar curvas e corpos reais. Por isso, nossa política foi desenhada para ser transparente e totalmente alinhada ao Código de Defesa do Consumidor (CDC).
          </p>

          <section>
            <h2 className="text-xl font-bold text-[var(--color-brand-dark)] mb-3">1. Direito de Arrependimento (Devolução)</h2>
            <p>
              Conforme o Art. 49 do CDC, você tem o direito de se arrepender da compra em até <strong>7 (sete) dias corridos</strong> após o recebimento do produto. Para solicitar a devolução:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>O produto não pode apresentar sinais de uso, lavagem ou odores.</li>
              <li>A etiqueta original deve estar fixada à peça intacta.</li>
              <li>O estorno será realizado integralmente (incluindo o frete inicial) no mesmo método de pagamento utilizado na compra, após a peça retornar ao nosso ateliê e passar por inspeção.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--color-brand-dark)] mb-3">2. Troca de Numeração ou Modelo</h2>
            <p>
              Se a peça não serviu perfeitamente ou você prefere outra cor, oferecemos a primeira troca gratuita em até <strong>7 (sete) dias úteis</strong> após o recebimento.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Entre em contato via WhatsApp informando o número do pedido.</li>
              <li>Caso a numeração desejada seja de uma peça <strong>Sob Encomenda</strong>, um novo prazo de confecção (detalhado na página do produto) será iniciado assim que recebermos a peça de volta.</li>
              <li>Peças feitas sob medida (alterações específicas de comprimento solicitadas pela cliente fora da grade padrão) não são passíveis de troca, exceto por defeito de fabricação.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--color-brand-dark)] mb-3">3. Peças de Bazar e Liquidação</h2>
            <p>
              Itens adquiridos em categorias de liquidação final ("Bazar", "Sale") não realizamos trocas por numeração ou devoluções por arrependimento. A única exceção é em caso de defeito de fabricação não informado previamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--color-brand-dark)] mb-3">4. Como solicitar?</h2>
            <p>
              É simples! Envie uma mensagem para a Amanda no WhatsApp oficial da marca clicando no botão no canto da tela, contendo:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>O número do seu pedido (Ex: UA-123456)</li>
              <li>O motivo da troca ou devolução</li>
              <li>Fotos do produto (caso haja defeito)</li>
            </ul>
          </section>
          
          <p className="font-medium text-gray-800 pt-4 border-t border-gray-100">
            Agradecemos por escolher a Use Azevedo. Trabalhamos diariamente para entregar conforto, beleza e empoderamento para você!
          </p>
        </div>
      </main>
    </div>
  )
}
