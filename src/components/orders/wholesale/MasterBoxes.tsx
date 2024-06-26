import WholeSaleOrderModal from '@components/WholeSaleOrderModal'
import WholeSaleTable2 from '@components/WholeSaleTable2'
import AppContext from '@context/AppContext'
import { wholesaleProductRow } from '@typings'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button, Input } from 'reactstrap'

type Props = {
  completeData: wholesaleProductRow[]
  pending: boolean
  orderNumberStart: string
}

const MasterBoxes = ({ completeData, pending, orderNumberStart }: Props) => {
  const { state, setWholeSaleOrderModal }: any = useContext(AppContext)
  const [allData, setAllData] = useState<wholesaleProductRow[]>([])
  const [serachValue, setSerachValue] = useState<string>('')
  const [hasQtyError, setHasQtyError] = useState(false)
  const [error, setError] = useState([])

  useEffect(() => {
    if (!pending) {
      setAllData(JSON.parse(JSON.stringify(completeData)))
    }
  }, [pending, completeData])

  const filteredItems = useMemo(() => {
    if (serachValue === '') return allData

    return allData.filter(
      (item: wholesaleProductRow) =>
        item?.title?.toLowerCase().includes(serachValue.toLowerCase()) ||
        serachValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
        item?.sku?.toLowerCase().includes(serachValue.toLowerCase()) ||
        item?.asin?.toLowerCase().includes(serachValue.toLowerCase()) ||
        item?.barcode?.toLowerCase().includes(serachValue.toLowerCase()) ||
        item?.fnSku?.toLowerCase().includes(serachValue.toLowerCase())
    )
  }, [allData, serachValue])

  const orderProducts = useMemo(() => {
    return allData.filter((item: wholesaleProductRow) => Number(item?.orderQty) > 0)
  }, [allData])

  return (
    <>
      <div className='d-flex justify-content-between align-center mt-3 mb-3'>
        <div>
          <h3 className='fs-3 fw-semibold text-primary'>Total SKUs in Order: {orderProducts.length}</h3>
          <h5 className='fs-5 fw-normal text-primary'>
            Total Quantity to Ship in Order: {orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.totalToShip), 0)}
          </h5>
        </div>
        <div>
          <Button disabled={error.length > 0 || hasQtyError} className='fs-6 btn' color='primary' onClick={() => setWholeSaleOrderModal(!state.showWholeSaleOrderModal)}>
            Create Order
          </Button>
        </div>
      </div>
      <form className='app-search d-flex flex-row justify-content-end align-items-center p-0 pb-2'>
        <div className='position-relative'>
          <Input
            type='text'
            className='form-control'
            placeholder='Search...'
            id='search-options'
            value={serachValue}
            onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
            onChange={(e) => {
              e.preventDefault()
              setSerachValue(e.target.value)
            }}
          />
          <span className='mdi mdi-magnify search-widget-icon'></span>
          <span className='mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none' id='search-close-options'></span>
        </div>
        <Button className='btn-soft-dark' onClick={() => setSerachValue('')}>
          Clear
        </Button>
      </form>
      <WholeSaleTable2 allData={allData} filteredItems={filteredItems} setAllData={setAllData} pending={pending} setError={setError} setHasQtyError={setHasQtyError} />
      {state.showWholeSaleOrderModal && <WholeSaleOrderModal orderNumberStart={orderNumberStart} orderProducts={orderProducts} />}
    </>
  )
}

export default MasterBoxes
