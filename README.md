# Use Azevedo - Loja Virtual

Bem-vindo ao repositório do e-commerce da **Use Azevedo**, uma marca focada em estilo, qualidade e elegância (Quiet Luxury). 

Este projeto foi desenvolvido com as mais modernas tecnologias web para oferecer uma experiência de compra ágil, segura e lindamente orquestrada para todos os tamanhos de tela.

## Tecnologias Principais

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Framer Motion (para micro-interações)
- **Banco de Dados:** PostgreSQL (gerenciado via [Prisma ORM v6](https://www.prisma.io/))
- **Gateway de Pagamento:** Integração robusta via Webhooks com a [InfinitePay](https://infinitepay.io/)

## Destaques da Plataforma

- **Catálogo Dinâmico:** Gestão de grade complexa (Multi-cor x Tamanho x Estoque).
- **Provador Virtual:** Experiência dedicada de usabilidade com modais interativos para tabelas de medidas globais e específicas.
- **Cupons de Desconto:** Motor avançado para aplicação de cupons percentuais ou de valor fixo atrelados ao carrinho.
- **Real-Time Order Tracking:** Painel de rastreio para os clientes atualizado em tempo real na confirmação do pagamento.
- **Gestão Administrativa (Admin):** Módulos completos para criação de peças, gerenciamento de estoque, cadastro de banners/hero dinâmicos e controle de aprovação de pedidos com possibilidade de baixa manual.
- **Design System:** Paleta "Verde Floresta e Canvas/Marfim" e adoção de fontes premium.

## Como Executar Localmente

Certifique-se de que o Node.js e o PostgreSQL estão instalados em seu ambiente.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/felinjob/use-azevedo-web.git
   cd use-azevedo-web
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` (se disponível) para `.env` e ajuste suas credenciais (banco de dados, Stripe/InfinitePay, senhas de admin).

4. **Prepare o banco de dados:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

A aplicação estará acessível em [http://localhost:3000](http://localhost:3000).

## Licença

Projeto desenvolvido sob encomenda para uso exclusivo da marca Use Azevedo. Todos os direitos de design, logotipos e conteúdo são reservados.
