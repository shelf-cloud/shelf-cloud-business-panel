/* eslint-disable react-hooks/exhaustive-deps */
import { StorageRowProduct } from '@typings'
import React from 'react'
import DataTable from 'react-data-table-component'
import Image from 'next/image'
import StorageExpandedDetails from './StorageExpandedDetails'

type Props = {
  tableData: StorageRowProduct[]
  pending: boolean
}

const StorageTable = ({ tableData, pending }: Props) => {
  const caseInsensitiveSort = (
    rowA: StorageRowProduct,
    rowB: StorageRowProduct
  ) => {
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
      name: <span className="fw-bold fs-5">Image</span>,
      selector: (row: StorageRowProduct) => {
        return (
          <div
            style={{
              width: '70px',
              height: '60px',
              margin: '2px 0px',
              position: 'relative',
            }}
          >
            <Image
              src={
                row.image
                  ? row.image
                  : 'https://electrostoregroup.com/Onix/img/no-image.png'
              }
              alt="product Image"
              layout="fill"
              objectFit="contain"
              objectPosition="center"
            />
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
        <span className="fw-bold fs-5">
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
      name: <span className="fw-bold fs-5">Total Bins Used</span>,
      selector: (row: StorageRowProduct) => row.totalBins,
      sortable: true,
      compact: true,
      center: true,
    },
    {
      name: <span className="fw-bold fs-5">Total Quantity In Bin</span>,
      selector: (row: StorageRowProduct) => row.totalQuantity,
      sortable: true,
      compact: true,
      center: true,
    },
    {
      name: <span className="fw-bold fs-5">Estimated Monthly Cost</span>,
      selector: (row: StorageRowProduct) =>
        `$ ${row.currentBalance.toFixed(2)}`,
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
