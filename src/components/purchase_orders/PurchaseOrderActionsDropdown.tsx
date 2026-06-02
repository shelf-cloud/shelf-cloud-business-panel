import { useRouter } from 'next/router'
import { useContext, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@shadcn/ui/alert-dialog'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@shadcn/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'
import { PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import { Warehouse } from '@typesTs/warehouses/warehouse'
import axios from 'axios'
import { Loader2Icon, MoreVerticalIcon, Trash2Icon, WarehouseIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'

type Props = {
  purchaseOrder: PurchaseOrder
}

const emptyReceivingFromPo = {
  warehouse: {
    id: 0,
    name: '',
  },
  items: {},
}

const PurchaseOrderActionsDropdown = ({ purchaseOrder }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state, setReceivingFromPo }: any = useContext(AppContext)
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses()
  const { mutate } = useSWRConfig()
  const { generate_new_forecast_products } = useRPNewForecast()
  const [destinationDialogOpen, setDestinationDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(String(purchaseOrder.warehouseId || ''))
  const [isUpdatingDestination, setIsUpdatingDestination] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalReceivedQty = useMemo(
    () => purchaseOrder.poItems.reduce((total: number, item: PurchaseOrderItem) => total + Number(item.receivedQty || 0), 0),
    [purchaseOrder.poItems]
  )

  const totalInboundQty = useMemo(() => purchaseOrder.poItems.reduce((total: number, item: PurchaseOrderItem) => total + Number(item.inboundQty || 0), 0), [purchaseOrder.poItems])

  const canChangeDestination = !purchaseOrder.hasSplitting && totalInboundQty <= 0 && totalReceivedQty <= 0

  const canDeletePo = purchaseOrder.isOpen && purchaseOrder.poPayments.length <= 0 && totalInboundQty <= 0 && totalReceivedQty <= 0

  const selectedWarehouse = useMemo(() => warehouses.find((warehouse: Warehouse) => warehouse.warehouseId === Number(selectedWarehouseId)), [selectedWarehouseId, warehouses])

  const hasAvailableActions = canChangeDestination || canDeletePo

  const mutatePurchaseOrders = async () => {
    if (organizeBy == 'suppliers') {
      await mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
    } else if (organizeBy == 'orders') {
      await mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
    } else if (organizeBy == 'sku') {
      await mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
    }
  }

  const clearReceivingItemsForPo = () => {
    if (!state.receivingFromPo.items[purchaseOrder.poId]) return

    const nextItems = { ...state.receivingFromPo.items }
    delete nextItems[purchaseOrder.poId]

    if (Object.keys(nextItems).length <= 0) {
      setReceivingFromPo(emptyReceivingFromPo)
      return
    }

    setReceivingFromPo({
      ...state.receivingFromPo,
      items: nextItems,
    })
  }

  const handleUpdateDestination = async () => {
    if (!selectedWarehouse || Number(selectedWarehouseId) === purchaseOrder.warehouseId) return

    setIsUpdatingDestination(true)

    try {
      const { data } = await axios.post(`/api/purchaseOrders/updatePoDestination?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        poId: purchaseOrder.poId,
        warehouseId: selectedWarehouse.warehouseId,
        destinationSC: selectedWarehouse.isSCDestination ? 1 : 0,
        name3PL: selectedWarehouse.name3PL,
      })

      if (!data.error) {
        toast.success(data.msg || data.message || 'Purchase order destination updated.')
        clearReceivingItemsForPo()
        await mutatePurchaseOrders()
        setDestinationDialogOpen(false)
        return
      }

      toast.error(data.msg || data.message || 'Error updating purchase order destination.')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error updating purchase order destination.')
    } finally {
      setIsUpdatingDestination(false)
    }
  }

  const handleDeletePO = async () => {
    setIsDeleting(true)

    try {
      const { data } = await axios.post(`/api/purchaseOrders/deletePo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        poId: purchaseOrder.poId,
        orderNumber: purchaseOrder.orderNumber,
      })

      if (!data.error) {
        generate_new_forecast_products({
          skus: data.skus ?? [],
          productIds: data.productIds ?? [],
        })
        await mutatePurchaseOrders()
        toast.success(data.msg || data.message || 'Purchase order deleted.')
        setDeleteDialogOpen(false)
        return
      }

      toast.error(data.msg || data.message || 'Error deleting purchase order.')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error deleting purchase order.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!hasAvailableActions) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='tw:size-8' aria-label={`Actions for purchase order ${purchaseOrder.orderNumber}`}>
            <MoreVerticalIcon className='tw:size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className='tw:text-xs'
              disabled={!canChangeDestination}
              onSelect={(event) => {
                event.preventDefault()
                setSelectedWarehouseId(String(purchaseOrder.warehouseId || ''))
                setDestinationDialogOpen(true)
              }}>
              <WarehouseIcon className='tw:size-4' />
              Change destination
            </DropdownMenuItem>
            <DropdownMenuItem
              className='tw:text-xs'
              disabled={!canDeletePo}
              variant='destructive'
              onSelect={(event) => {
                event.preventDefault()
                setDeleteDialogOpen(true)
              }}>
              <Trash2Icon className='tw:size-4' />
              Delete PO
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={destinationDialogOpen} onOpenChange={setDestinationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Destination</DialogTitle>
            <DialogDescription>Select new warehouse destination for purchase order {purchaseOrder.orderNumber}.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field className='tw:flex-col'>
              <FieldLabel>Warehouse</FieldLabel>
              <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId} disabled={isLoadingWarehouses || isUpdatingDestination}>
                <SelectTrigger className='tw:w-full'>
                  <SelectValue placeholder={isLoadingWarehouses ? 'Loading warehouses...' : 'Select warehouse'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {warehouses
                      .filter((warehouse: Warehouse) => warehouse.isActive && !warehouse.id3PL)
                      .map((warehouse: Warehouse) => (
                        <SelectItem key={warehouse.warehouseId} value={String(warehouse.warehouseId)}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>
                Current destination: <span className='tw:font-medium tw:text-primary'>{purchaseOrder.warehouseName}</span>
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant='outline' disabled={isUpdatingDestination} onClick={() => setDestinationDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isUpdatingDestination || !selectedWarehouse || Number(selectedWarehouseId) === purchaseOrder.warehouseId} onClick={handleUpdateDestination}>
              {isUpdatingDestination && <Loader2Icon className='tw:size-4 tw:animate-spin' />}
              Update PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>Delete purchase order {purchaseOrder.orderNumber}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button variant='destructive' disabled={isDeleting} onClick={handleDeletePO}>
              {isDeleting && <Loader2Icon className='tw:size-4 tw:animate-spin' />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PurchaseOrderActionsDropdown
