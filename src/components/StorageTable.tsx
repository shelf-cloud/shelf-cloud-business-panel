/* eslint-disable @next/next/no-img-element */
 
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { StorageRowProduct } from '@typings'
import DataTable from 'react-data-table-component'

import StorageExpandedDetails from './StorageExpandedDetails'

type Props = {
  tableData: StorageRowProduct[]
  pending: boolean
}

const StorageTable = ({ tableData, pending }: Props) => {
  const { state }: any = useContext(AppContext)
  const caseInsensitiveSort = (rowA: StorageRowProduct, rowB: StorageRowProduct) => {
    const a = rowA.title.toLowerCase()
    const b = rowB.title.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const balanceSort = (rowA: StorageRowProduct, rowB: StorageRowProduct) => {
    const a = Number(rowA.currentBalance)
    const b = Number(rowB.currentBalance)

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const columns: any = [
    {
      name: <span className='fw-bold fs-5'>Image</span>,
      selector: (row: StorageRowProduct) => {
        return (
          <div
            style={{
              width: '70px',
              height: '60px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img src={row.image ? row.image : NoImageAdress} alt='Product Image' style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }} />
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
    },
    {
      name: (
        <span className='fw-bold fs-5'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: StorageRowProduct) => {
        return (
          <div>
            <p style={{ margin: '0px', fontWeight: '800' }}>{row.title}</p>
            <p style={{ margin: '0px' }}>{row.sku}</p>
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1,
      sortFunction: caseInsensitiveSort,
      //   compact: true,
    },
    {
      name: <span className='fw-bold fs-5'>Total Bins Used</span>,
      selector: (row: StorageRowProduct) => row.totalBins,
      sortable: true,
      compact: true,
      center: true,
    },
    {
      name: <span className='fw-bold fs-5'>Total Quantity In Bin</span>,
      selector: (row: StorageRowProduct) => row.totalQuantity,
      sortable: true,
      compact: true,
      center: true,
    },
    {
      name: <span className='fw-bold fs-5'>Estimated Monthly Cost</span>,
      selector: (row: StorageRowProduct) => FormatCurrency(state.currentRegion, row.currentBalance!),
      sortable: true,
      compact: true,
      center: true,
      sortFunction: balanceSort,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        expandableRows
        expandableRowsComponent={StorageExpandedDetails}
        striped={true}
        defaultSortFieldId={2}
      />
    </>
  )
}

export default StorageTable
