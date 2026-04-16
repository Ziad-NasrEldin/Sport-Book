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
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

const tabs = ['Products', 'Orders'] as const
const productStatusOptions = ['All', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const
const orderStatusOptions = ['All', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'] as const

type StoreTab = (typeof tabs)[number]

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminStoreManagementPage() {
  const [activeTab, setActiveTab] = useState<StoreTab>('Products')
  const [productSearch, setProductSearch] = useState('')
  const [productStatus, setProductStatus] = useState<(typeof productStatusOptions)[number]>('All')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState<(typeof orderStatusOptions)[number]>('All')

  const { data: productsResponse, loading: productsLoading, error: productsError } = useApiCall('/admin/store/products')
  const { data: ordersResponse, loading: ordersLoading, error: ordersError } = useApiCall('/admin/store/orders')

  const storeProductsAdminData = productsResponse?.data || productsResponse || []
  const storeOrdersAdminData = ordersResponse?.data || ordersResponse || []

  if (productsError) {
    return <APIErrorFallback error={productsError} onRetry={() => window.location.reload()} />
  }

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()

    return storeProductsAdminData.filter((product: any) => {
      const matchesQuery =
        query.length === 0 ||
        product.title?.toLowerCase()?.includes(query) ||
        product.id?.toLowerCase()?.includes(query) ||
        product.category?.toLowerCase()?.includes(query) ||
        product.facility?.name?.toLowerCase()?.includes(query)
      const matchesStatus = productStatus === 'All' || product.status === productStatus

      return matchesQuery && matchesStatus
    })
  }, [productSearch, productStatus, storeProductsAdminData])

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase()

    return storeOrdersAdminData.filter((order: any) => {
      const matchesQuery =
        query.length === 0 ||
        order.id?.toLowerCase()?.includes(query) ||
        order.product?.title?.toLowerCase()?.includes(query) ||
        order.user?.name?.toLowerCase()?.includes(query)
      const matchesStatus = orderStatus === 'All' || order.status === orderStatus

      return matchesQuery && matchesStatus
    })
  }, [orderSearch, orderStatus, storeOrdersAdminData])

  const productMetrics = useMemo(() => {
    const totalProducts = storeProductsAdminData.length
    const lowStock = storeProductsAdminData.filter((product: any) => product.status === 'LOW_STOCK').length
    const outOfStock = storeProductsAdminData.filter((product: any) => product.status === 'OUT_OF_STOCK').length
    const inventoryValue = storeProductsAdminData.reduce(
      (sum: number, product: any) => sum + (product.price || 0) * (product.quantity || 0),
      0,
    )

    return { totalProducts, lowStock, outOfStock, inventoryValue }
  }, [storeProductsAdminData])

  const orderMetrics = useMemo(() => {
    const totalOrders = storeOrdersAdminData.length
    const delivered = storeOrdersAdminData.filter((order: any) => order.status === 'DELIVERED').length
    const pendingOrProcessing = storeOrdersAdminData.filter(
      (order: any) => order.status === 'PENDING' || order.status === 'PROCESSING',
    ).length
    const grossSales = storeOrdersAdminData
      .filter((order: any) => order.status !== 'CANCELLED')
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    const deliveredRate = totalOrders === 0 ? 0 : Math.round((delivered / totalOrders) * 100)

    return {
      totalOrders,
      deliveredRate,
      pendingOrProcessing,
      grossSales,
    }
  }, [storeOrdersAdminData])

  const orderTrendValues = useMemo(() => {
    const perDay = new Map<string, number>()

    for (const order of storeOrdersAdminData) {
      const day = new Date(order.createdAt).toISOString().slice(0, 10)
      perDay.set(day, (perDay.get(day) ?? 0) + 1)
    }

    return Array.from(perDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map((entry) => entry[1])
  }, [storeOrdersAdminData])

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
              {productsLoading ? (
                <SkeletonTable rows={10} />
              ) : (
                <AdminTable
                  items={filteredProducts}
                  getRowKey={(product: any) => product.id}
                  emptyMessage="No products match the current search and inventory filters."
                  columns={[
                    {
                      key: 'product',
                      header: 'Product',
                      render: (product: any) => (
                        <div>
                          <p className="font-bold text-primary">{product.title || 'Unknown'}</p>
                          <p className="text-xs text-primary/60 mt-1">{product.id || 'Unknown'} • {product.category || 'Unknown'}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'facility',
                      header: 'Facility',
                      render: (product: any) => <p className="text-sm text-primary/75">{product.facility?.name || 'Unknown'}</p>,
                    },
                    {
                      key: 'quantity',
                      header: 'Qty',
                      render: (product: any) => <p className="text-sm font-semibold text-primary">{product.quantity || 0}</p>,
                    },
                    {
                      key: 'price',
                      header: 'Price',
                      render: (product: any) => <p className="text-sm font-semibold text-primary">{formatEgp(product.price || 0)}</p>,
                    },
                    {
                      key: 'status',
                      header: 'Stock Status',
                      render: (product: any) => (
                        <AdminStatusPill label={product.status || 'Unknown'} tone={statusTone(product.status || 'Unknown')} />
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
              )}
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
              {ordersLoading ? (
                <SkeletonTable rows={10} />
              ) : (
                <AdminTable
                  items={filteredOrders}
                  getRowKey={(order: any) => order.id}
                  emptyMessage="No orders match the current search and status filters."
                  columns={[
                    {
                      key: 'order',
                      header: 'Order',
                      render: (order: any) => (
                        <div>
                          <p className="font-bold text-primary">{order.id || 'Unknown'}</p>
                          <p className="text-xs text-primary/60 mt-1">{order.productId || 'Unknown'}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'product',
                      header: 'Product',
                      render: (order: any) => (
                        <div>
                          <p className="text-sm font-semibold text-primary">{order.product?.title || order.productId || 'Unknown'}</p>
                          <p className="text-xs text-primary/60 mt-1">{order.user?.name || order.userId || 'Unknown'}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'quantity',
                      header: 'Qty',
                      render: (order: any) => <p className="text-sm font-semibold text-primary">{order.quantity || 0}</p>,
                    },
                    {
                      key: 'fulfillment',
                      header: 'Fulfillment',
                      render: (order: any) => (
                        <AdminStatusPill
                          label={order.fulfillment || 'Pickup'}
                          tone={order.fulfillment === 'DELIVERY' ? 'blue' : 'violet'}
                        />
                      ),
                    },
                    {
                      key: 'total',
                      header: 'Total',
                      render: (order: any) => <p className="text-sm font-semibold text-primary">{formatEgp(order.total || 0)}</p>,
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      render: (order: any) => <AdminStatusPill label={order.status || 'Unknown'} tone={statusTone(order.status || 'Unknown')} />,
                    },
                    {
                      key: 'placedAt',
                      header: 'Placed At',
                      render: (order: any) => <p className="text-xs text-primary/65">{new Date(order.createdAt).toLocaleString()}</p>,
                    },
                  ]}
                />
              )}
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
