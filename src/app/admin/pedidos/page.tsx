import { PrismaClient, OrderStatus } from '@prisma/client'
import { PackageOpen, Clock, Truck, DollarSign } from 'lucide-react'
import OrderRowActions from '@/components/admin/OrderRowActions'
import MarkAsPaidButton from '@/components/admin/MarkAsPaidButton'
import AutoRefresh from '@/components/admin/AutoRefresh'

const prisma = new PrismaClient()

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
      <AutoRefresh intervalMs={5000} />
      <div>
        <h1 className="text-2xl font-serif text-[var(--color-brand-dark)]">Gestão de Pedidos</h1>
        <p className="text-gray-500 text-sm mt-1">Acompanhe e gerencie as vendas da Use Azevedo.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-gray-200 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total de Pedidos</h3>
            <PackageOpen className="text-[var(--color-brand-green-deep)] w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[var(--color-brand-dark)]">{totalOrders}</p>
        </div>
        
        <div className="bg-white p-6 border border-gray-200 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Em Confecção</h3>
            <Clock className="text-blue-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[var(--color-brand-dark)]">{inProduction}</p>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Para Despacho</h3>
            <Truck className="text-indigo-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[var(--color-brand-dark)]">{waitingDispatch}</p>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Faturamento (Pago)</h3>
            <DollarSign className="text-green-600 w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[var(--color-brand-dark)]">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600 tracking-wider">
              <tr>
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Itens</th>
                <th className="px-6 py-4">Logística</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const hasMadeToOrder = order.items.some(i => i.product.availability === 'MADE_TO_ORDER')
                const badge = STATUS_BADGES[order.status]
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors relative">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--color-brand-dark)]">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.customer.name}</p>
                      <a 
                        href={`https://wa.me/55${order.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline mt-1 block"
                      >
                        {order.customer.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-gray-600 truncate">{order.items.length} peça(s)</p>
                      {hasMadeToOrder && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 text-[10px] uppercase font-bold tracking-wider rounded-sm">
                          Sob Encomenda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm border ${
                        order.shippingType === 'MOTOBOY_RJ' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : order.shippingType === 'PICKUP'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {order.shippingType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">R$ {Number(order.total).toFixed(2).replace('.', ',')}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.payment?.method === 'PIX' ? 'PIX' : 'Cartão'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-[11px] uppercase font-bold tracking-wider rounded-sm ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end">
                      {order.status === 'PENDING' && (
                        <MarkAsPaidButton orderNumber={order.orderNumber} />
                      )}
                      <OrderRowActions 
                        orderId={order.id} 
                        currentStatus={order.status} 
                        shippingType={order.shippingType}
                        currentTracking={order.trackingCode}
                      />
                    </td>
                  </tr>
                )
              })}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pedido encontrado.
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
