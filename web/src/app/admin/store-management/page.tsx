'use client'

import { useMemo, useState } from 'react'
import { Download, FilePlus2, Store } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import {
  formatEgp,
  storeOrdersAdminData,
  storeProductsAdminData,
} from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const tabs = ['Products', 'Orders'] as const
const productStatusOptions = ['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const
const orderStatusOptions = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'] as const

type StoreTab = (typeof tabs)[number]

export default function AdminStoreManagementPage() {
  const [activeTab, setActiveTab] = useState<StoreTab>('Products')
  const [productSearch, setProductSearch] = useState('')
  const [productStatus, setProductStatus] = useState<(typeof productStatusOptions)[number]>('All')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState<(typeof orderStatusOptions)[number]>('All')

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()

    return storeProductsAdminData.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.title.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.facility.toLowerCase().includes(query)
      const matchesStatus = productStatus === 'All' || product.status === productStatus

      return matchesQuery && matchesStatus
    })
  }, [productSearch, productStatus])

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase()

    return storeOrdersAdminData.filter((order) => {
      const matchesQuery =
        query.length === 0 ||
        order.id.toLowerCase().includes(query) ||
        order.productTitle.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query)
      const matchesStatus = orderStatus === 'All' || order.status === orderStatus

      return matchesQuery && matchesStatus
    })
  }, [orderSearch, orderStatus])

  const productMetrics = useMemo(() => {
    const totalProducts = storeProductsAdminData.length
    const lowStock = storeProductsAdminData.filter((product) => product.status === 'Low Stock').length
    const outOfStock = storeProductsAdminData.filter((product) => product.status === 'Out of Stock').length
    const inventoryValue = storeProductsAdminData.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0,
    )

    return { totalProducts, lowStock, outOfStock, inventoryValue }
  }, [])

  const orderMetrics = useMemo(() => {
    const totalOrders = storeOrdersAdminData.length
    const delivered = storeOrdersAdminData.filter((order) => order.status === 'Delivered').length
    const pendingOrProcessing = storeOrdersAdminData.filter(
      (order) => order.status === 'Pending' || order.status === 'Processing',
    ).length
    const grossSales = storeOrdersAdminData
      .filter((order) => order.status !== 'Cancelled')
      .reduce((sum, order) => sum + order.total, 0)
    const deliveredRate = totalOrders === 0 ? 0 : Math.round((delivered / totalOrders) * 100)

    return {
      totalOrders,
      deliveredRate,
      pendingOrProcessing,
      grossSales,
    }
  }, [])

  const orderTrendValues = useMemo(() => {
    const perDay = new Map<string, number>()

    for (const order of storeOrdersAdminData) {
      const day = order.placedAt.slice(0, 10)
      perDay.set(day, (perDay.get(day) ?? 0) + 1)
    }

    return Array.from(perDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map((entry) => entry[1])
  }, [])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Store Management"
        subtitle="Monitor product inventory and order flow in one control surface for SportBook commerce operations."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Download className="w-4 h-4" />
              Export Snapshot
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <FilePlus2 className="w-4 h-4" />
              New Product
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Commerce" title="Store Operations">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.14em] ${
                  isActive
                    ? 'bg-primary-container text-surface-container-lowest'
                    : 'bg-surface-container-low text-primary/70'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {activeTab === 'Products' ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <AdminStatCard
              label="Total Products"
              value={String(productMetrics.totalProducts)}
              delta="Across all facilities"
              trend="flat"
            />
            <AdminStatCard
              label="Low Stock"
              value={String(productMetrics.lowStock)}
              delta="Needs replenishment"
              trend={productMetrics.lowStock > 0 ? 'down' : 'up'}
            />
            <AdminStatCard
              label="Out of Stock"
              value={String(productMetrics.outOfStock)}
              delta="Immediate action required"
              trend={productMetrics.outOfStock > 0 ? 'down' : 'up'}
            />
            <AdminStatCard
              label="Inventory Value"
              value={formatEgp(productMetrics.inventoryValue)}
              delta="Estimated current stock value"
              trend="up"
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <AdminStatCard
              label="Total Orders"
              value={String(orderMetrics.totalOrders)}
              delta="Current sample ledger"
              trend="up"
            />
            <AdminStatCard
              label="Delivered Rate"
              value={`${orderMetrics.deliveredRate}%`}
              delta="Delivery completion quality"
              trend={orderMetrics.deliveredRate >= 60 ? 'up' : 'flat'}
            />
            <AdminStatCard
              label="Pending / Processing"
              value={String(orderMetrics.pendingOrProcessing)}
              delta="Requires fulfillment follow-up"
              trend={orderMetrics.pendingOrProcessing > 0 ? 'flat' : 'up'}
            />
            <AdminStatCard
              label="Gross Sales"
              value={formatEgp(orderMetrics.grossSales)}
              delta="Cancelled orders excluded"
              trend="up"
            />
          </div>
        )}

        {activeTab === 'Orders' ? (
          <div className="mt-4 rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
            <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/55">Orders trend (daily volume)</p>
            <div className="mt-3">
              <AdminTrendBars
                values={orderTrendValues.length > 0 ? orderTrendValues : [1]}
                colorClassName="bg-secondary-container"
              />
            </div>
          </div>
        ) : null}
      </AdminPanel>

      <AdminPanel
        eyebrow={activeTab === 'Products' ? 'Catalog control' : 'Order operations'}
        title={activeTab === 'Products' ? 'Products Directory' : 'Orders Ledger'}
      >
        {activeTab === 'Products' ? (
          <>
            <AdminFilterBar
              searchValue={productSearch}
              onSearchChange={setProductSearch}
              searchPlaceholder="Search by product title, id, category, or facility"
              controls={
                <select
                  value={productStatus}
                  onChange={(event) =>
                    setProductStatus(event.target.value as (typeof productStatusOptions)[number])
                  }
                  className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
                >
                  {productStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              }
            />

            <div className="mt-4">
              <AdminTable
                items={filteredProducts}
                getRowKey={(product) => product.id}
                emptyMessage="No products match the current search and inventory filters."
                columns={[
                  {
                    key: 'product',
                    header: 'Product',
                    render: (product) => (
                      <div>
                        <p className="font-bold text-primary">{product.title}</p>
                        <p className="text-xs text-primary/60 mt-1">{product.id} • {product.category}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'facility',
                    header: 'Facility',
                    render: (product) => <p className="text-sm text-primary/75">{product.facility}</p>,
                  },
                  {
                    key: 'quantity',
                    header: 'Qty',
                    render: (product) => <p className="text-sm font-semibold text-primary">{product.quantity}</p>,
                  },
                  {
                    key: 'price',
                    header: 'Price',
                    render: (product) => <p className="text-sm font-semibold text-primary">{formatEgp(product.price)}</p>,
                  },
                  {
                    key: 'status',
                    header: 'Stock Status',
                    render: (product) => (
                      <AdminStatusPill label={product.status} tone={statusTone(product.status)} />
                    ),
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: () => (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.12em] bg-primary/10 text-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.12em] bg-red-500/15 text-red-700"
                        >
                          Archive
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </>
        ) : (
          <>
            <AdminFilterBar
              searchValue={orderSearch}
              onSearchChange={setOrderSearch}
              searchPlaceholder="Search by order id, customer, or product"
              controls={
                <select
                  value={orderStatus}
                  onChange={(event) => setOrderStatus(event.target.value as (typeof orderStatusOptions)[number])}
                  className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
                >
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              }
            />

            <div className="mt-4">
              <AdminTable
                items={filteredOrders}
                getRowKey={(order) => order.id}
                emptyMessage="No orders match the current search and status filters."
                columns={[
                  {
                    key: 'order',
                    header: 'Order',
                    render: (order) => (
                      <div>
                        <p className="font-bold text-primary">{order.id}</p>
                        <p className="text-xs text-primary/60 mt-1">{order.productId}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'product',
                    header: 'Product',
                    render: (order) => (
                      <div>
                        <p className="text-sm font-semibold text-primary">{order.productTitle}</p>
                        <p className="text-xs text-primary/60 mt-1">{order.customer}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'quantity',
                    header: 'Qty',
                    render: (order) => <p className="text-sm font-semibold text-primary">{order.quantity}</p>,
                  },
                  {
                    key: 'fulfillment',
                    header: 'Fulfillment',
                    render: (order) => (
                      <AdminStatusPill
                        label={order.fulfillment}
                        tone={order.fulfillment === 'Delivery' ? 'blue' : 'violet'}
                      />
                    ),
                  },
                  {
                    key: 'total',
                    header: 'Total',
                    render: (order) => <p className="text-sm font-semibold text-primary">{formatEgp(order.total)}</p>,
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (order) => <AdminStatusPill label={order.status} tone={statusTone(order.status)} />,
                  },
                  {
                    key: 'placedAt',
                    header: 'Placed At',
                    render: (order) => <p className="text-xs text-primary/65">{order.placedAt}</p>,
                  },
                ]}
              />
            </div>
          </>
        )}
      </AdminPanel>

      <AdminPanel eyebrow="System note" title="Roadmap hook">
        <div className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5 text-sm text-primary/75">
          <p>
            This v1 store management page is mock-data powered and ready to connect to API-backed product CRUD,
            order webhooks, and finance reconciliation in a follow-up iteration.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary">
            <Store className="w-3.5 h-3.5" />
            Commerce control surface ready
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}
