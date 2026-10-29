import { OrderStatus } from '@prisma/client'
import prisma from '@/lib/prisma'
import { PackageOpen, Clock, Truck, DollarSign } from 'lucide-react'
import OrderRowActions, { SerializedOrderDetails } from '@/components/admin/OrderRowActions'
import MarkAsPaidButton from '@/components/admin/MarkAsPaidButton'
import AutoRefresh from '@/components/admin/AutoRefresh'
import { formatCurrency, formatDate } from '@/lib/formatters'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Disable cache for admin panel

const STATUS_BADGES: Record<OrderStatus, { label: string, color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  IN_PRODUCTION: { label: 'Em Confecção', color: 'bg-blue-100 text-blue-800' },
  READY_FOR_PICKUP: { label: 'Pronto p/ Retirada', color: 'bg-purple-100 text-purple-800' },
  DISPATCHED: { label: 'Despachado', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Entregue', color: 'bg-teal-100 text-teal-800' },
  CANCELED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      shippingAddress: true,
      items: {
        include: {
          product: true
        }
      },
      payment: true
    }
  })

  // Operacional Stats
  const totalOrders = orders.length
  const inProduction = orders.filter(o => o.status === 'IN_PRODUCTION' || o.items.some(i => i.product.availability === 'MADE_TO_ORDER' && o.status === 'PAID')).length
  const waitingDispatch = orders.filter(o => o.status === 'PAID' && o.items.every(i => i.product.availability === 'READY_TO_SHIP')).length
  const totalRevenue = orders.filter(o => o.status !== 'PENDING' && o.status !== 'CANCELED').reduce((acc, curr) => acc + Number(curr.total), 0)

  return (
    <div className="space-y-6">
      <AutoRefresh intervalMs={30000} />
      <div>
        <h1 className="text-2xl font-serif text-[var(--color-brand-dark)]">Gestão de Pedidos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Acompanhe as peças vendidas, endereços de envio e status de produção.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-gray-200 rounded-md shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total de Pedidos</h3>
            <PackageOpen className="text-[var(--color-brand-green-deep)] w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[var(--color-brand-dark)]">{totalOrders}</p>
        </div>
        
        <div className="bg-white p-5 border border-gray-200 rounded-md shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Em Confecção</h3>
            <Clock className="text-blue-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[var(--color-brand-dark)]">{inProduction}</p>
        </div>

        <div className="bg-white p-5 border border-gray-200 rounded-md shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pronto p/ Despacho</h3>
            <Truck className="text-indigo-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[var(--color-brand-dark)]">{waitingDispatch}</p>
        </div>

        <div className="bg-white p-5 border border-gray-200 rounded-md shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Faturamento Aprovado</h3>
            <DollarSign className="text-green-600 w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[var(--color-brand-dark)]">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600 tracking-wider">
              <tr>
                <th className="px-5 py-4">Pedido</th>
                <th className="px-5 py-4">Cliente & Cidade</th>
                <th className="px-5 py-4">Peças Compradas</th>
                <th className="px-5 py-4">Logística</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const hasMadeToOrder = order.items.some(i => i.product.availability === 'MADE_TO_ORDER')
                const badge = STATUS_BADGES[order.status]

                const serializedOrder: SerializedOrderDetails = {
                  id: order.id,
                  orderNumber: order.orderNumber,
                  status: order.status,
                  shippingType: order.shippingType,
                  trackingCode: order.trackingCode,
                  motoboyNotes: order.motoboyNotes,
                  subtotal: Number(order.subtotal),
                  shippingCost: Number(order.shippingCost),
                  discount: Number(order.discount),
                  total: Number(order.total),
                  customer: {
                    name: order.customer.name,
                    email: order.customer.email,
                    phone: order.customer.phone,
                    cpf: order.customer.cpf,
                  },
                  address: order.shippingAddress ? {
                    street: order.shippingAddress.street,
                    number: order.shippingAddress.number,
                    complement: order.shippingAddress.complement,
                    neighborhood: order.shippingAddress.neighborhood,
                    city: order.shippingAddress.city,
                    state: order.shippingAddress.state,
                    zipCode: order.shippingAddress.zipCode,
                  } : null,
                  items: order.items.map(i => ({
                    id: i.id,
                    productName: i.productName,
                    variantSize: i.variantSize,
                    variantColor: i.variantColor,
                    quantity: i.quantity,
                    unitPrice: Number(i.unitPrice),
                    totalPrice: Number(i.totalPrice),
                    isMadeToOrder: i.product.availability === 'MADE_TO_ORDER'
                  }))
                }
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-bold text-[var(--color-brand-dark)] font-mono">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{order.customer.name}</p>
                      {order.shippingAddress && (
                        <p className="text-xs text-gray-500">
                          {order.shippingAddress.neighborhood}, {order.shippingAddress.city}/{order.shippingAddress.state}
                        </p>
                      )}
                      <a 
                        href={`https://wa.me/55${order.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-700 font-medium hover:underline mt-0.5 inline-block"
                      >
                        WhatsApp: {order.customer.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <p key={item.id} className="text-xs text-gray-800 leading-snug">
                            <span className="font-bold">{item.quantity}x</span> {item.productName}{' '}
                            <span className="text-gray-500 font-medium">
                              (Tam {item.variantSize} • {item.variantColor})
                            </span>
                          </p>
                        ))}
                      </div>
                      {hasMadeToOrder && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase font-bold tracking-wider rounded-xs">
                          Contém Sob Encomenda
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm border ${
                        order.shippingType === 'MOTOBOY_RJ' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : order.shippingType === 'PICKUP'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {order.shippingType === 'MOTOBOY_RJ' ? 'Motoboy RJ' : order.shippingType === 'PICKUP' ? 'Retirada' : 'Correios'}
                      </span>
                      {order.trackingCode && (
                        <p className="text-[11px] font-mono text-gray-500 mt-1">{order.trackingCode}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-900">{formatCurrency(Number(order.total))}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.payment?.method === 'PIX' ? 'PIX' : 'Cartão'}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'PENDING' && (
                          <MarkAsPaidButton orderNumber={order.orderNumber} />
                        )}
                        <OrderRowActions order={serializedOrder} />
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pedido registrado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

