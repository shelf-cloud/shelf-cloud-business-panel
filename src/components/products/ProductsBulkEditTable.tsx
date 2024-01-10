/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ProductsDetails } from '@typesTs/products/products'

type Props = {
  tableData: ProductsDetails[]
  pending: boolean
}

const ProductsBulkEditTable = ({ tableData, pending }: Props) => {
  const [selectedCells, setSelectedCells] = useState(new Set())
  const [editCell, setEditCell] = useState('')
  const [clipboard, _setClipboard] = useState([])

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        copySelectedRows()
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        pasteToSelectedRows()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCells, clipboard])

  const copySelectedRows = () => {
    // const copiedData = selectedRows.map(row => JSON.stringify(row));
    // setClipboard(copiedData);
    // Optional: Copy to system clipboard
    // navigator.clipboard.writeText(copiedData.join('\n'));
  }

  const pasteToSelectedRows = () => {
    // Implement paste logic based on your requirements
    // This might include updating the data array or handling the pasted data differently
  }

  const handleCellClick = (rowIndex: number, columnId: number) => {
    setEditCell(`${rowIndex}-${columnId}`)
  }

  // const handleCellValueChange = (event:any, rowIndex:number, columnId:number) => {
  //   const updatedData = tableData.map((row, index) => {
  //     if (index === rowIndex) {
  //       return { ...row, [columnId]: event.target.value };
  //     }
  //     return row;
  //   });
  //   setData(updatedData);
  // };

  const toggleCellSelection = (rowIndex: number, columnId: number) => {
    const cellId = `${rowIndex}-${columnId}`
    setSelectedCells((prevSelectedCells) => {
      const newSelectedCells = new Set(prevSelectedCells)
      if (newSelectedCells.has(cellId)) {
        newSelectedCells.delete(cellId)
      } else {
        newSelectedCells.add(cellId)
      }
      return newSelectedCells
    })
  }

  const columns: any = [
    {
      name: <span className='font-weight-bold fs-13'>SKU</span>,
      cell: (row: ProductsDetails) => row.sku,
      sortable: true,
      center: false,
      compact: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Title</span>,
      cell: (row: ProductsDetails, index: number, _column: any, id: number) => {
        const isEditing = editCell === `${index}-${id}`
        return isEditing ? (
          <input
            type='text'
            // className='form-control'
            value={row.title}
            // onChange={e => handleCellValueChange(e, index, id)}
            onBlur={() => setEditCell('')}
            autoFocus
          />
        ) : (
          <div
            onClick={() => toggleCellSelection(index, id)}
            className={selectedCells.has(`${index}-${id}`) ? 'border border-primary' : ''}
            style={{ cursor: 'pointer' }}
            onDoubleClick={() => handleCellClick(index, id)}>
            {row.title}
          </div>
        )
      },
      sortable: true,
      center: false,
      compact: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Description</span>,
      cell: (_row: ProductsDetails, index: number, _column: any, id: number) => {
        return <div>{`${index}-${id}`}</div>
      },
      sortable: true,
      center: false,
      compact: true,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        striped={true}
        dense
        responsive
        pagination={tableData.length > 100 ? true : false}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[50, 100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Products per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
      />
    </>
  )
}

export default ProductsBulkEditTable
