/* eslint-disable @next/next/no-img-element */
import React from 'react'
import DataTable from 'react-data-table-component'

import { UnsellablesType } from '@typesTs/returns/unsellables'

type Props = {
  filterDataTable: UnsellablesType[]
  pending: boolean
}

const ReturnUnsellablesTable = ({ filterDataTable, pending }: Props) => {
  // const caseInsensitiveSort = (rowA: UnsellablesType, rowB: UnsellablesType) => {
  //   const a = rowA.title.toLowerCase()
  //   const b = rowB.title.toLowerCase()

  //   if (a > b) {
  //     return 1
  //   }

  //   if (b > a) {
  //     return -1
  //   }

  //   return 0
  // }

  const conditionalRowStyles = [
    {
      when: (row: UnsellablesType) => row.converted && !row.dispose,
      classNames: ['text-muted'],
    },
    {
      when: (row: UnsellablesType) => !row.converted && row.dispose,
      classNames: ['text-danger'],
    },
  ]

  const columns: any = [
    // {
    //   name: <span className='font-weight-bold fs-13'>Image</span>,
    //   selector: (row: UnsellablesType) => {
    //     return (
    //       <div
    //         style={{
    //           width: '70px',
    //           height: '60px',
    //           margin: '2px 0px',
    //           position: 'relative',
    //         }}>
    //         <img
    //           loading='lazy'
    //           src={
    //             row.image
    //               ? row.image
    //               : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
    //           }
    //           onError={(e) =>
    //             (e.currentTarget.src =
    //               'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
    //           }
    //           alt='product Image'
    //           style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
    //         />
    //       </div>
    //     )
    //   },
    //   sortable: false,
    //   center: true,
    //   compact: true,
    //   width: '80px',
    // },
    {
      name: <span className='fw-bolder fs-6'>SKU</span>,
      selector: (row: UnsellablesType) => row.sku,
      sortable: true,
      wrap: true,
      grow: 0.6,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>Title</span>,
      selector: (row: UnsellablesType) => row.title,
      sortable: true,
      wrap: true,
      grow: 1.5,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>RMA</span>,
      selector: (row: UnsellablesType) => row.returnRMA,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>Date</span>,
      selector: (row: UnsellablesType) => row.date,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-start fs-6'>Return</span>,
      selector: (row: UnsellablesType) => row.orderNumber,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-start fs-6'>Reason</span>,
      selector: (row: UnsellablesType) => row.returnReason,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-start fs-6'>Status</span>,
      selector: (row: UnsellablesType) => row.dispose ? 'Disposed' : row.converted ? 'Converted Sellable' : 'Unsellable',
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Unsellable Barcode</span>,
      selector: (row: UnsellablesType) => row.barcode,
      sortable: true,
      wrap: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
    },
  ]
  return (
    <>
      <DataTable
        // noTableHead={true}
        columns={columns}
        data={filterDataTable}
        progressPending={pending}
        striped={true}
        dense
        defaultSortAsc={false}
        defaultSortFieldId={4}
        pagination={filterDataTable.length > 100 ? true : false}
        paginationPerPage={100}
        paginationRowsPerPageOptions={[100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Orders per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
        conditionalRowStyles={conditionalRowStyles}
      />
    </>
  )
}

export default ReturnUnsellablesTable
