import { useContext, useMemo, useState } from 'react'

import WholeSaleTableSingleItem from '@components/WholeSaleTableSingleItem'
import SingleBoxesOrderModal from '@components/modals/orders/wholesale/SingleBoxesOrderModal'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { RegionInfoTypeUS, UserType } from '@hooks/useInitialState'
import { wholesaleProductRow } from '@typings'
import { Button, Col } from '@/components/migration-ui'

type Props = {
  completeData: wholesaleProductRow[]
  pending: boolean
  orderNumberStart: string
}

const SingleItems = ({ completeData, pending, orderNumberStart }: Props) => {
  const { state, setSingleBoxesOrderModal } = useContext(AppContext)
  const [editedState, setEditedState] = useState<{ source: wholesaleProductRow[]; data: wholesaleProductRow[] } | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [hasQtyError, setHasQtyError] = useState(false)
  const [error, setError] = useState([])

  const baseData = useMemo(() => {
    if (pending) return [] as wholesaleProductRow[]
    return JSON.parse(JSON.stringify(completeData)) as wholesaleProductRow[]
  }, [pending, completeData])

  const allData = useMemo(() => {
    if (editedState && editedState.source === completeData) return editedState.data
    return baseData
  }, [editedState, completeData, baseData])

  const handleSetAllData = (updater: wholesaleProductRow[] | ((prev: wholesaleProductRow[]) => wholesaleProductRow[])) => {
    setEditedState((prev) => {
      const previousData = prev && prev.source === completeData ? prev.data : baseData
      const nextData = typeof updater === 'function' ? updater(previousData) : updater
      return { source: completeData, data: nextData }
    })
  }

  const filteredItems = useMemo(() => {
    if (searchValue === '') return allData

    return allData.filter(
      (item: wholesaleProductRow) =>
        item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item?.barcode?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item?.fnSku?.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [allData, searchValue])

  const orderProducts = useMemo(() => {
    return allData.filter((item: wholesaleProductRow) => Number(item?.orderQty) > 0)
  }, [allData])

  return (
    <>
      <div className='tw:flex tw:justify-between tw:items-center'>
        <div>
          <p className='tw:text-[16.25px] tw:font-semibold tw:text-primary tw:m-0'>Total SKUs in Order: {orderProducts.length}</p>
          <p className='tw:text-[13px] tw:font-normal tw:text-primary tw:m-0'>
            Total Quantity to Ship in Order: {orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.totalToShip), 0)}
          </p>
          <p className='tw:text-[11.2px] tw:font-normal tw:text-danger tw:m-0'>
            *Minimum units in order: {(state?.user?.[state.currentRegion as keyof UserType] as RegionInfoTypeUS)?.minQtyForIndividualUnitsOrder}
          </p>
        </div>
        <div>
          <Button
            disabled={
              orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.totalToShip), 0) <
                (state?.user?.[state.currentRegion as keyof UserType] as RegionInfoTypeUS)?.minQtyForIndividualUnitsOrder ||
              error.length > 0 ||
              orderProducts.some((item: wholesaleProductRow) => Number(item.orderQty) > Number(item.quantity.quantity))
                ? true
                : false || hasQtyError
            }
            className='tw:text-[13px]'
            color='primary'
            onClick={() => setSingleBoxesOrderModal(!state.showSingleBoxesOrderModal)}>
            Create Order
          </Button>
        </div>
      </div>
      <Col xs='12' className='tw:flex tw:justify-end tw:items-center tw:mb-2'>
        <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' minLength={3} debounceTimeout={300} widths='col-12 col-md-4' />
      </Col>
      <WholeSaleTableSingleItem
        allData={allData}
        filteredItems={filteredItems}
        setAllData={handleSetAllData}
        pending={pending}
        setError={setError}
        setHasQtyError={setHasQtyError}
      />
      {state.showSingleBoxesOrderModal && <SingleBoxesOrderModal orderNumberStart={orderNumberStart} orderProducts={orderProducts} />}
    </>
  )
}

export default SingleItems
