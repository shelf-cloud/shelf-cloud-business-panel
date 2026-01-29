import { useContext, useEffect, useMemo, useState } from 'react'

import WholeSaleOrderModal from '@components/WholeSaleOrderModal'
import WholeSaleTable2 from '@components/WholeSaleTable2'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { wholesaleProductRow } from '@typings'
import { Button, Col } from 'reactstrap'

type Props = {
  completeData: wholesaleProductRow[]
  pending: boolean
  orderNumberStart: string
}

const MasterBoxes = ({ completeData, pending, orderNumberStart }: Props) => {
  const { state, setWholeSaleOrderModal } = useContext(AppContext)
  const [allData, setAllData] = useState<wholesaleProductRow[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [hasQtyError, setHasQtyError] = useState(false)
  const [error, setError] = useState([])

  useEffect(() => {
    if (!pending) {
      setAllData(JSON.parse(JSON.stringify(completeData)))
    }
  }, [pending, completeData])

  const filteredItems = useMemo(() => {
    if (searchValue === '') return allData

    return allData.filter(
      (item: wholesaleProductRow) =>
        item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
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
      <div className='d-flex flex-wrap justify-content-between align-items-center mb-2'>
        <div>
          <p className='fs-5 fw-semibold text-primary m-0'>Total SKUs in Order: {FormatIntNumber(state.currentRegion, orderProducts.length)}</p>
          <p className='fs-6 fw-normal text-primary m-0'>
            Total Quantity to Ship in Order:{' '}
            {FormatIntNumber(
              state.currentRegion,
              orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.totalToShip), 0)
            )}
          </p>
        </div>
        <div>
          <Button disabled={error.length > 0 || hasQtyError} className='fs-6 btn' color='primary' onClick={() => setWholeSaleOrderModal(!state.showWholeSaleOrderModal)}>
            Create Order
          </Button>
        </div>
      </div>
      <Col xs='12' className='d-flex justify-content-end align-items-center mb-2'>
        <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' minLength={3} debounceTimeout={300} widths='col-12 col-md-4' />
      </Col>
      <WholeSaleTable2 allData={allData} filteredItems={filteredItems} setAllData={setAllData} pending={pending} setError={setError} setHasQtyError={setHasQtyError} />
      {state.showWholeSaleOrderModal && <WholeSaleOrderModal orderNumberStart={orderNumberStart} orderProducts={orderProducts} />}
    </>
  )
}

export default MasterBoxes
