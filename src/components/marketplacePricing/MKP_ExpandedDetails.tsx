/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import DataTable, { ExpanderComponentProps } from 'react-data-table-component'
import { Card } from 'reactstrap'
import { MKP_Marketplaces, MKP_Product } from '@typesTs/marketplacePricing/marketplacePricing'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { DebounceInput } from 'react-debounce-input'
import { MKP_ExpandedRowProps } from '@hooks/marketplacePricing/useMarketplacePricing'
import { sortNumbers } from '@lib/helperFunctions'

type Props = {
  data: MKP_Product
  expandedRowProps?: MKP_ExpandedRowProps
}

const MKP_ExpandedDetails: React.FC<ExpanderComponentProps<MKP_Product>> = ({ data, expandedRowProps }: Props) => {
  const { state }: any = useContext(AppContext)
  const { handleOtherCosts, handleProposedPrice, handleSetSingleMargin, handleSetProductMargin, handleNotes } = expandedRowProps!
  const columns: any = [
    {
      name: <span className='fw-semibold text-center fs-7'>Marketplace</span>,
      selector: (row: MKP_Marketplaces) => {
        return (
          <div className='d-flex flex-row justify-content-start gap-1 align-items-center'>
            <div
              style={{
                width: '20px',
                height: '20px',
                margin: '0px',
                position: 'relative',
              }}>
              <img loading='lazy' src={row.logo ?? NoImageAdress} onError={(e) => (e.currentTarget.src = NoImageAdress)} alt='product Image' style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }} />
            </div>
            <span className='m-0 p-0 fs-7 text-muted text-wrap'>{row.name}</span>
          </div>
        )
      },
      sortable: true,
      compact: false,
      left: true,
      grow: 2,
    },
    {
      name: <span className='fw-semibold text-center fs-7'>On Watch</span>,
      selector: (row: MKP_Marketplaces) => (row.proposedPrice > 0 && row.proposedPrice !== row.actualPrice ? <i className='mdi mdi-eye label-icon align-middle fs-5 me-2 text-primary' /> : null),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      with: 'fit-content',
      sortFunction: (rowA: MKP_Marketplaces, rowB: MKP_Marketplaces) => sortNumbers(rowA.proposedPrice > 0 && rowA.proposedPrice !== rowA.actualPrice ? 1 : 0, rowB.proposedPrice > 0 && rowB.proposedPrice !== rowB.actualPrice ? 1 : 0),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>1 Month Sales</span>,
      selector: (row: MKP_Marketplaces) => FormatIntNumber(state.currentRegion, row.unitsSold['1M'] ?? 0),
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-semibold text-center fs-7'>1 Year Sales</span>,
      selector: (row: MKP_Marketplaces) => FormatIntNumber(state.currentRegion, row.unitsSold['1Y'] ?? 0),
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Shipping Cost</span>,
      selector: (row: MKP_Marketplaces) => FormatCurrency(state.currentRegion, row.shippingToMarketpalce),
      sortable: true,
      center: true,
      compact: true,
      style: {
        backgroundColor: 'rgba(163, 228, 215, 0.5)',
      },
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Other Costs</span>,
      selector: (row: MKP_Marketplaces) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-100 px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm fs-7 m-0 py-0 w-75 text-center'
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
      name: <span className='fw-semibold text-center fs-7'>Current Price</span>,
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
      name: <span className='fw-semibold text-center fs-7'>Fee</span>,
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
      name: <span className='fw-semibold text-center fs-7'>Profit</span>,
      selector: (row: MKP_Marketplaces) => FormatCurrency(state.currentRegion, row.actualPrice - row.totalFees - data.sellerCost - data.inboundShippingCost - row.storeOtherCosts - row.shippingToMarketpalce),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Margin</span>,
      selector: (row: MKP_Marketplaces) => {
        const actualMargin = row.actualPrice <= 0 ? 0 : ((row.actualPrice - row.totalFees - data.sellerCost - data.inboundShippingCost - row.storeOtherCosts - row.shippingToMarketpalce) / row.actualPrice) * 100
        return <span className={actualMargin < 0 ? 'text-danger' : 'text-success'}>{`${FormatIntPercentage(state.currentRegion, actualMargin)} %`}</span>
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
      name: <span className='fw-semibold text-center fs-7'>Proposed Price</span>,
      selector: (row: MKP_Marketplaces) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-100 px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm fs-7 m-0 py-0 w-75 text-center'
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
      name: <span className='fw-semibold text-center fs-7'>Fee</span>,
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
      name: <span className='fw-semibold text-center fs-7'>Profit</span>,
      selector: (row: MKP_Marketplaces) =>
        FormatCurrency(state.currentRegion, row.proposedPrice - (row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee) - data.sellerCost - data.inboundShippingCost - row.storeOtherCosts - row.shippingToMarketpalce),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '50px',
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Margin</span>,
      selector: (row: MKP_Marketplaces) => {
        const proposedMargin =
          ((row.proposedPrice - (row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee) - data.sellerCost - data.inboundShippingCost - row.storeOtherCosts - row.shippingToMarketpalce) / row.proposedPrice) * 100
        return <span className={proposedMargin < 0 ? 'text-danger' : 'text-success'}>{`${FormatIntPercentage(state.currentRegion, proposedMargin)} %`}</span>
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
        <div className='d-flex flex-column justify-content-start align-items-center gap-1 w-100'>
          <span className='fw-semibold text-center fs-7'>Set Margin</span>
          <div className='d-flex flex-row justify-content-center align-items-center gap-2 w-100 px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm fs-7 m-0 py-0 w-50 text-center'
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
            <span className='text-muted'>%</span>
          </div>
        </div>
      ),
      selector: (row: MKP_Marketplaces) => {
        return (
          <div className='d-flex flex-row justify-content-center align-items-center gap-2 w-100 px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm fs-7 m-0 py-0 w-50 text-center'
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
            <span className='text-muted'>%</span>
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
      name: <span className='fw-semibold text-center fs-7'>Notes</span>,
      selector: (row: MKP_Marketplaces) => (
        <DebounceInput
          element='textarea'
          debounceTimeout={600}
          className='form-control form-control-sm fs-7 m-0'
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
    <div className='p-2'>
      <Card>
        <DataTable columns={columns} data={Object.values(data.marketplaces).filter((marketplace) => marketplace.unitsSold['1Y'] > 0) ?? []} striped={true} defaultSortFieldId={3} defaultSortAsc={false} />
      </Card>
    </div>
  )
}

export default MKP_ExpandedDetails
