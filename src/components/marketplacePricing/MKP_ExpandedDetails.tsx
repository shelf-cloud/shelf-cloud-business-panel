/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { MKP_ExpandedRowProps } from '@hooks/marketplacePricing/useMarketplacePricing'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortNumbers } from '@lib/helperFunctions'
import { MKP_Marketplaces, MKP_Product } from '@typesTs/marketplacePricing/marketplacePricing'
import { ExpanderComponentProps } from 'react-data-table-component'
import DataTable from '@components/Common/DataTableSC'
import { DebounceInput } from 'react-debounce-input'
import { Card } from '@/components/migration-ui'

type Props = {
  data: MKP_Product
  expandedRowProps?: MKP_ExpandedRowProps
}

const MKP_ExpandedDetails: React.FC<ExpanderComponentProps<MKP_Product>> = ({ data, expandedRowProps }: Props) => {
  const { state }: any = useContext(AppContext)
  const { handleOtherCosts, handleProposedPrice, handleSetSingleMargin, handleSetProductMargin, handleNotes } = expandedRowProps!
  const columns: any = [
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Marketplace</span>,
      selector: (row: MKP_Marketplaces) => {
        return (
          <div className='tw:flex tw:flex-row tw:justify-start tw:gap-1 tw:items-center'>
            <div
              style={{
                width: '20px',
                height: '20px',
                margin: '0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.logo ?? NoImageAdress}
                onError={(e) => (e.currentTarget.src = NoImageAdress)}
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
            <span className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-[var(--bs-secondary-color)] tw:text-wrap'>{row.name}</span>
          </div>
        )
      },
      sortable: true,
      compact: false,
      left: true,
      grow: 2,
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>On Watch</span>,
      selector: (row: MKP_Marketplaces) =>
        row.proposedPrice > 0 && row.proposedPrice !== row.actualPrice ? <i className='mdi mdi-eye label-icon tw:align-middle tw:text-[16.25px] tw:me-2 tw:text-primary' /> : null,
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      with: 'fit-content',
      sortFunction: (rowA: MKP_Marketplaces, rowB: MKP_Marketplaces) =>
        sortNumbers(rowA.proposedPrice > 0 && rowA.proposedPrice !== rowA.actualPrice ? 1 : 0, rowB.proposedPrice > 0 && rowB.proposedPrice !== rowB.actualPrice ? 1 : 0),
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>1 Month Sales</span>,
      selector: (row: MKP_Marketplaces) => FormatIntNumber(state.currentRegion, row.unitsSold['1M'] ?? 0),
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>1 Year Sales</span>,
      selector: (row: MKP_Marketplaces) => FormatIntNumber(state.currentRegion, row.unitsSold['1Y'] ?? 0),
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Shipping Cost</span>,
      selector: (row: MKP_Marketplaces) => FormatCurrency(state.currentRegion, row.shippingToMarketpalce),
      sortable: true,
      center: true,
      compact: true,
      style: {
        backgroundColor: 'rgba(163, 228, 215, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Other Costs</span>,
      selector: (row: MKP_Marketplaces) => {
        return (
          <div className='tw:flex tw:flex-col tw:justify-start tw:items-center tw:gap-2 tw:w-full tw:px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm tw:text-[11.2px] tw:m-0 tw:py-0 tw:w-3/4 tw:text-center'
              min={0}
              id={`orderQty-${data.sku}-${row.storeId}`}
              value={row.storeOtherCosts}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleOtherCosts(data.sku, row.storeId, 0)
                } else {
                  handleOtherCosts(data.sku, row.storeId, parseFloat(e.target.value))
                }
              }}
              onClick={(e: any) => e.target.select()}
            />
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      style: {
        backgroundColor: 'rgba(163, 228, 215, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Current Price</span>,
      selector: (row: MKP_Marketplaces) => FormatCurrency(state.currentRegion, row.actualPrice),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Fee</span>,
      selector: (row: MKP_Marketplaces) => FormatCurrency(state.currentRegion, row.totalFees),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Profit</span>,
      selector: (row: MKP_Marketplaces) =>
        FormatCurrency(state.currentRegion, row.actualPrice - row.totalFees - data.sellerCost - data.inboundShippingCost - row.storeOtherCosts - row.shippingToMarketpalce),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Margin</span>,
      selector: (row: MKP_Marketplaces) => {
        const actualMargin =
          row.actualPrice <= 0
            ? 0
            : ((row.actualPrice - row.totalFees - data.sellerCost - data.inboundShippingCost - row.storeOtherCosts - row.shippingToMarketpalce) / row.actualPrice) * 100
        return <span className={actualMargin < 0 ? 'tw:text-danger' : 'tw:text-success'}>{`${FormatIntPercentage(state.currentRegion, actualMargin)} %`}</span>
      },
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Proposed Price</span>,
      selector: (row: MKP_Marketplaces) => {
        return (
          <div className='tw:flex tw:flex-col tw:justify-start tw:items-center tw:gap-2 tw:w-full tw:px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm tw:text-[11.2px] tw:m-0 tw:py-0 tw:w-3/4 tw:text-center'
              min={0}
              id={`orderQty-${data.sku}-${row.storeId}`}
              value={row.proposedPrice}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleProposedPrice(data.sku, row.storeId, 0)
                } else {
                  handleProposedPrice(data.sku, row.storeId, parseFloat(e.target.value))
                }
              }}
            />
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Fee</span>,
      selector: (row: MKP_Marketplaces) => FormatCurrency(state.currentRegion, row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Profit</span>,
      selector: (row: MKP_Marketplaces) =>
        FormatCurrency(
          state.currentRegion,
          row.proposedPrice -
            (row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee) -
            data.sellerCost -
            data.inboundShippingCost -
            row.storeOtherCosts -
            row.shippingToMarketpalce
        ),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Margin</span>,
      selector: (row: MKP_Marketplaces) => {
        const proposedMargin =
          ((row.proposedPrice -
            (row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee) -
            data.sellerCost -
            data.inboundShippingCost -
            row.storeOtherCosts -
            row.shippingToMarketpalce) /
            row.proposedPrice) *
          100
        return <span className={proposedMargin < 0 ? 'tw:text-danger' : 'tw:text-success'}>{`${FormatIntPercentage(state.currentRegion, proposedMargin)} %`}</span>
      },
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
    },
    {
      name: (
        <div className='tw:flex tw:flex-col tw:justify-start tw:items-center tw:gap-1 tw:w-full'>
          <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Set Margin</span>
          <div className='tw:flex tw:flex-row tw:justify-center tw:items-center tw:gap-2 tw:w-full tw:px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm tw:text-[11.2px] tw:m-0 tw:py-0 tw:w-1/2 tw:text-center'
              min={0}
              id={`productMargin-${data.sku}`}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleSetProductMargin(data.sku, 0)
                } else {
                  handleSetProductMargin(data.sku, parseFloat(e.target.value))
                }
              }}
            />
            <span className='tw:text-[var(--bs-secondary-color)]'>%</span>
          </div>
        </div>
      ),
      selector: (row: MKP_Marketplaces) => {
        return (
          <div className='tw:flex tw:flex-row tw:justify-center tw:items-center tw:gap-2 tw:w-full tw:px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm tw:text-[11.2px] tw:m-0 tw:py-0 tw:w-1/2 tw:text-center'
              min={0}
              id={`orderQty-${data.sku}-${row.storeId}`}
              value={row.proposedMargin}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleSetSingleMargin(data.sku, row.storeId, 0)
                } else {
                  handleSetSingleMargin(data.sku, row.storeId, parseFloat(e.target.value))
                }
              }}
            />
            <span className='tw:text-[var(--bs-secondary-color)]'>%</span>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
    },
    {
      name: <span className='tw:font-semibold tw:text-center tw:text-[11.2px]'>Notes</span>,
      selector: (row: MKP_Marketplaces) => (
        <DebounceInput
          element='textarea'
          debounceTimeout={600}
          className='form-control form-control-sm tw:text-[11.2px] tw:m-0'
          min={3}
          id={`notes-${data.sku}-${row.storeId}`}
          value={row.notes}
          onChange={(e) => {
            handleNotes(data.sku, row.storeId, e.target.value)
          }}
          onClick={(e: any) => e.target.select()}
        />
      ),
      sortable: false,
      center: true,
      compact: true,
    },
  ]
  return (
    <div className='tw:p-2'>
      <Card>
        <DataTable
          columns={columns}
          data={Object.values(data.marketplaces).filter((marketplace) => marketplace.unitsSold['1Y'] > 0) ?? []}
          striped={true}
          defaultSortFieldId={3}
          defaultSortAsc={false}
        />
      </Card>
    </div>
  )
}

export default MKP_ExpandedDetails
