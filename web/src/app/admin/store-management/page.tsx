'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Download, FilePlus2, PackageCheck, Store, X } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { stringValue } from '@/lib/api/extract'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import { showToast } from '@/lib/toast'

const tabs = ['Products', 'Orders'] as const
const productStatusOptions = ['All', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const
const orderStatusOptions = ['All', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'] as const
const editableOrderStatuses = ['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'] as const

type StoreTab = (typeof tabs)[number]
type ProductStatus = Exclude<(typeof productStatusOptions)[number], 'All'>
type OrderStatus = Exclude<(typeof orderStatusOptions)[number], 'All'>

type ProductFormState = {
  facilityId: string
  name: string
  category: string
  description: string
  imageUrl: string
  price: string
  quantity: string
  status: ProductStatus
}

const INITIAL_PRODUCT_FORM: ProductFormState = {
  facilityId: '',
  name: '',
  category: 'Accessories',
  description: '',
  imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
  price: '250',
  quantity: '20',
  status: 'IN_STOCK',
}

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

function normalizeProductStatus(quantity: number, status: ProductStatus): ProductStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK'
  if (status === 'OUT_OF_STOCK') return quantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
  if (quantity <= 10 && status === 'IN_STOCK') return 'LOW_STOCK'
  return status
}

export default function AdminStoreManagementPage() {
  const [activeTab, setActiveTab] = useState<StoreTab>('Products')
  const [productSearch, setProductSearch] = useState('')
  const [productStatus, setProductStatus] = useState<(typeof productStatusOptions)[number]>('All')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState<(typeof orderStatusOptions)[number]>('All')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM)
  const [productFormError, setProductFormError] = useState<string | null>(null)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [archivingProductId, setArchivingProductId] = useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [hiddenProductIds, setHiddenProductIds] = useState<string[]>([])
  const [orderDraftStatuses, setOrderDraftStatuses] = useState<Record<string, OrderStatus>>({})
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const {
    data: productsResponse,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useApiCall('/admin-workspace/store/products')
  const {
    data: ordersResponse,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useApiCall('/admin-workspace/store/orders')
  const {
    data: facilitiesResponse,
    error: facilitiesError,
  } = useApiCall('/admin-workspace/facilities')

  const storeProductsAdminData = productsResponse?.data || productsResponse || []
  const storeOrdersAdminData = ordersResponse?.data || ordersResponse || []
  const facilities = facilitiesResponse?.data || facilitiesResponse || []

  useEffect(() => {
    const liveIds = new Set(storeProductsAdminData.map((product: any) => product.id))
    setHiddenProductIds((current) => current.filter((id) => liveIds.has(id)))
  }, [storeProductsAdminData])

  const openCreateProductModal = useCallback(() => {
    setEditingProductId(null)
    setProductForm({
      ...INITIAL_PRODUCT_FORM,
      facilityId: facilities[0]?.id || '',
    })
    setProductFormError(null)
    setIsProductModalOpen(true)
  }, [facilities])

  const openEditProductModal = useCallback((product: any) => {
    setEditingProductId(product.id)
    setProductForm({
      facilityId: product.facilityId || '',
      name: product.title || product.name || '',
      category: product.category || 'Accessories',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      price: String(product.price || 0),
      quantity: String(product.quantity || 0),
      status: (product.status || 'IN_STOCK') as ProductStatus,
    })
    setProductFormError(null)
    setIsProductModalOpen(true)
  }, [])

  const closeProductModal = useCallback(() => {
    setIsProductModalOpen(false)
    setEditingProductId(null)
    setProductFormError(null)
    setIsSavingProduct(false)
  }, [])

  const handleProductFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setProductForm((current) => ({
        ...current,
        [name]: value,
      }))
    },
    [],
  )

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()

    return storeProductsAdminData.filter((product: any) => {
      if (hiddenProductIds.includes(product.id)) {
        return false
      }

      const matchesQuery =
        query.length === 0 ||
        product.title?.toLowerCase()?.includes(query) ||
        product.id?.toLowerCase()?.includes(query) ||
        stringValue(product.category).toLowerCase().includes(query) ||
        product.facility?.name?.toLowerCase()?.includes(query)
      const matchesStatus = productStatus === 'All' || product.status === productStatus

      return matchesQuery && matchesStatus
    })
  }, [hiddenProductIds, productSearch, productStatus, storeProductsAdminData])

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

  const exportSnapshot = useCallback(() => {
    if (activeTab === 'Products') {
      const headers = 'Name,Facility,Category,Quantity,Price,Status'
      const rows = filteredProducts.map((product: any) =>
        [
          product.title || '',
          product.facility?.name || '',
          product.category || '',
          product.quantity || 0,
          product.price || 0,
          product.status || '',
        ].join(','),
      )

      const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `store-products-${new Date().toISOString().slice(0, 10)}.csv`
      anchor.click()
      URL.revokeObjectURL(url)
      showToast('Product snapshot downloaded.', 'success')
      return
    }

    const headers = 'Order ID,Customer,Product,Quantity,Total,Fulfillment,Status'
    const rows = filteredOrders.map((order: any) =>
      [
        order.id || '',
        order.user?.name || '',
        order.product?.title || '',
        order.quantity || 0,
        order.total || 0,
        order.fulfillment || '',
        order.status || '',
      ].join(','),
    )

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `store-orders-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    showToast('Order snapshot downloaded.', 'success')
  }, [activeTab, filteredOrders, filteredProducts])

  const handleSaveProduct = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setProductFormError(null)

      const quantity = Number(productForm.quantity)
      const price = Number(productForm.price)

      if (!productForm.facilityId || !productForm.name.trim() || !productForm.category.trim()) {
        setProductFormError('Facility, product name, and category are required.')
        return
      }

      if (Number.isNaN(quantity) || quantity < 0 || Number.isNaN(price) || price < 0) {
        setProductFormError('Price and quantity must be valid non-negative numbers.')
        return
      }

      setIsSavingProduct(true)

      try {
        const payload = {
          facilityId: productForm.facilityId,
          name: productForm.name.trim(),
          category: productForm.category.trim(),
          description: productForm.description.trim() || undefined,
          imageUrl: productForm.imageUrl.trim() || undefined,
          price,
          quantity,
          status: normalizeProductStatus(quantity, productForm.status),
        }

        if (editingProductId) {
          await api.patch(`/admin-workspace/store/products/${editingProductId}`, payload)
          showToast('Product updated successfully.', 'success')
        } else {
          await api.post('/admin-workspace/store/products', payload)
          showToast('Product created successfully.', 'success')
        }

        await refetchProducts()
        closeProductModal()
      } catch (error: any) {
        setProductFormError(error.message || 'Failed to save product.')
      } finally {
        setIsSavingProduct(false)
      }
    },
    [closeProductModal, editingProductId, productForm, refetchProducts],
  )

  const handleArchiveProduct = useCallback(
    async (product: any) => {
      setArchivingProductId(product.id)

      try {
        await api.delete(`/admin-workspace/store/products/${product.id}`)
        showToast('Product archived successfully.', 'success')
        await refetchProducts()
      } catch (error: any) {
        if (error.code === 'NOT_FOUND' || error.status === 404) {
          setHiddenProductIds((current) => (current.includes(product.id) ? current : [...current, product.id]))
          showToast('Product was already removed.', 'success')
          await refetchProducts()
        } else {
          showToast(error.message || 'Failed to archive product.', 'error')
        }
      } finally {
        setArchivingProductId(null)
      }
    },
    [refetchProducts],
  )

  const handleDeleteProduct = useCallback(
    async (product: any) => {
      setDeletingProductId(product.id)

      try {
        await api.delete(`/admin-workspace/store/products/${product.id}/permanent`)
        setHiddenProductIds((current) => (current.includes(product.id) ? current : [...current, product.id]))
        showToast('Product deleted permanently.', 'success')
        await refetchProducts()
      } catch (error: any) {
        if (error.code === 'NOT_FOUND' || error.status === 404) {
          setHiddenProductIds((current) => (current.includes(product.id) ? current : [...current, product.id]))
          showToast('Product was already deleted.', 'success')
          await refetchProducts()
        } else {
          showToast(error.message || 'Failed to delete product.', 'error')
        }
      } finally {
        setDeletingProductId(null)
      }
    },
    [refetchProducts],
  )

  const handleOrderDraftChange = useCallback((orderId: string, status: OrderStatus) => {
    setOrderDraftStatuses((current) => ({
      ...current,
      [orderId]: status,
    }))
  }, [])

  const handleUpdateOrderStatus = useCallback(
    async (orderId: string) => {
      const nextStatus = orderDraftStatuses[orderId]
      if (!nextStatus) {
        return
      }

      setUpdatingOrderId(orderId)

      try {
        await api.patch(`/admin-workspace/store/orders/${orderId}/status`, { status: nextStatus })
        showToast('Order status updated successfully.', 'success')
        await refetchOrders()
      } catch (error: any) {
        showToast(error.message || 'Failed to update order status.', 'error')
      } finally {
        setUpdatingOrderId(null)
      }
    },
    [orderDraftStatuses, refetchOrders],
  )

  if (productsError || ordersError || facilitiesError) {
    return <APIErrorFallback error={productsError || ordersError || facilitiesError!} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Store Management"
        subtitle="Monitor product inventory and order flow in one control surface for SportBook commerce operations."
        actions={
          <>
            <button
              type="button"
              onClick={exportSnapshot}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Snapshot
            </button>
            <button
              type="button"
              onClick={openCreateProductModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 transition-opacity"
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
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
            <p className="text-[10px] font-lexend uppercase tracking-[0.14em] text-primary/55">Orders trend (daily volume)</p>
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
                  onChange={(event) => setProductStatus(event.target.value as (typeof productStatusOptions)[number])}
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
                          <p className="mt-1 text-xs text-primary/60">
                            {product.id || 'Unknown'} • {stringValue(product.category)}
                          </p>
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
                      render: (product: any) => (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(product)}
                            className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchiveProduct(product)}
                            disabled={archivingProductId === product.id}
                            className="rounded-full bg-red-500/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {archivingProductId === product.id ? 'Archiving…' : 'Archive'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={deletingProductId === product.id}
                            className="rounded-full bg-red-700/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingProductId === product.id ? 'Deleting…' : 'Delete'}
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
                          <p className="mt-1 text-xs text-primary/60">{order.productId || 'Unknown'}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'product',
                      header: 'Product',
                      render: (order: any) => (
                        <div>
                          <p className="text-sm font-semibold text-primary">{order.product?.title || order.productId || 'Unknown'}</p>
                          <p className="mt-1 text-xs text-primary/60">{order.user?.name || order.userId || 'Unknown'}</p>
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
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (order: any) => {
                        const nextStatus = orderDraftStatuses[order.id] || order.status

                        return (
                          <div className="flex min-w-[220px] items-center gap-2">
                            <select
                              value={nextStatus}
                              onChange={(event) => handleOrderDraftChange(order.id, event.target.value as OrderStatus)}
                              className="rounded-full bg-surface-container-low px-3 py-2 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
                            >
                              {editableOrderStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.id)}
                              disabled={updatingOrderId === order.id || nextStatus === order.status}
                              className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingOrderId === order.id ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                        )
                      },
                    },
                  ]}
                />
              )}
            </div>
          </>
        )}
      </AdminPanel>

      <AdminPanel eyebrow="System note" title="Commerce status">
        <div className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5 text-sm text-primary/75">
          <p>
            Store management is now connected to live admin product creation, editing, archiving, permanent deletion, exports, and order status updates.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary">
            <Store className="h-3.5 w-3.5" />
            Commerce control surface live
          </div>
        </div>
      </AdminPanel>

      {isProductModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-lg)] border border-primary/10 bg-surface-container-lowest shadow-ambient">
            <div className="flex items-start justify-between gap-4 border-b border-primary/8 px-6 py-5">
              <div>
                <p className="text-[11px] font-lexend uppercase tracking-[0.16em] text-primary/55">Admin Action</p>
                <h3 className="mt-1 text-2xl font-black text-primary">
                  {editingProductId ? 'Edit Product' : 'New Product'}
                </h3>
                <p className="mt-2 text-sm text-primary/65">
                  Maintain facility inventory and publish store-ready products directly from the admin workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={closeProductModal}
                aria-label="Close product dialog"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 px-6 py-6">
              <section className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Facility</span>
                  <select
                    name="facilityId"
                    value={productForm.facilityId}
                    onChange={handleProductFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                    required
                  >
                    <option value="">Select a facility</option>
                    {facilities.map((facility: any) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Category</span>
                  <input
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFieldChange}
                    placeholder="Accessories"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                    required
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Product Name</span>
                  <input
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFieldChange}
                    placeholder="Premium Training Bib Set"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                    required
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Description</span>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFieldChange}
                    placeholder="Durable product description for store listings."
                    rows={3}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Image URL</span>
                  <input
                    name="imageUrl"
                    value={productForm.imageUrl}
                    onChange={handleProductFieldChange}
                    placeholder="https://example.com/product.jpg"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Price (EGP)</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={handleProductFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                    required
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Quantity</span>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    value={productForm.quantity}
                    onChange={handleProductFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                    required
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Status</span>
                  <select
                    name="status"
                    value={productForm.status}
                    onChange={handleProductFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  >
                    {productStatusOptions
                      .filter((status) => status !== 'All')
                      .map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                  </select>
                </label>
              </section>

              {productFormError ? (
                <div className="rounded-[var(--radius-default)] bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {productFormError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-primary/8 pt-4">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="inline-flex items-center rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PackageCheck className="h-4 w-4" />
                  {isSavingProduct ? 'Saving…' : editingProductId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
