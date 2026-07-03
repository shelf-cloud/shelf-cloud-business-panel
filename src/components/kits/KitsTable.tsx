/* eslint-disable @next/next/no-img-element */
 
import Link from 'next/link'
import { useContext } from 'react'

import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import SCTooltip from '@components/ui/SCTooltip'
import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
// import TooltipComponent from '../constants/Tooltip'
import { NoImageAdress } from '@lib/assetsConstants'
import { loadBarcode, sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import { KitRow } from '@typings'
import DataTable from '@components/Common/DataTableSC'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'

import KitExpandedDetails from './KitExpandedDetails'

type Props = {
  tableData: KitRow[]
  pending: boolean
  changeProductState: (kitId: number, businessId: number, sku: string) => {}
  setMsg: string
  icon: string
  activeText: string
}

const KitsTable = ({ tableData, pending }: Props) => {
  const { state, setModalKitDetails } = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='font-bold text-[13px]'>Image</span>,
      selector: (cell: { image: any }) => {
        return (
          <div
            style={{
              width: '35px',
              height: '45px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={cell.image ? cell.image : NoImageAdress}
              alt='product Image'
              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
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
        <span className='font-bold text-[13px]'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: KitRow) => {
        return (
          <div className='text-[11.2px] flex flex-col justify-start items-start gap-0 pe-2'>
            <div className='flex flex-row justify-start items-center text-[11.2px]'>
              <Link href={`/kit/${row.kitId}/${row.sku}`}>
                <p className='m-0 p-0 text-primary font-semibold text-[13px]'>{row.sku}</p>
              </Link>
              <CopyTextToClipboard text={row.sku} label='SKU' />{' '}
            </div>
            <span className='m-0 p-0 text-black font-semibold text-[11.2px] text-wrap'>{row.title}</span>
            {row.note != '' && <i className='ri-information-fill text-[16.25px] text-warning' id={`tooltip${row.sku}`} />}
            {row.note != '' && (
              <SCTooltip target={`tooltip${row.sku}`} placement='right' key={`tooltip${row.sku}`}>
                <p className='text-[11.2px] text-primary m-0 p-0'>{row.note}</p>
              </SCTooltip>
            )}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.5,
      sortFunction: (rowA: KitRow, rowB: KitRow) => sortStringsCaseInsensitive(rowA.title.toLowerCase(), rowB.title.toLowerCase()),
      //   compact: true,
    },
    {
      name: (
        <span className='font-bold text-[13px]'>
          ASIN
          <br />
          FNSKU
          <br />
          Barcode
        </span>
      ),
      selector: (row: KitRow) => {
        return (
          <div className='text-[11.2px] flex flex-col justify-items-start gap-0'>
            {row.asin !== '' && (
              <div className='flex flex-row justify-start items-center'>
                <a className='m-0' href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank' rel='noopener noreferrer'>
                  {row.asin}
                </a>
                <CopyTextToClipboard text={row.asin} label='ASIN' />
              </div>
            )}
            {row.fnSku !== '' && (
              <p className='m-0'>
                {row.fnSku} <CopyTextToClipboard text={row.fnSku} label='FNSKU' />
              </p>
            )}
            {row.barcode !== '' && (
              <div className='flex flex-row justify-start items-center'>
                <a className='m-0 !text-info' href='#' onClick={() => loadBarcode(row)}>
                  {row.barcode}
                </a>
                <CopyTextToClipboard text={row.barcode} label='Barcode' />
              </div>
            )}
          </div>
        )
      },
      sortable: false,
      compact: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Quantity</span>,
      selector: (row: KitRow) => FormatIntNumber(state.currentRegion, row.quantity),
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: KitRow, rowB: KitRow) => sortNumbers(rowA.quantity, rowB.quantity),
    },
    {
      name: <span className='font-bold text-[13px]'>Unit Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.3,
      selector: (row: KitRow) => {
        return (
          <div className='text-[11.2px]' style={{ padding: '7px 0px' }}>
            <div className='flex flex-wrap -mx-3'>
              <span>
                Weight: {row.weight} {state.currentRegion == 'us' ? 'lb' : 'kg'}
              </span>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <span>
                Length: {row.length} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <span>
                Width: {row.width} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <span>
                Height: {row.height} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      name: <span className='font-bold text-[13px]'>Box Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.3,
      selector: (row: KitRow) => {
        return (
          <div className='text-[11.2px]' style={{ padding: '7px 5px 7px 0px' }}>
            <div className='flex flex-wrap -mx-3'>
              <span>
                Weight: {row.boxweight} {state.currentRegion == 'us' ? 'lb' : 'kg'}
              </span>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <span>
                Length: {row.boxlength} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <span>
                Width: {row.boxwidth} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <span>
                Height: {row.boxheight} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      name: <span className='font-bold text-[13px]'>Qty/Box</span>,
      selector: (row: KitRow) => row.boxQty,
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-bold text-[13px]'>Action</span>,
      sortable: false,
      compact: true,
      cell: (row: KitRow) => {
        return (
          <DropdownMenu>
            <div className='relative inline-block dropdown inline-block'>
            <DropdownMenuTrigger asChild>
              <button type='button' className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }}>
                <i className='mdi mdi-dots-vertical align-middle text-[19.5px] m-0 px-1 py-0' style={{ color: '#919FAF' }}></i>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='dropdown-menu-end'>
              <DropdownMenuItem className='edit-item-btn' onClick={() => setModalKitDetails(row.kitId, row.sku)}>
                <i className='ri-pencil-fill align-middle me-2 text-[16.25px] text-[var(--bs-secondary-color)]'></i>
                <span className='text-[11.2px] font-normal'>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className='edit-item-btn'>
                <Link href={`/kit/${row.kitId}/${row.sku}`}>
                  <i className='ri-file-list-line align-middle me-2 text-[16.25px] text-[var(--bs-secondary-color)]'></i>
                  <span className='text-[11.2px] font-normal text-dark'>View Details</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
            </div>
          </DropdownMenu>
        )
      },
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
        defaultSortFieldId={2}
        expandableRows
        expandableRowsComponent={KitExpandedDetails}
      />
    </>
  )
}

export default KitsTable
